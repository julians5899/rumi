import { getPresignedUploadUrl as s3PresignedUrl, getImageUrl as s3ImageUrl } from './s3';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

export interface StorageProvider {
  /** Returns a URL the client can PUT the file to */
  getUploadUrl(key: string, contentType: string): Promise<string>;
  /** Returns the public-facing URL to access the stored file */
  getFileUrl(key: string): string;
  /** Stores raw file data directly (used by local provider) */
  storeFile?(key: string, data: Buffer): Promise<void>;
}

// --------------- S3 Provider (dev / prod) ---------------
class S3StorageProvider implements StorageProvider {
  async getUploadUrl(key: string, contentType: string): Promise<string> {
    return s3PresignedUrl(key, contentType);
  }

  getFileUrl(key: string): string {
    return s3ImageUrl(key);
  }
}

// --------------- Local Provider (localdev) ---------------
const UPLOADS_DIR = join(process.cwd(), 'uploads');

class LocalStorageProvider implements StorageProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUploadUrl(key: string, _contentType: string): Promise<string> {
    // For local dev, we return a URL to our own API upload endpoint
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}/api/v1/uploads/${key}`;
  }

  getFileUrl(key: string): string {
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}/uploads/${key}`;
  }

  async storeFile(key: string, data: Buffer): Promise<void> {
    const filePath = join(UPLOADS_DIR, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  }
}

let _provider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!_provider) {
    _provider =
      process.env.STAGE === 'localdev'
        ? new LocalStorageProvider()
        : new S3StorageProvider();
  }
  return _provider;
}
