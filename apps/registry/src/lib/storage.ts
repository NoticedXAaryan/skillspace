import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'packages';

const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1', // MinIO requires a region, any string works
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // required for MinIO
});

export async function storePackage(name: string, version: string, data: Buffer): Promise<string> {
  const key = `${name}-${version}.skillpkg`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
    })
  );
  return key; // We return the key as the storagePath
}

export async function packageExists(name: string, version: string): Promise<boolean> {
  const key = `${name}-${version}.skillpkg`;
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') return false;
    throw error;
  }
}

export async function readPackage(name: string, version: string): Promise<Buffer> {
  const key = `${name}-${version}.skillpkg`;
  const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
  if (!response.Body) throw new Error('Package file not found in storage');
  
  // Convert Node.js readable stream to Buffer
  const stream = response.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
