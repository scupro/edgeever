# EdgeEver Manual Online Deployment Guide

Deploy EdgeEver through GitHub and Cloudflare in your browser, without installing code locally or configuring a server.

---

## Prerequisites

- **GitHub Account** (for Forking the repository and enabling automated updates)
- **Cloudflare Account** (for hosting Worker logic and the SQLite D1 database)
- **An S3-compatible object storage account** (for note attachments and images; EdgeEver keeps no built-in Cloudflare R2 bucket)

---

## First Deployment

### Step 1: Fork the Repository

1. Visit the official EdgeEver repository: `https://github.com/scupro/edgeever`.
2. Click the **Fork** button at the top right to fork the repository into your GitHub account.

---

### Step 2: Create Storage & Database Resources in Cloudflare

Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/). If an entry moves, see the official [D1](https://developers.cloudflare.com/d1/get-started/) guide:

1. **Create a D1 Database**:
   - Under **Storage & databases**, open **D1 SQL Database** and click **Create database**.
   - Database name: exactly `edgeever`, then click **Create**.
2. **Prepare an S3-compatible object storage bucket** (for note attachments & images):
   - EdgeEver binds no Cloudflare R2 bucket. Any S3-compatible service works; Backblaze B2 (10 GB free), Tencent COS, Alibaba OSS, MinIO and Wasabi are common choices.
   - Create a bucket, for example `edgeever-resources`, and record its endpoint, region, bucket name, access key ID and secret access key.

---

### Step 3: Import the Project

1. Open **Workers & Pages**, click **Create application**, then **Get started** next to **Import a repository**. If the entry moves, see [Cloudflare's instructions](https://developers.cloudflare.com/workers/ci-cd/builds/#connect-a-new-worker).
2. Follow the prompts to connect your GitHub account, authorize access to your Fork, and select the Forked `edgeever` repository.
3. Project settings:
   - **Worker name**: `edgeever`, matching the `name` in the root `wrangler.toml`
   - **Git branch** (or **Production branch**): `main`
   - **Root directory**: Leave blank to use the repository root
   - Deploy command: npx wrangler deploy (keep Cloudflare's default; Workers Builds runs it online, not on your computer)
   - **API token**: The automatically generated token may lack D1 permissions. Select or create a User API Token scoped to the target account with D1 read and edit permissions; if permissions are insufficient, correct them based on the build log and retry.

The deployment command creates the `DB` binding and looks up the D1 UUID. Do not edit `wrangler.toml` or add duplicate bindings in the Dashboard.

---

### Step 4: Create the Project and Set the Administrator Password

Click **Save and Deploy** to create the Worker. The first build fails verification because the administrator Secret is missing; do not use the site URL yet. Under the Worker's **Settings** → **Variables and Secrets**, click **Add**, add this runtime Secret, and click **Deploy**:

| Type | Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Secret** | `EDGE_EVER_AUTH_PASSWORD` | Preferably at least 32 characters | Administrator login password |
| **Secret** | `EDGE_EVER_S3_SECRET_ACCESS_KEY` | The secret access key of the object storage account | Object storage credential |

`EDGE_EVER_AUTH_PASSWORD` is the variable name; its value is the administrator login password. It is a Worker runtime Secret, not a Workers Builds variable.

Return to the build history and retry. Confirm the build and live health check succeed.

---

### Step 5: Verify Deployment, Login & Automatic Updates

1. After deployment completes, Cloudflare will assign a default domain (e.g., `https://edgeever.your-subdomain.workers.dev`). You can also attach your own custom domain in the Worker settings under **Settings → Domains & Routes**.
2. Visit the health check endpoint in your browser: `https://<your-domain>/api/health`, and confirm it returns HTTP `200` with:
   ```json
   { "ok": true }
   ```
3. Open the homepage, log in with your configured administrator username (default: `admin`) and `EDGE_EVER_AUTH_PASSWORD`, and start using EdgeEver!
4. Go back to your Fork's **Actions** tab on GitHub and click **I understand my workflows, go ahead and enable them**.
5. Manually run **Update deployed EdgeEver** once to ensure future upstream updates can sync, and confirm Cloudflare receives the resulting build event.

---

## Advanced Configuration: Update Channels

By default, **Update deployed EdgeEver** follows official stable Release tags. To follow upstream `main` (Edge preview builds), set this **GitHub Repository Variable** on the Fork (**Settings → Secrets and variables → Actions → Variables**):

```text
EDGE_EVER_UPDATE_CHANNEL=edge
```

You can also pick `stable` / `edge` when manually running the workflow.

## Advanced Configuration: Instance Settings

To customize an instance, add non-secret values under the Worker's **Settings → Build → Build variables and secrets**:

| Build variable | Purpose |
| :--- | :--- |
| `EDGE_EVER_AUTH_USERNAME` | Administrator username; defaults to `admin` |
| `EDGE_EVER_WORKER_NAME` | Worker name |
| `EDGE_EVER_D1_DATABASE_NAME` | D1 database name; its UUID is discovered automatically |
| `EDGE_EVER_D1_DATABASE_ID` | Optional UUID fallback when discovery is unavailable |
| `EDGE_EVER_S3_ENDPOINT` | Object storage endpoint, for example `https://s3.us-west-004.backblazeb2.com` |
| `EDGE_EVER_S3_REGION` | Object storage region; defaults to `us-east-1` |
| `EDGE_EVER_S3_BUCKET` | Bucket that stores note attachments and images |
| `EDGE_EVER_S3_ACCESS_KEY_ID` | Object storage access key ID |
| `EDGE_EVER_S3_FORCE_PATH_STYLE` | Set to `true` for path-style-only services such as MinIO |
| `EDGE_EVER_WORKERS_DEV` | Enable or disable the `workers.dev` route |
| `EDGE_EVER_CUSTOM_DOMAIN` / `EDGE_EVER_ROUTE_PATTERN` | Custom routing |

Set a custom administrator username before retrying the initial build; changing the variable after the account exists does not rename it.

Older deployments must add the `EDGE_EVER_S3_*` object storage settings before they can store attachments; the former `RESOURCES` R2 binding is no longer used. Existing explicit build commands remain supported; see [Workers Builds configuration](cloudflare-workers-builds.md).

---

## Troubleshooting

- **Initial build failed**: Check the Worker **Deployments** log for “routing it through EdgeEver's validated deployment pipeline”. Verify that the D1 database is named exactly `edgeever`, that the Workers Builds API token has D1 read/edit permission, and that the `EDGE_EVER_S3_*` settings point at a reachable bucket. For an intentionally different D1 database, set `EDGE_EVER_D1_DATABASE_NAME`; add `EDGE_EVER_D1_DATABASE_ID` only if automatic UUID discovery is unavailable.
- **Updates not syncing**:
  1. On the Fork **Actions** tab, enable **Update deployed EdgeEver** (scheduled workflows are off by default on public forks).
  2. Run it once with **Run workflow**. Open the bilingual job **Summary**: it separately reports the upstream target, Git publish result, deployment trigger, and whether the live deployment was verified.
  3. A scheduled green run with *Already on upstream target* means Git already matches that channel — not a broken skip. A manual run automatically republishes the selected version when already aligned. If the live site is still old afterward, compare the Cloudflare **Deployments** commit SHA.
  4. Prefer this workflow over GitHub **Sync fork** for day-to-day upgrades.
  5. If an old updater fails with `without workflows permission`, use **Sync fork** once as the repository owner, then re-run **Update deployed EdgeEver**. The current updater preserves `.github/workflows/**`, so later product updates do not hit this permission boundary.
- **Push succeeded but site unchanged**: Confirm Workers Builds ran for the new `main` SHA. Optionally add repository secret `EDGE_EVER_CLOUDFLARE_DEPLOY_HOOK_URL` so the workflow can call a Deploy Hook after publish.
- **The Android or iOS app reports that Cloudflare or a security policy blocked sign-in**:
  1. Retry once and record the diagnostic code, Ray ID, and approximate time shown by the app. In Cloudflare, open **Security → Analytics → Events**, find the matching request, and check its **Service**, **Action**, and rule ID before changing any protection.
  2. Native apps call `/api/*` directly and cannot complete an interactive browser challenge. Do not try to solve this by embedding the challenge in the app. Keep EdgeEver authentication and its application-level login rate limits enabled, but make sure legitimate API traffic receives a machine-readable response instead of a Managed or Interactive Challenge.
  3. If a custom WAF rule issued the challenge, narrow that rule so it does not challenge the required `/api/*` requests. For Managed Rules or Super Bot Fight Mode false positives, create the smallest applicable [Skip rule or exception](https://developers.cloudflare.com/waf/custom-rules/skip/). Do not broadly disable unrelated security controls.
  4. Cloudflare's free Bot Fight Mode cannot be bypassed by a WAF Skip rule. If Security Events identifies Bot Fight Mode, follow Cloudflare's [false-positive guidance](https://developers.cloudflare.com/bots/troubleshooting/false-positives/) and either disable it or use a protection mode that supports scoped exceptions.
- **Reset or Manual Recovery**: See the [Cloudflare Manual Deployment Guide](manual-deploy.md).
