import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import Users from './collections/Users'
import { Media } from './collections/Media'
import Posts from './collections/posts'
import { resendAdapter } from '@payloadcms/email-resend'
import { cloudinaryStorage } from 'payload-cloudinary'
import UserApprovals from './collections/UserApprovals'
import './lib/keepItAlive'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeLogin: ['@/components/BeforeLogin#default'],
      afterLogin: ['@/components/AfterLogin#default'],
      afterNavLinks: [
        '@/components/HideCloudinaryMediaInfo#default',
        '@/components/FloatingApprovalCard#default',
        '@/components/DeleteAccountLink#default',
        '@/components/HideDocId#default',
      ],
    },
  },

  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY!,
    defaultFromAddress: process.env.EMAIL_USER!,
    defaultFromName: 'Your Blog',
  }),

  collections: [Users, Media, Posts, UserApprovals],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 3, // limit connections
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 10000, // wait 10s before failing
      allowExitOnIdle: true,
    },
    push: false,
  }),
  sharp,
  plugins: [
    cloudinaryStorage({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key: process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      },
      collections: {
        media: true,
      },
    }),
  ],
})
