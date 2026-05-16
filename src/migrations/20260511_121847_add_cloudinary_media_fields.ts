import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_resource_type" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_format" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_secure_url" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_bytes" numeric;
  ALTER TABLE "media" ADD COLUMN "cloudinary_created_at" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_version" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_version_id" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_width" numeric;
  ALTER TABLE "media" ADD COLUMN "cloudinary_height" numeric;
  ALTER TABLE "media" ADD COLUMN "cloudinary_duration" numeric;
  ALTER TABLE "media" ADD COLUMN "cloudinary_pages" numeric;
  ALTER TABLE "media" ADD COLUMN "cloudinary_selected_page" numeric DEFAULT 1;
  ALTER TABLE "media" ADD COLUMN "cloudinary_thumbnail_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN "cloudinary_resource_type";
  ALTER TABLE "media" DROP COLUMN "cloudinary_format";
  ALTER TABLE "media" DROP COLUMN "cloudinary_secure_url";
  ALTER TABLE "media" DROP COLUMN "cloudinary_bytes";
  ALTER TABLE "media" DROP COLUMN "cloudinary_created_at";
  ALTER TABLE "media" DROP COLUMN "cloudinary_version";
  ALTER TABLE "media" DROP COLUMN "cloudinary_version_id";
  ALTER TABLE "media" DROP COLUMN "cloudinary_width";
  ALTER TABLE "media" DROP COLUMN "cloudinary_height";
  ALTER TABLE "media" DROP COLUMN "cloudinary_duration";
  ALTER TABLE "media" DROP COLUMN "cloudinary_pages";
  ALTER TABLE "media" DROP COLUMN "cloudinary_selected_page";
  ALTER TABLE "media" DROP COLUMN "cloudinary_thumbnail_url";`)
}
