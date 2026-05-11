import type { CollectionConfig, Where } from 'payload'
import crypto from 'crypto'
import { APIError } from 'payload'

const isMasterAdmin = (user: any) => user?.role === 'master-admin'
const isAdmin = (user: any) => user?.role === 'admin'
const isUser = (user: any) => user?.role === 'user'

const nonMasterUsersOnly = (currentUserId?: string | number): Where => {
  if (currentUserId) {
    return {
      and: [
        {
          role: {
            not_equals: 'master-admin',
          },
        },
        {
          id: {
            not_equals: currentUserId,
          },
        },
      ],
    }
  }

  return {
    role: {
      not_equals: 'master-admin',
    },
  }
}
async function assignToGhost(req: any, postDocs: any[]) {
  const ghostUsers = await req.payload.find({
    collection: 'users',
    where: { email: { equals: 'deleted@system.local' } },
    overrideAccess: true,
    limit: 1,
  })

  let ghostId: number

  if (ghostUsers.totalDocs === 0) {
    const ghost = await req.payload.create({
      collection: 'users',
      data: {
        email: 'deleted@system.local',
        password: require('crypto').randomBytes(32).toString('hex'),
      } as any,
      overrideAccess: true,
    })
    await req.payload.update({
      collection: 'users',
      id: ghost.id as number,
      data: { status: 'rejected' } as any,
      overrideAccess: true,
    })
    ghostId = ghost.id as number
  } else {
    ghostId = ghostUsers.docs[0].id as number
  }

  for (const post of postDocs) {
    await req.payload.update({
      collection: 'posts',
      id: post.id,
      data: { author: ghostId } as any,
      overrideAccess: true,
    })
  }
}
const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  versions: false,

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'status'],

    // Hide Users collection from normal users.
    // They can still access their account/profile page.
    hidden: ({ user }) => {
      const loggedInUser = user as any
      return isUser(loggedInUser)
    },

    // Admin list filtering
    baseListFilter: ({ req }) => {
      const user = req.user as any

      if (!user) return null

      if (user.role === 'master-admin') {
        const filter: Where = {
          id: {
            not_equals: user.id,
          },
        }

        return filter
      }

      if (user.role === 'admin') {
        const filter: Where = {
          and: [
            {
              role: {
                not_equals: 'master-admin',
              },
            },
            {
              id: {
                not_equals: user.id,
              },
            },
          ],
        }

        return filter
      }

      const filter: Where = {
        id: {
          equals: '__never_match__',
        },
      }

      return filter
    },
    components: {
      beforeListTable: ['@/components/UserApprovalNotifications#default'],
    },
  },

  hooks: {
    afterRead: [
      async ({ doc }) => {
        doc.roleDisplay = doc.role
        doc.statusDisplay = doc.status

        return doc
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        const currentUser = req.user as any

        if (operation === 'create') {
          const usersCount = await req.payload.count({
            collection: 'users',
          })

          if (usersCount.totalDocs === 0) {
            data.role = 'master-admin'
            data.status = 'approved'
          } else if (isMasterAdmin(currentUser)) {
            data.role = data.role || 'user'
            data.status = data.status || 'approved'
          } else if (isAdmin(currentUser)) {
            data.role = 'user'
            data.status = 'approved'
          } else {
            data.role = 'user'
            data.status = 'pending'
            data.approvalToken = crypto.randomBytes(32).toString('hex')
            data.approvalTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }

        data.roleDisplay = data.role
        data.statusDisplay = data.status

        return data
      },
    ],

    beforeLogin: [
      async ({ user }) => {
        if (user.status === 'pending') {
          throw new APIError(
            'Your account is pending approval. Please wait for admin approval.',
            401,
            undefined,
            true,
          )
        }

        if (user.status === 'rejected') {
          throw new APIError(
            'Your account has been rejected. Please contact the administrator.',
            401,
            undefined,
            true,
          )
        }
      },
    ],

    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        const currentUser = req.user as any
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        const loginUrl = `${siteUrl}/admin/login`

        /**
         * CASE 1:
         * Admin / Master Admin creates user from admin panel
         * → User is already approved
         * → Send account created email
         */
        if (
          operation === 'create' &&
          currentUser &&
          (currentUser.role === 'admin' || currentUser.role === 'master-admin') &&
          doc.status === 'approved'
        ) {
          try {
            await req.payload.sendEmail({
              // For development with Resend testing, keep your own email
              // In production after domain verification, use: to: doc.email
              to: 'qusairang86@gmail.com',
              subject: 'Your Blog CMS Account Has Been Created',
              html: `
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background:#111827;padding:20px;text-align:center;">
                  <h2 style="margin:0;color:#ffffff;">Account Created</h2>
                </div>

                <div style="padding:24px;color:#333;">
                  <p>Hello ${doc.name || 'User'},</p>

                  <p>
                    Your account has been created on <strong>Blog CMS</strong>
                    by <strong>${currentUser.name || currentUser.email || 'Administrator'}</strong>.
                  </p>

                  <p>You can now login using this email:</p>

                  <p style="background:#f9fafb;padding:12px;border-radius:8px;">
                    <strong>${doc.email}</strong>
                  </p>

                  <div style="text-align:center;margin-top:24px;">
                    <a href="${loginUrl}"
                       style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
                      Login to Your Account
                    </a>
                  </div>

                  <p style="margin-top:24px;font-size:13px;color:#6b7280;">
                    If you do not know your password, please contact the administrator or use forgot password.
                  </p>
                </div>
              </div>
            </div>
          `,
            })

            console.log('ADMIN CREATED USER EMAIL SENT ✅')
          } catch (err) {
            console.error('ADMIN CREATED USER EMAIL ERROR ❌')
            console.error(err)
          }
        }

        /**
         * CASE 2:
         * Public signup
         * → User status is pending
         * → Create approval request in admin panel
         * → Send approval email to admin
         */
        if (operation === 'create' && doc.status === 'pending') {
          console.log('USER CREATED HOOK RUNNING ✅')
          console.log('Created user:', {
            id: doc.id,
            email: doc.email,
            role: doc.role,
            status: doc.status,
          })

          const approveLink = `${siteUrl}/api/users/approve?id=${doc.id}&action=approve&token=${doc.approvalToken}`
          const rejectLink = `${siteUrl}/api/users/approve?id=${doc.id}&action=reject&token=${doc.approvalToken}`

          try {
            const approvalDoc = await req.payload.create({
              collection: 'user-approvals',
              data: {
                userId: Number(doc.id),
                name: doc.name || 'No Name',
                email: doc.email,
                status: 'pending',
              },
              overrideAccess: true,
            })

            console.log('USER APPROVAL CREATED ✅', approvalDoc.id)
          } catch (err) {
            console.error('USER APPROVAL CREATE ERROR ❌')
            console.error(err)
          }

          try {
            await req.payload.sendEmail({
              to: 'qusairang86@gmail.com', // For development with Resend testing, keep your own email. In production after domain verification, use: to: doc.email
              subject: 'New User Signup Approval Required',
              html: `
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background:#111827;padding:20px;text-align:center;">
                  <h2 style="margin:0;color:#ffffff;">New User Signup</h2>
                </div>

                <div style="padding:24px;color:#333;">
                  <p>Hello Admin,</p>

                  <p>
                    A new user has requested access to <strong>Blog CMS</strong>.
                    Please review the request and approve or reject the account.
                  </p>

                  <p style="margin-bottom:8px;">User details:</p>

                  <div style="background:#f9fafb;padding:14px;border-radius:8px;border:1px solid #e5e7eb;">
                    <p style="margin:0 0 8px;">
                      <strong>Name:</strong> ${doc.name || 'No Name'}
                    </p>
                    <p style="margin:0;">
                      <strong>Email:</strong> ${doc.email}
                    </p>
                  </div>

                  <div style="text-align:center;margin-top:24px;">
                    <a href="${approveLink}"
                       style="display:inline-block;padding:12px 20px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;margin-right:8px;">
                      Approve User
                    </a>

                    <a href="${rejectLink}"
                       style="display:inline-block;padding:12px 20px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px;">
                      Reject User
                    </a>
                  </div>

                  <p style="margin-top:24px;font-size:13px;color:#6b7280;">
                    This request is also available inside the Blog CMS admin panel under User Approvals.
                  </p>
                </div>
              </div>
            </div>
          `,
            })

            console.log('ADMIN EMAIL SENT ✅')
          } catch (err) {
            console.error('ADMIN EMAIL ERROR ❌')
            console.error(err)
          }
        }

        /**
         * CASE 3:
         * User status changed to approved/rejected
         *
         * Important:
         * If UserApprovals.ts already sends approval/rejection email,
         * you can remove this section to avoid duplicate emails.
         */
        if (
          operation !== 'create' &&
          doc.status === 'approved' &&
          previousDoc?.status !== 'approved'
        ) {
          try {
            await req.payload.sendEmail({
              // For development with Resend testing, keep your own email
              // In production after domain verification, use: to: doc.email
              to: 'qusairang86@gmail.com',
              subject: 'Account Approved',
              html: `
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background:#16a34a;padding:20px;text-align:center;">
                  <h2 style="margin:0;color:#ffffff;">Account Approved</h2>
                </div>

                <div style="padding:24px;color:#333;">
                  <p>Hello ${doc.name || 'User'},</p>

                  <p>
                    Your account on <strong>Blog CMS</strong> has been approved.
                    You can now login and access your account.
                  </p>

                  <p>You can login using this email:</p>

                  <p style="background:#f9fafb;padding:12px;border-radius:8px;">
                    <strong>${doc.email}</strong>
                  </p>

                  <div style="text-align:center;margin-top:24px;">
                    <a href="${loginUrl}"
                       style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
                      Login to Your Account
                    </a>
                  </div>

                  <p style="margin-top:24px;font-size:13px;color:#6b7280;">
                    If you did not request this account, please contact the administrator.
                  </p>
                </div>
              </div>
            </div>
          `,
            })

            console.log('APPROVED EMAIL SENT ✅')
          } catch (err) {
            console.error('APPROVED EMAIL ERROR ❌')
            console.error(err)
          }
        }

        if (
          operation !== 'create' &&
          doc.status === 'rejected' &&
          previousDoc?.status !== 'rejected'
        ) {
          try {
            await req.payload.sendEmail({
              // For development with Resend testing, keep your own email
              // In production after domain verification, use: to: doc.email
              to: 'qusairang86@gmail.com',
              subject: 'Account Rejected',
              html: `
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background:#dc2626;padding:20px;text-align:center;">
                  <h2 style="margin:0;color:#ffffff;">Account Rejected</h2>
                </div>

                <div style="padding:24px;color:#333;">
                  <p>Hello ${doc.name || 'User'},</p>

                  <p>
                    Your account request for <strong>Blog CMS</strong> has been rejected.
                  </p>

                  <p>Rejected account:</p>

                  <p style="background:#f9fafb;padding:12px;border-radius:8px;">
                    <strong>${doc.email}</strong>
                  </p>

                  <p style="margin-top:24px;font-size:13px;color:#6b7280;">
                    If you believe this was a mistake, please contact the administrator.
                  </p>
                </div>
              </div>
            </div>
          `,
            })

            console.log('REJECTED EMAIL SENT ✅')
          } catch (err) {
            console.error('REJECTED EMAIL ERROR ❌')
            console.error(err)
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          // 1. Delete pending approvals
          const approvals = await req.payload.find({
            collection: 'user-approvals',
            where: {
              and: [{ userId: { equals: doc.id } }, { status: { equals: 'pending' } }],
            },
            overrideAccess: true,
            limit: 100,
          })

          for (const approval of approvals.docs) {
            await req.payload.delete({
              collection: 'user-approvals',
              id: approval.id,
              overrideAccess: true,
            })
          }

          // 2. Handle orphaned posts
          const posts = await req.payload.find({
            collection: 'posts',
            where: { author: { equals: doc.id } },
            overrideAccess: true,
            limit: 1000,
          })

          if (posts.totalDocs === 0) return

          const deletedBy = req.user as any
          const isSelfDelete = deletedBy?.id === doc.id

          if (isSelfDelete) {
            // Self-delete: check if reassignTo was passed via context
            const reassignTo = (req as any).context?.reassignTo as number | null

            if (reassignTo) {
              // Reassign to chosen user
              for (const post of posts.docs) {
                await req.payload.update({
                  collection: 'posts',
                  id: post.id,
                  data: { author: reassignTo } as any,
                  overrideAccess: true,
                })
              }
            } else {
              // No reassign — use ghost user
              await assignToGhost(req, posts.docs)
            }
          } else {
            // Admin/master-admin deleted the user — assign to them
            const adminId = deletedBy?.id as number
            for (const post of posts.docs) {
              await req.payload.update({
                collection: 'posts',
                id: post.id,
                data: { author: adminId } as any,
                overrideAccess: true,
              })
            }
          }

          console.log(`Handled ${posts.totalDocs} posts for deleted user ${doc.id}`)
        } catch (err) {
          console.error('afterDelete hook failed:', err)
        }
      },
    ],
  },

  access: {
    create: ({ req }) => {
      const user = req.user as any

      // Public signup allowed
      if (!user) return true

      // Master admin can create any user
      if (isMasterAdmin(user)) return true

      // Admin can create only normal users
      if (isAdmin(user)) return true

      return false
    },

    read: ({ req }) => {
      const user = req.user as any

      if (!user) return false

      // Master admin can read all users
      if (user.role === 'master-admin') return true

      // Admin can read all users for relationship fields to work
      // The Users table hiding is handled by baseListFilter
      if (user.role === 'admin') return true

      // Normal user can read only own profile/account
      const filter: Where = {
        id: {
          equals: user.id,
        },
      }

      return filter
    },
    update: ({ req }) => {
      const user = req.user as any

      if (!user) return false

      if (isMasterAdmin(user)) return true

      if (isAdmin(user)) {
        return nonMasterUsersOnly(user.id)
      }

      const ownProfileFilter: Where = {
        id: {
          equals: user.id,
        },
      }

      return ownProfileFilter
    },

    delete: ({ req }) => {
      const user = req.user as any

      if (!user) return false

      if (isMasterAdmin(user)) return true

      if (isAdmin(user)) {
        return nonMasterUsersOnly(user.id)
      }

      return false
    },
  },

  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,

      access: {
        // Email should not be changed after account creation
        update: () => false,
      },
    },

    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Master Admin', value: 'master-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],

      admin: {
        position: 'sidebar',

        // Show editable role only when master admin is editing OTHER users
        condition: (data, __, { user }) => {
          const loggedInUser = user as any

          if (loggedInUser?.role !== 'master-admin') return false

          // hide on own profile/account
          if (String(loggedInUser?.id) === String(data?.id)) return false

          return true
        },
      },

      access: {
        create: ({ req }) => {
          const user = req.user as any
          return user?.role === 'master-admin'
        },

        update: ({ req, id }) => {
          const user = req.user as any

          if (!user) return false

          // master admin cannot change own role
          if (String(user.id) === String(id)) return false

          return user.role === 'master-admin'
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],

      admin: {
        position: 'sidebar',

        // Show editable status only when master admin is editing OTHER users
        condition: (data, __, { user }) => {
          const loggedInUser = user as any

          if (loggedInUser?.role !== 'master-admin') return false

          // hide on own profile/account
          if (String(loggedInUser?.id) === String(data?.id)) return false

          return true
        },
      },

      access: {
        create: ({ req }) => {
          const user = req.user as any
          return user?.role === 'master-admin'
        },

        update: ({ req, id }) => {
          const user = req.user as any

          if (!user) return false

          // master admin cannot change own status
          if (String(user.id) === String(id)) return false

          return user.role === 'master-admin'
        },
      },
    },

    {
      name: 'roleDisplay',
      type: 'text',
      label: 'Role',
      admin: {
        position: 'sidebar',
        readOnly: true,

        // Show read-only role on own profile/account
        condition: (data, __, { user }) => {
          const loggedInUser = user as any

          return String(loggedInUser?.id) === String(data?.id)
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },

    {
      name: 'statusDisplay',
      type: 'text',
      label: 'Status',
      admin: {
        position: 'sidebar',
        readOnly: true,

        // Show read-only status on own profile/account
        condition: (data, __, { user }) => {
          const loggedInUser = user as any

          return String(loggedInUser?.id) === String(data?.id)
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },

    {
      name: 'approvalToken',
      type: 'text',
      admin: {
        hidden: true,
      },
    },

    {
      name: 'approvalTokenExpiry',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
  ],
}

export default Users
