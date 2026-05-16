import * as migration_20260504_055408 from './20260504_055408';
import * as migration_20260511_121847_add_cloudinary_media_fields from './20260511_121847_add_cloudinary_media_fields';

export const migrations = [
  {
    up: migration_20260504_055408.up,
    down: migration_20260504_055408.down,
    name: '20260504_055408',
  },
  {
    up: migration_20260511_121847_add_cloudinary_media_fields.up,
    down: migration_20260511_121847_add_cloudinary_media_fields.down,
    name: '20260511_121847_add_cloudinary_media_fields'
  },
];
