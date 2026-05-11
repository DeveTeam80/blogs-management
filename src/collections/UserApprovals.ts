import type { CollectionConfig } from 'payload'

const isAdminOrMaster = (user: any) => {
  return user?.role === 'admin' || user?.role === 'master-admin'
}

const UserApprovals: CollectionConfig = {
  slug: 'user-approvals',

  labels: {
    singular: 'User Approval',
    plural: 'User Approvals',
  },

  defaultSort: '-createdAt',

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
    // components: {
    //   beforeListTable: ['@/components/UserApprovalNotifications#default'],
    // },
    pagination: {
      defaultLimit: 5,
      limits: [5],
    },
    hidden: true,
  },

  access: {
    create: ({ req }) => {
      const user = req.user as any
      return isAdminOrMaster(user)
    },

    read: ({ req }) => {
      const user = req.user as any
      return isAdminOrMaster(user)
    },

    update: ({ req }) => {
      const user = req.user as any
      return isAdminOrMaster(user)
    },

    delete: ({ req }) => {
      const user = req.user as any
      return user?.role === 'master-admin'
    },
  },

  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user as any

        if (operation === 'update') {
          if (data.status === 'approved' || data.status === 'rejected') {
            data.reviewedBy = user?.id
            data.reviewedAt = new Date().toISOString()
          }
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (
          doc.status !== previousDoc?.status &&
          (doc.status === 'approved' || doc.status === 'rejected')
        ) {
          await req.payload.update({
            collection: 'users',
            id: doc.userId,
            data: {
              status: doc.status,
              approvalToken: null,
              approvalTokenExpiry: null,
            },
            overrideAccess: true,
          })

          if (doc.status === 'approved') {
            await req.payload.sendEmail({
              to: 'qusairang86@gmail.com', //  doc.email use later on development phase
              subject: 'Account Approved',
              html: `
                <h2>Account Approved</h2>
                <p>Your account has been approved. You can now login.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login">
                  Login
                </a>
              `,
            })
          }

          if (doc.status === 'rejected') {
            await req.payload.sendEmail({
              to: 'qusairang86@gmail.com', //  doc.email use later on development phase
              subject: 'Account Rejected',
              html: `
                <h2>Account Rejected</h2>
                <p>Your account request has been rejected.</p>
              `,
            })
          }
        }
        // Keep only latest 5 approval records
        try {
          const latestApprovals = await req.payload.find({
            collection: 'user-approvals',
            sort: '-createdAt',
            limit: 100,
            depth: 0,
            overrideAccess: true,
          })

          const oldApprovals = latestApprovals.docs.slice(5)

          await Promise.all(
            oldApprovals.map((approval) =>
              req.payload.delete({
                collection: 'user-approvals',
                id: approval.id,
                overrideAccess: true,
              }),
            ),
          )
        } catch (err) {
          console.error('USER APPROVAL CLEANUP ERROR ❌', err)
        }
      },
    ],
  },

  fields: [
    {
      name: 'userId',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'seenBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}

export default UserApprovals
