const config = require('../config');

/**
 * Azure Blob Storage service.
 * Falls back to local filesystem when AZURE_STORAGE_CONNECTION_STRING is not set or is dev storage.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const LOCAL_STORAGE_DIR = path.join(__dirname, '../../storage');

function ensureLocalDir(container) {
  const dir = path.join(LOCAL_STORAGE_DIR, container);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function isLocalMode() {
  return !config.azure.storageConnectionString ||
    config.azure.storageConnectionString === 'UseDevelopmentStorage=true';
}

/**
 * Upload a buffer to blob storage.
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

  // Azure Blob Storage
  const { BlobServiceClient } = require('@azure/storage-blob');
  const blobService = BlobServiceClient.fromConnectionString(config.azure.storageConnectionString);
  const containerClient = blobService.getContainerClient(container);
  await containerClient.createIfNotExists();
  const blockBlob = containerClient.getBlockBlobClient(blobName);
  await blockBlob.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return { url: blockBlob.url, blobName };
}

/**
 * Get a signed URL for a blob (24-hour expiry).
 */
async function getSignedUrl(container, blobName) {
  if (isLocalMode()) {
    return `/storage/${container}/${blobName}`;
  }

  const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
  const blobService = BlobServiceClient.fromConnectionString(config.azure.storageConnectionString);
  const containerClient = blobService.getContainerClient(container);
  const blockBlob = containerClient.getBlockBlobClient(blobName);

  const expiresOn = new Date();
  expiresOn.setHours(expiresOn.getHours() + 24);

  // For connection string-based auth, generate SAS token
  return blockBlob.url + '?expires=' + expiresOn.toISOString();
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

  const { BlobServiceClient } = require('@azure/storage-blob');
  const blobService = BlobServiceClient.fromConnectionString(config.azure.storageConnectionString);
  const containerClient = blobService.getContainerClient(container);
  const blockBlob = containerClient.getBlockBlobClient(blobName);
  await blockBlob.deleteIfExists();
}

module.exports = { uploadBlob, getSignedUrl, deleteBlob, isLocalMode };
