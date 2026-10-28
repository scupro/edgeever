import type { Context } from "hono";
import type { CloudflareStorageBindings } from "./cloudflare-storage-adapter";
import type { StorageAdapter } from "./storage-contract";

export type Bindings = {
  /** Runtime driver for public-only egress; no platform-specific business logic. */
  publicNetworkFetch?: (input: string, init: RequestInit) => Promise<Response>;
  /** The only persistence dependency exposed to application code. */
  storage: StorageAdapter;
  AUTH_USER?: string;
  EDGE_EVER_RUNTIME?: string;
  EDGE_EVER_CONTAINER_IMAGE?: string;
  EDGE_EVER_DEPLOYMENT_TRIGGER?: string;
  EDGE_EVER_DEPLOYMENT_METHOD?: string;
  EDGE_EVER_BUILD_CREATED_AT?: string;
  EDGE_EVER_BUILD_TRIGGER?: string;
  EDGE_EVER_BUILD_METHOD?: string;
  /** Creation time of the active deployment version, supplied by a runtime adapter. */
  deploymentVersionCreatedAt?: string;
  AUTH_PASSWORD?: string;
  AUTH_PASSWORD_HASH?: string;
  AUTH_PASSWORD_FALLBACK?: string;
  EDGE_EVER_SESSION_TTL_DAYS?: string;
  AUTH_LOGIN_WINDOW_SECONDS?: string;
  AUTH_LOGIN_USERNAME_MAX_ATTEMPTS?: string;
  AUTH_LOGIN_USERNAME_COOLDOWN_SECONDS?: string;
  AUTH_LOGIN_IP_MAX_ATTEMPTS?: string;
  AUTH_LOGIN_IP_COOLDOWN_SECONDS?: string;
  /** S3-compatible object storage used for attachments and imported files. */
  EDGE_EVER_S3_ENDPOINT?: string;
  EDGE_EVER_S3_REGION?: string;
  EDGE_EVER_S3_BUCKET?: string;
  EDGE_EVER_S3_ACCESS_KEY_ID?: string;
  EDGE_EVER_S3_SECRET_ACCESS_KEY?: string;
  EDGE_EVER_S3_FORCE_PATH_STYLE?: string;
  EDGE_EVER_S3_OBJECT_PREFIX?: string;
  /** Legacy decryption fallback; new credentials use auth-derived keys. */
  EDGE_EVER_STORAGE_ENCRYPTION_KEY?: string;
  EDGE_EVER_CREDENTIALS_ENCRYPTION_KEY?: string;
  EDGE_EVER_CREDENTIALS_ENCRYPTION_KEY_PREVIOUS?: string;
  EDGE_EVER_DEMO_MODE?: string;
  EDGE_EVER_LOCAL_DEMO_SEED?: string;
  EDGE_EVER_ALLOW_UNAUTHENTICATED?: string;
  /** HTTPS URL of the signed community registry. Unset disables the catalog. */
  EDGE_EVER_COMMUNITY_REGISTRY_URL?: string;
};

export type WorkerBindings = Omit<Bindings, "storage" | "publicNetworkFetch" | "deploymentVersionCreatedAt"> & CloudflareStorageBindings & {
  ASSETS: Fetcher;
  CF_VERSION_METADATA?: { timestamp?: string };
};

export type AuthContext = {
  kind: "user" | "agent";
  actorType: "user" | "agent";
  actorId: string | null;
  username: string;
  displayName: string | null;
  scopes: string[];
  workspaceId: string;
  role: "owner" | "member";
  sessionId?: string;
  tokenId?: string;
};

export type AuditActor = {
  actorType: "user" | "agent";
  actorId: string | null;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    auth: AuthContext;
  };
};

export type AppContext = Context<AppEnv>;
