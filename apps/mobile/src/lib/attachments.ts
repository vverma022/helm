import {
  MAX_WIRE_MESSAGE_BYTES,
  type MessageAttachment,
  type HelmClient,
} from '@helm/client';

/** Leave enough JSON/base64 headroom for the websocket envelope, while also
 * respecting the daemon's 32 MiB per-attachment limit. */
export const MAX_ATTACHMENT_BYTES = Math.min(
  32 * 1024 * 1024,
  Math.floor((MAX_WIRE_MESSAGE_BYTES * 3) / 4) - 1024 * 1024,
);

export interface LocalAttachmentFile {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  /** Picker-provided data avoids reading the URI again when available. */
  base64?: string | null;
}

export async function importLocalAttachment(
  client: HelmClient,
  local: LocalAttachmentFile,
): Promise<MessageAttachment> {
  if (local.size != null && local.size > MAX_ATTACHMENT_BYTES) {
    throw attachmentTooLarge(local.name);
  }

  const encoded = local.base64 ?? await readBase64(local.uri);
  const dataBase64 = encoded.includes(',') ? encoded.slice(encoded.indexOf(',') + 1) : encoded;
  if (base64ByteLength(dataBase64) > MAX_ATTACHMENT_BYTES) {
    throw attachmentTooLarge(local.name);
  }

  const response = await client.request({
    type: 'importAttachment',
    name: local.name,
    upload: { kind: 'file', data_base64: dataBase64 },
  });
  if (response.type !== 'attachmentStored') {
    throw new Error(`Expected attachmentStored, received ${response.type}`);
  }

  return {
    path: response.attachment.path,
    mention: response.attachment.path,
    name: response.attachment.name,
    is_dir: response.attachment.isDir,
    is_image: local.mimeType?.startsWith('image/') === true || isImageName(local.name),
    blob_reference: response.attachment.reference,
  };
}

export function localFileName(uri: string, fallback: string): string {
  const segment = uri.split('/').at(-1)?.split(/[?#]/u)[0];
  if (!segment) return fallback;
  try {
    return decodeURIComponent(segment) || fallback;
  } catch {
    return segment;
  }
}

async function readBase64(uri: string): Promise<string> {
  // Kept behind the async boundary so Bun's pure projection tests do not load
  // an Expo native module. Metro still bundles the module for device builds.
  const { File } = await import('expo-file-system');
  return new File(uri).base64();
}

function base64ByteLength(value: string): number {
  const normalized = value.replace(/\s/gu, '');
  if (!normalized) return 0;
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

function isImageName(name: string): boolean {
  return ['avif', 'gif', 'heic', 'jpeg', 'jpg', 'png', 'svg', 'webp'].includes(
    name.split('.').at(-1)?.toLowerCase() ?? '',
  );
}

function attachmentTooLarge(name: string): Error {
  return new Error(`${name} is too large to attach (32 MB maximum)`);
}
