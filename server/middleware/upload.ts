import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db.js';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function getMaxUploadSizeBytes(): number {
  try {
    const row = db.prepare(`SELECT value FROM system_config WHERE key = 'MAX_FILE_UPLOAD_KB'`).get() as { value: string } | undefined;
    const kb = row ? parseInt(row.value, 10) : 50;
    return (isNaN(kb) ? 50 : kb) * 1024;
  } catch {
    return 50 * 1024;
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${uniqueSuffix}${safeExt}`);
  }
});

// Allow PDF, PNG, JPEG, JPG, WEBP
const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

export const documentUpload = multer({
  storage,
  limits: {
    // We will validate dynamically in the route or use dynamic getter
    fileSize: 10 * 1024 * 1024 // Initial upper bound; middleware enforces the precise configurable 50 KB check!
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
      return cb(new Error('Invalid file type. Only PDF, PNG, and JPEG documents are permitted.'));
    }
    cb(null, true);
  }
});
