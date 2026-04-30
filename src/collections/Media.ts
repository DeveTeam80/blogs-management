import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: true, // hides from sidebar nav
  },
  access: {
    read: () => true, // ← allow read so upload drawer works
    create: ({ req }) => !!req.user, // only logged in users can upload
    update: ({ req }) => !!req.user,
    delete: ({ req }) => {
      const user = req.user as any
      return user?.role === 'master-admin'
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
