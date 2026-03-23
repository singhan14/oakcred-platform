const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs');

const LOCAL_STORAGE_DIR = path.join(__dirname, '../../storage');

const s3Config = { region: process.env.AWS_REGION || 'eu-north-1' };
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}
const s3Client = new S3Client(s3Config);
const bucketName = process.env.AWS_S3_BUCKET;

function ensureLocalDir(container) {
  const dir = path.join(LOCAL_STORAGE_DIR, container);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function isLocalMode() {
  return process.env.USE_LOCAL_STORAGE === 'true' || !process.env.AWS_S3_BUCKET;
}

/**
 * Upload a buffer to S3 or local storage.
 * @returns {{ url: string, blobName: string }}
 */
async function uploadBlob(container, fileName, buffer, contentType = 'application/pdf') {
  const blobName = `${Date.now()}-${fileName}`;

  if (isLocalMode()) {
    const dir = ensureLocalDir(container);
    const filePath = path.join(dir, blobName);
    fs.writeFileSync(filePath, buffer);
    const url = `/storage/${container}/${blobName}`;
    console.log(`[LOCAL STORAGE] Saved: ${filePath}`);
    return { url, blobName };
  }

  const key = `${container}/${blobName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  const url = `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  return { url, blobName };
}

/**
 * Get a signed URL for a blob (24-hour expiry).
 */
async function getSignedUrl(container, blobName) {
  if (isLocalMode()) {
    return `/storage/${container}/${blobName}`;
  }

  const key = `${container}/${blobName}`;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getS3SignedUrl(s3Client, command, { expiresIn: 86400 });
}

/**
 * Delete a blob.
 */
async function deleteBlob(container, blobName) {
  if (isLocalMode()) {
    const filePath = path.join(LOCAL_STORAGE_DIR, container, blobName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  const key = `${container}/${blobName}`;
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

module.exports = { uploadBlob, getSignedUrl, deleteBlob, isLocalMode };
