import type { CollectionConfig, Where } from 'payload'

const publishedOnly: Where = {
  status: {
    equals: 'published',
  },
}

const isAdminOrMaster = (user: any) => {
  return user?.role === 'admin' || user?.role === 'master-admin'
}

export const Posts: CollectionConfig = {
  slug: 'posts',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'updatedAt'],
    components: {
      beforeListTable: ['@/components/ViewAllBlogsButton#default'],
      edit: {
        beforeDocumentControls: ['@/components/ViewOnSiteButton#default'],
      },
    },
  },

  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user as any

        if (operation === 'create' && user?.id) {
          data.author = user.id
        }

        if (data.status === 'published' && !data.publishedDate) {
          data.publishedDate = new Date().toISOString()
        }

        // Auto-generate slug from title
        if (data.title) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
            .replace(/\s+/g, '-') // replace spaces with hyphens
            .replace(/-+/g, '-') // remove consecutive hyphens
            .replace(/^-|-$/g, '') // remove leading/trailing hyphens
        }

        return data
      },
    ],
  },

  access: {
    read: ({ req }) => {
      const user = req.user as any

      // Public visitors can see only published posts
      if (!user) {
        return publishedOnly
      }

      // Admin and master admin can see all posts
      if (isAdminOrMaster(user)) {
        return true
      }

      // Normal users can see only their own posts
      const ownPostsOnly: Where = {
        author: {
          equals: user.id,
        },
      }

      return ownPostsOnly
    },

    create: ({ req }) => {
      const user = req.user as any

      // Any logged-in approved user can create posts
      return Boolean(user)
    },

    update: ({ req }) => {
      const user = req.user as any

      if (!user) return false

      // Admin and master admin can update all posts
      if (isAdminOrMaster(user)) {
        return true
      }

      // Normal users can update only their own posts
      const ownPostsOnly: Where = {
        author: {
          equals: user.id,
        },
      }

      return ownPostsOnly
    },

    delete: ({ req }) => {
      const user = req.user as any

      if (!user) return false

      // Admin and master admin can delete all posts
      if (isAdminOrMaster(user)) {
        return true
      }

      // Normal users can delete only their own posts
      const ownPostsOnly: Where = {
        author: {
          equals: user.id,
        },
      }

      return ownPostsOnly
    },
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from title.',
      },
    },

    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on blog cards and blog detail page.',
      },
    },

    {
      name: 'content',
      type: 'richText',
    },

    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'category',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'tags',
      type: 'array',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Mark as Featured',
      admin: {
        description: 'Featured post appears highlighted on the blog page.',
        position: 'sidebar',
      },
      access: {
        // Anyone can read
        read: () => true,
        // On create: any logged in user can set it
        create: ({ req }) => !!req.user,
        // On update: user can only update their own post's featured field
        // admin/master-admin can update any
        update: ({ req }) => {
          const user = req.user as any
          if (!user) return false
          if (user.role === 'admin' || user.role === 'master-admin') return true
          // normal user — access is checked at collection level (they can only edit own posts)
          return true
        },
      },
    },
  ],
}

export default Posts
