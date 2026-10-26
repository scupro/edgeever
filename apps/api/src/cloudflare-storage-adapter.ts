import type {
  BlobStoreAdapter,
  DatabaseAdapter,
  StorageAdapter,
} from "./storage-contract";
import { createWorkerS3BlobStore, type WorkerS3Config } from "./worker-s3-blob-store";

/** Native Worker bindings are mentioned only at this platform boundary. */
export type CloudflareStorageBindings = {
  DB: DatabaseAdapter;
};

/**
 * Deployment-provided object storage settings. The Worker no longer binds a
 * Cloudflare R2 bucket; attachments live in any S3-compatible object storage
 * service (Backblaze B2, Tencent COS, Alibaba OSS, MinIO, ...) that the
 * instance owner points the deployment at.
 */
export type CloudflareStorageEnvironment = {
  EDGE_EVER_S3_ENDPOINT?: string;
  EDGE_EVER_S3_REGION?: string;
  EDGE_EVER_S3_BUCKET?: string;
  EDGE_EVER_S3_ACCESS_KEY_ID?: string;
  EDGE_EVER_S3_SECRET_ACCESS_KEY?: string;
  EDGE_EVER_S3_FORCE_PATH_STYLE?: string;
  /** Optional key prefix inside the bucket, e.g. "edgeever". */
  EDGE_EVER_S3_OBJECT_PREFIX?: string;
};

const readBoolean = (value: string | undefined) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return false;
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

/**
 * Builds the S3-compatible configuration from deployment variables. Returns
 * null when the deployment did not provide a complete configuration.
 */
export const resolveWorkerS3Config = (
  environment: CloudflareStorageEnvironment,
): WorkerS3Config | null => {
  const endpoint = environment.EDGE_EVER_S3_ENDPOINT?.trim();
  const bucket = environment.EDGE_EVER_S3_BUCKET?.trim();
  const accessKeyId = environment.EDGE_EVER_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = environment.EDGE_EVER_S3_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    endpoint,
    region: environment.EDGE_EVER_S3_REGION?.trim() || "us-east-1",
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: readBoolean(environment.EDGE_EVER_S3_FORCE_PATH_STYLE),
    objectPrefix: environment.EDGE_EVER_S3_OBJECT_PREFIX?.trim() ?? "",
  };
};

/**
 * Adapts native Cloudflare bindings to the storage surface consumed by the
 * application. No route or service should construct this shape directly.
 */
export const createCloudflareStorageAdapter = (
  bindings: CloudflareStorageBindings,
  environment: CloudflareStorageEnvironment = {},
): StorageAdapter => {
  const config = resolveWorkerS3Config(environment);
  const resources: BlobStoreAdapter | undefined = config
    ? createWorkerS3BlobStore(config)
    : undefined;

  return {
    db: bindings.DB,
    resources,
    diagnostics: {
      database: "d1",
      resources: "s3",
      migrationTable: "d1_migrations",
    },
  };
};
