# Cloudflare Workers Builds

## Setup

For a manual import, follow the [online deployment guide](deploy-cloudflare-button.md), use the repository root and `main` branch, and keep the default `npx wrangler deploy` command. Existing projects can keep their explicit build and `bun run deploy:cloudflare-builds` commands.

Authorization:

1. Approve the **Cloudflare Workers & Pages** GitHub App for the deployment repository.
2. If the Agent integration needs a Cloudflare API token, use a User API Token limited to the target account.
3. Configure the deployment API token in Cloudflare under **Worker -> Settings -> Build -> API token**. The automatically generated token may lack D1 permissions; confirm it has D1 read and edit permissions for the target account before deploying.

Set `AUTH_PASSWORD` as a runtime Secret under the Worker's **Settings → Variables and Secrets**, not as a Builds variable.

Ordinary deployments use D1 `edgeever`, an S3-compatible object storage bucket, and username `admin`. Put optional non-secret instance settings under **Settings → Build → Build variables and secrets**, or directly in `wrangler.toml` (name, `workers_dev`, routes, `compatibility_date`, and a `[vars]` block). Build variables are available only during the build; the deploy command merges them into a temporary Wrangler configuration, with `wrangler.toml` values as defaults.

Without an explicit override, existing deployments keep their current administrator username.

## Updates and troubleshooting

- A push to `main` builds, applies D1 migrations, deploys, and verifies EdgeEver.
- No scheduled upstream-sync workflow ships with this repository. Upgrade deliberately:
  - `git remote add upstream https://github.com/scupro/edgeever.git`
  - `git fetch upstream --tags`
  - `git merge upstream/<tag>` (or `git rebase upstream/main`), resolve conflicts, then `git push`
  - Cloudflare builds the pushed commit, so the same pipeline applies migrations and verifies the deployment.
- Optional: repository secret `EDGE_EVER_CLOUDFLARE_DEPLOY_HOOK_URL` triggers a Cloudflare Deploy Hook after a successful push (useful when the Git integration misses a push).
- Build failure: inspect the Worker **Deployments** log and confirm the Deployment commit SHA matches Fork `main`.
