import { describe, expect, test } from 'bun:test';
import type { HelmClient } from '@helm/client';

import {
  importLocalAttachment,
  localFileName,
  MAX_ATTACHMENT_BYTES,
} from './attachments';

describe('mobile attachments', () => {
  test('imports local data through the daemon and retains display metadata', async () => {
    const commands: unknown[] = [];
    const client = {
      request: async (command: unknown) => {
        commands.push(command);
        return {
          type: 'attachmentStored',
          attachment: {
            reference: 'helm-attachment:file',
            path: '/daemon/blobs/photo.png',
            name: 'photo.png',
            isDir: false,
          },
        };
      },
    } as unknown as HelmClient;

    const attachment = await importLocalAttachment(client, {
      uri: 'file:///photo.png',
      name: 'photo.png',
      mimeType: 'image/png',
      size: 3,
      base64: 'data:image/png;base64,YWJj',
    });

    expect(commands).toEqual([{
      type: 'importAttachment',
      name: 'photo.png',
      upload: { kind: 'file', data_base64: 'YWJj' },
    }]);
    expect(attachment).toEqual({
      path: '/daemon/blobs/photo.png',
      mention: '/daemon/blobs/photo.png',
      name: 'photo.png',
      is_dir: false,
      is_image: true,
      blob_reference: 'helm-attachment:file',
    });
  });

  test('rejects an oversized file before reading or uploading it', async () => {
    const client = { request: () => Promise.reject(new Error('should not upload')) } as unknown as HelmClient;
    await expect(importLocalAttachment(client, {
      uri: 'file:///large.zip',
      name: 'large.zip',
      size: MAX_ATTACHMENT_BYTES + 1,
    })).rejects.toThrow('32 MB maximum');
  });

  test('derives a decoded name from a picker URI', () => {
    expect(localFileName('file:///tmp/Camera%20Photo.jpg?edited=1', 'photo.jpg'))
      .toBe('Camera Photo.jpg');
  });
});
