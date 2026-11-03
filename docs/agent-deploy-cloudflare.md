# AI Agent Cloudflare Deployment Guide

This document defines the standard operating specifications and conventions for AI Agents (and automated deployment scripts) deploying EdgeEver on Cloudflare.

> 💡 **Core Principle**: Pure Serverless architecture running entirely within Cloudflare free limits—no VPS or server purchasing, no Docker or SSL certificate configuration required.

---

## Standard Automated Deployment Steps

1. **Fork Repository**
   - Fork `scupro/edgeever` to the target GitHub account.

2. **Create Cloudflare Resources**
   - Create a D1 database named exactly `edgeever`.
   - Prepare an S3-compatible object storage bucket (Backblaze B2, Tencent COS, Alibaba OSS, MinIO, Wasabi, ...) and record its endpoint, region, bucket name and credentials.

3. **Cloudflare Project Import**
   - In Cloudflare **Workers & Pages**, create a Worker named `edgeever` by importing the Fork repository. Select the repository root and production branch `main`.
   - Keep the default Deploy command `npx wrangler deploy` in Cloudflare's Workers Builds settings. Cloudflare runs it in its build environment; the user does not run it on their computer. The repository routes it through EdgeEver's validated deployment pipeline. Do not create a Pages project for the application.
   - Select **Save and Deploy** to create the Worker. The initial build may fail because the administrator Secret has not been added yet; configure it in the next step, then retry.

4. **Configure Login Credentials & Instance Settings**
   - **Worker Secret**: After the Worker exists, add the runtime Secret `AUTH_PASSWORD` for the initial administrator password. Prefer a strong password of at least 32 characters.
   - Keep this password only as a Worker runtime Secret; do not copy it into Workers Builds variables. The standard deploy entrypoint reuses and verifies the existing Secret.
   - You may edit `wrangler.toml`, including adding a `[vars]` block for non-secret environment variables; the deployment command still generates the `DB` binding from these standard resource names, so do not duplicate bindings in the Dashboard.
   - For an existing Worker deployed from older instructions, do not ask the user to rename the administrator account. With no explicit override, deployment automatically preserves the live administrator username; object storage is always configured through the `EDGE_EVER_S3_*` deployment variables.

5. **Check Workers Builds Settings**
   - Keep the repository root, `main` branch, and default Deploy command `npx wrangler deploy` in Cloudflare's build settings. Existing deployments that already use the explicit `bun run build:cloudflare` and `bun run deploy:cloudflare-builds` commands there may keep them.
   - The deployment pipeline automatically resolves the D1 UUID from the `edgeever` database name and merges instance settings into a temporary generated Wrangler configuration. The tracked `wrangler.toml` may be customized freely — including `name`, `workers_dev`, `[vars]`, routes, and `compatibility_date` — because this Fork deploys its own instance rather than mirroring upstream.
   - Ensure the Workers Builds API token can read and edit D1. Advanced non-secret customization belongs in `EDGE_EVER_*` Workers Builds variables. For a differently named database, set `EDGE_EVER_D1_DATABASE_NAME`; set `EDGE_EVER_D1_DATABASE_ID` only if automatic UUID discovery is unavailable. Passwords remain runtime Secrets.

6. **Start Initial Build & Verify Service**
   - Retry the build after adding the runtime Secret and any requested username override. Once deployed, run the following automated verifications:
     - Check `https://<your-worker-domain>/api/health` returns HTTP `200` with JSON `{"ok": true}`.
     - Check `https://<your-worker-domain>/api/openapi.json` is reachable and returns JSON `{"ok": true}`.
     - Verify login API using the configured administrator username (default: `admin`) and `AUTH_PASSWORD`.

7. **Keep the Instance Updated**
   - This deployment is a plain Fork of `scupro/edgeever`; there is no scheduled upstream-sync workflow. Upgrade by pulling the desired upstream tag into the Fork and pushing it, which retriggers the Cloudflare build.
   - `git remote add upstream https://github.com/scupro/edgeever.git`, then `git fetch upstream --tags` and `git merge upstream/<tag>` (or rebase) on your deployment branch, resolve conflicts, and push.
   - Verify the redeploy through the `/api/health` check above and the Cloudflare **Deployments** entry for the pushed commit.

## Optional: Customize the Initial Administrator Username

Ordinary deployments use the default username `admin`; do not proactively ask the user whether to change it. Only when the user explicitly requests a custom administrator username, set `AUTH_USER` in Workers Builds variables before retrying the initial build and use that username during login verification. Changing only this variable after the administrator account exists does not rename that account.
