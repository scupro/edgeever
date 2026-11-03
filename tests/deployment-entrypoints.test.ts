import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  deploymentPrompts,
  manualDeploymentCopy,
} from "../apps/site/src/deployment-prompts";
import { mergeWranglerVars } from "../scripts/wrangler-runner.mjs";
import {
  edgeEverDeploymentEnvironment,
  hasPlaceholderD1Binding,
  shouldRunEdgeEverDeployment,
} from "../packages/wrangler/dispatch.mjs";

const repositoryRoot = resolve(import.meta.dir, "..");
const normalizeLineEndings = (value: string) => value.replace(/\r\n/g, "\n");
const readRepositoryFile = (path: string) =>
  normalizeLineEndings(readFileSync(resolve(repositoryRoot, path), "utf8"));
const extractTextPrompt = (document: string, sectionHeading: string) => {
  const sectionStart = document.indexOf(sectionHeading);
  if (sectionStart === -1) throw new Error(`Missing deployment section: ${sectionHeading}`);
  const match = document.slice(sectionStart).match(/```text\n([\s\S]*?)\n```/);
  if (!match?.[1]) throw new Error(`Missing deployment prompt after: ${sectionHeading}`);
  return match[1];
};
const extractSection = (document: string, sectionHeading: string) => {
  const sectionStart = document.indexOf(sectionHeading);
  if (sectionStart === -1) throw new Error(`Missing section: ${sectionHeading}`);
  const sectionEnd = document.indexOf("\n---", sectionStart);
  return document.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
};
const normalizeMarkdownCopy = (value: string) =>
  value.replace(/[`*]/g, "").replace(/\s+/g, " ").trim();
describe("Cloudflare deployment entrypoints", () => {
  test("all entrypoints converge on the common deployment pipeline", () => {
    const packageJson = JSON.parse(readRepositoryFile("package.json"));
    const scripts = packageJson.scripts as Record<string, string>;

    expect(scripts.deploy).toContain("bun run build:cloudflare");
    expect(scripts.deploy).toContain("EDGE_EVER_USE_EXISTING_AUTH_SECRET=true");
    expect(scripts.deploy).toContain("deploy:ci");
    expect(scripts["deploy:manual"]).toBe(
      "export EDGE_EVER_DEPLOYMENT_TRIGGER=manual EDGE_EVER_DEPLOYMENT_METHOD=local_cli && bun run deploy:doctor && bun run build:cloudflare && bun run deploy:ci",
    );
    expect(scripts["deploy:ci"]).toBe(
      "bun run db:migrate:remote && bun run deploy:worker && bun run deploy:verify",
    );
    expect(scripts["deploy:cloudflare-builds"]).toBe(
      "EDGE_EVER_USE_EXISTING_AUTH_SECRET=true bun run deploy:ci",
    );
    expect(scripts["build:cloudflare"]).toContain("bun run build:worker");

    const wranglerConfig = readRepositoryFile("wrangler.toml");
    expect(wranglerConfig).toContain('main = ".wrangler/edgeever-worker/index.js"');
    expect(wranglerConfig).toContain("no_bundle = true");
    expect(wranglerConfig).toContain("find_additional_modules = true");
    expect(wranglerConfig).toContain('globs = ["modules/*.js"]');
  });

  test("Cloudflare's default Wrangler command cannot bypass the deployment pipeline", () => {
    const packageJson = JSON.parse(readRepositoryFile("package.json"));
    const shimPackage = JSON.parse(readRepositoryFile("packages/wrangler/package.json"));
    const shim = readRepositoryFile("packages/wrangler/bin/wrangler.js");
    const englishGuide = readRepositoryFile("docs/deploy-cloudflare-button.md");
    const chineseGuide = readRepositoryFile("docs/deploy-cloudflare-button.zh-TW.md");

    expect(packageJson.devDependencies.wrangler).toBe("workspace:*");
    expect(shimPackage.name).toBe("wrangler");
    expect(shimPackage.dependencies["edgeever-wrangler-cli"]).toMatch(/^npm:wrangler@/);
    expect(shim).toContain('["run", "deploy"]');
    const placeholderConfig = 'database_id = "00000000-0000-0000-0000-000000000000"';
    const legacyConfig = 'database_id = "11111111-1111-1111-1111-111111111111"';
    expect(hasPlaceholderD1Binding(placeholderConfig)).toBe(true);
    expect(hasPlaceholderD1Binding(legacyConfig)).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy"],
      { WORKERS_CI: "1" },
      placeholderConfig,
    )).toBe(true);
    expect(shouldRunEdgeEverDeployment(["deploy"], {}, placeholderConfig)).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy"],
      { WORKERS_CI: "1" },
      legacyConfig,
    )).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy"],
      { WORKERS_CI: "1", WRANGLER_CONFIG: "custom.toml" },
      placeholderConfig,
    )).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy", "--config", "custom.toml"],
      { WORKERS_CI: "1" },
      placeholderConfig,
    )).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy", "--env", "production"],
      { WORKERS_CI: "1" },
      placeholderConfig,
    )).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy", "--name", "custom-worker"],
      { WORKERS_CI: "1" },
      placeholderConfig,
    )).toBe(false);
    expect(shouldRunEdgeEverDeployment(
      ["deploy"],
      { WORKERS_CI: "1", EDGE_EVER_WRANGLER_BYPASS_SHIM: "1" },
      placeholderConfig,
    )).toBe(false);
    expect(edgeEverDeploymentEnvironment({ WORKERS_CI: "1" }))
      .toMatchObject({
        EDGE_EVER_DEPLOYMENT_TRIGGER: "main_push",
        EDGE_EVER_DEPLOYMENT_METHOD: "cloudflare_workers_builds_default",
      });
    expect(englishGuide).toContain("Deploy command: npx wrangler deploy");
    expect(chineseGuide).toContain("Deploy command: npx wrangler deploy");
  });

  test("deployment verification lets piped diagnostics flush before exiting", () => {
    const verificationScript = readRepositoryFile("scripts/verify-deployment.mjs");

    expect(verificationScript).toContain("process.exitCode = 1");
    expect(verificationScript).not.toContain("process.exit(1)");
  });

  test("online deployment declares the required authentication Secret", () => {
    const example = readRepositoryFile(".dev.vars.example");
    expect(example).toMatch(/^AUTH_PASSWORD=\s*$/m);

    const packageJson = JSON.parse(readRepositoryFile("package.json"));
    expect(packageJson.cloudflare.bindings.AUTH_PASSWORD.description).toBeTruthy();

    const englishGuide = readRepositoryFile("docs/deploy-cloudflare-button.md");
    const chineseGuide = readRepositoryFile("docs/deploy-cloudflare-button.zh-TW.md");
    expect(englishGuide).toContain("Worker runtime Secret, not a Workers Builds variable");
    expect(chineseGuide).toContain("Worker 執行時 Secret，不是 Workers Builds 構建變數");
  });

  test("Workers Builds receives configuration but never the runtime password", () => {
    const setup = readRepositoryFile("scripts/cloudflare-workers-builds.mjs");

    expect(setup).toContain('"AUTH_USERNAME"');
    expect(setup).toContain('"AUTH_LOGIN_WINDOW_SECONDS"');
    expect(setup).not.toContain('"AUTH_PASSWORD",');
    expect(setup).not.toContain('"AUTH_PASSWORD_HASH",');
    expect(setup).not.toContain("Missing AUTH_PASSWORD");
    expect(setup).toContain("is_secret: isSecret");
    expect(setup).toContain('new Set(["S3_SECRET_ACCESS_KEY"])');
  });

  test("online deployment resolves the D1 id without editing the repository config", () => {
    const runner = readRepositoryFile("scripts/run-wrangler.mjs");
    const wranglerConfig = readRepositoryFile("wrangler.toml");
    const englishAgentDoc = readRepositoryFile("docs/agent-deploy-cloudflare.md");
    const chineseAgentDoc = readRepositoryFile("docs/agent-deploy-cloudflare.zh-TW.md");

    expect(wranglerConfig).toContain(
      'database_id = "00000000-0000-0000-0000-000000000000"',
    );
    expect(runner).toContain('"d1", "list", "--json"');
    expect(runner).toContain("findD1DatabaseIdByName");
    expect(runner).not.toContain("replace the database_id placeholder");
    expect(englishAgentDoc).toContain("automatically resolves the D1 UUID");
    expect(chineseAgentDoc).toContain("自動查詢 D1 UUID");
  });

  test("merges deployment variables into an existing [vars] table", () => {
    const config = [
      'name = "edgeever"',
      "",
      "[vars]",
      'AUTH_USER = "admin"',
      'CUSTOM = "keep"',
      "",
      "[observability]",
      "enabled = true",
      "",
    ].join("\n");

    const merged = mergeWranglerVars(config, ['AUTH_USER = "owner"', 'NEW = "x"']);

    expect(merged.match(/^\[vars\]$/gm)).toHaveLength(1);
    expect(merged).toContain('AUTH_USER = "owner"');
    expect(merged).not.toContain('AUTH_USER = "admin"');
    expect(merged).toContain('CUSTOM = "keep"');
    expect(merged).toContain('NEW = "x"');
    expect(merged).toContain("[observability]\nenabled = true");
    expect(mergeWranglerVars('name = "edgeever"\n', ['A = "b"']))
      .toContain('[vars]\nA = "b"');
  });

  test("keeps D1 resolver diagnostics out of Wrangler JSON stdout", () => {
    const workingDirectory = mkdtempSync(resolve(tmpdir(), "edgeever-wrangler-output-"));
    const wranglerBinDirectory = resolve(
      workingDirectory,
      "node_modules",
      "wrangler",
      "bin",
    );
    const queryOutput = JSON.stringify([{ results: [{ name: "users" }] }]);
    const inheritedEnvironment = Object.fromEntries(
      ["PATH", "Path", "PATHEXT", "SystemRoot", "ComSpec", "TEMP", "TMP"]
        .map((name) => [name, process.env[name]])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    const environment = {
      ...inheritedEnvironment,
      EDGE_EVER_INSTANCE: "",
      WRANGLER_CONFIG: resolve(workingDirectory, "wrangler.external.toml"),
    };

    try {
      mkdirSync(wranglerBinDirectory, { recursive: true });
      writeFileSync(
        resolve(workingDirectory, "wrangler.external.toml"),
        [
          'name = "edgeever"',
          'database_name = "edgeever"',
          'database_id = "00000000-0000-0000-0000-000000000000"',
          'bucket_name = "edgeever-resources"',
          'preview_bucket_name = "edgeever-resources-preview"',
          'migrations_dir = "migrations"',
          "",
        ].join("\n"),
      );
      writeFileSync(
        resolve(wranglerBinDirectory, "wrangler.js"),
        [
          'const args = process.argv.slice(2);',
          'if (args.includes("list")) {',
          '  process.stdout.write(JSON.stringify([{ name: "edgeever", uuid: "11111111-1111-1111-1111-111111111111" }]));',
          "} else {",
          `  process.stdout.write(${JSON.stringify(`${queryOutput}\n`)});`,
          "}",
          "",
        ].join("\n"),
      );

      const resultPath = resolve(workingDirectory, "result.json");
      const runnerArguments = [
        "d1",
        "execute",
        "DB",
        "--remote",
        "--command",
        "SELECT name FROM sqlite_master",
        "--json",
      ];
      const harness = spawnSync(
        "node",
        [
          "-e",
          [
            'const { spawnSync } = require("node:child_process");',
            'const { writeFileSync } = require("node:fs");',
            "const result = spawnSync(",
            "  process.env.EDGE_TEST_RUNTIME,",
            "  [process.env.EDGE_TEST_RUNNER, ...JSON.parse(process.env.EDGE_TEST_ARGUMENTS)],",
            '  { cwd: process.env.EDGE_TEST_CWD, encoding: "utf8", env: process.env },',
            ");",
            "writeFileSync(process.env.EDGE_TEST_RESULT, JSON.stringify({",
            "  status: result.status,",
            "  stdout: result.stdout,",
            "  stderr: result.stderr,",
            "  error: result.error?.message,",
            "}));",
          ].join("\n"),
        ],
        {
          env: {
            ...environment,
            EDGE_TEST_ARGUMENTS: JSON.stringify(runnerArguments),
            EDGE_TEST_CWD: workingDirectory,
            EDGE_TEST_RESULT: resultPath,
            EDGE_TEST_RUNNER: resolve(repositoryRoot, "scripts", "run-wrangler.mjs"),
            EDGE_TEST_RUNTIME: process.execPath,
          },
        },
      );
      expect(harness.status).toBe(0);
      const result = JSON.parse(readFileSync(resultPath, "utf8")) as {
        error?: string;
        status: number;
        stderr: string;
        stdout: string;
      };

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      expect(result.stdout).toBe(`${queryOutput}\n`);
      expect(result.stderr).toContain("[info] resolving Cloudflare D1 database id for edgeever");
      expect(result.stderr).toContain("[ok] resolved D1 database edgeever");
    } finally {
      rmSync(workingDirectory, { force: true, recursive: true });
    }
  });

  test("records the public Worker target reported by a CI deployment", () => {
    const workingDirectory = mkdtempSync(resolve(tmpdir(), "edgeever-deployment-target-"));
    const wranglerBinDirectory = resolve(
      workingDirectory,
      "node_modules",
      "wrangler",
      "bin",
    );
    const inheritedEnvironment = Object.fromEntries(
      ["PATH", "Path", "PATHEXT", "SystemRoot", "ComSpec", "TEMP", "TMP"]
        .map((name) => [name, process.env[name]])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    );

    try {
      mkdirSync(wranglerBinDirectory, { recursive: true });
      writeFileSync(
        resolve(workingDirectory, "wrangler.external.toml"),
        [
          'name = "edgeever"',
          "workers_dev = true",
          'database_name = "edgeever"',
          'database_id = "11111111-1111-1111-1111-111111111111"',
          'bucket_name = "edgeever-resources"',
          'preview_bucket_name = "edgeever-resources-preview"',
          'migrations_dir = "migrations"',
          "",
        ].join("\n"),
      );
      writeFileSync(
        resolve(wranglerBinDirectory, "wrangler.js"),
        [
          'if (process.argv.includes("deployments")) {',
          '  process.stdout.write(JSON.stringify({ versions: [{ version_id: "legacy-version", percentage: 100 }] }));',
          '} else if (process.argv.includes("versions")) {',
          '  process.stdout.write(JSON.stringify({ resources: { bindings: [',
          '    { name: "AUTH_USER", type: "plain_text", text: "legacy-owner" }',
          '  ] } }));',
          '} else if (process.argv.includes("deploy")) {',
          '  process.stdout.write("Uploaded edgeever\\nDeployed edgeever triggers (0.4 sec)\\n  https://edgeever.example.workers.dev\\nCurrent Version ID: version-1\\n");',
          "}",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        [resolve(repositoryRoot, "scripts", "run-wrangler.mjs"), "deploy"],
        {
          cwd: workingDirectory,
          encoding: "utf8",
          env: {
            ...inheritedEnvironment,
            CI: "true",
            AUTH_PASSWORD: "test-password",
            EDGE_EVER_S3_BUCKET: "legacy-user-resources",
            EDGE_EVER_INSTANCE: "",
            WRANGLER_CONFIG: resolve(workingDirectory, "wrangler.external.toml"),
          },
        },
      );

      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(
        resolve(workingDirectory, ".wrangler.deployment-targets.json"),
        "utf8",
      ))).toEqual({
        urls: ["https://edgeever.example.workers.dev"],
        versionId: "version-1",
      });
      const generatedConfig = readFileSync(
        resolve(workingDirectory, ".wrangler.generated.toml"),
        "utf8",
      );
      expect(generatedConfig).toContain('EDGE_EVER_S3_BUCKET = "legacy-user-resources"');
      expect(generatedConfig).toContain('AUTH_USER = "legacy-owner"');
    } finally {
      rmSync(workingDirectory, { force: true, recursive: true });
    }
  });


  test("public deployment documentation exposes only Fork and Agent paths", () => {
    const englishReadme = readRepositoryFile("README.md");
    const chineseReadme = readRepositoryFile("README.zh-TW.md");
    const traditionalChineseReadme = readRepositoryFile("README.zh-TW.md");
    const japaneseReadme = readRepositoryFile("README.ja.md");

    expect(englishReadme).not.toContain("deploy.workers.cloudflare.com");
    expect(englishReadme).not.toContain("Option C: Manual Deployment");
    expect(englishReadme).toContain("Fork https://github.com/scupro/edgeever");
    expect(chineseReadme).not.toContain("deploy.workers.cloudflare.com");
    expect(chineseReadme).not.toContain("方案 C：手動部署");
    expect(chineseReadme).toContain("Fork https://github.com/scupro/edgeever");
    expect(traditionalChineseReadme).not.toContain("deploy.workers.cloudflare.com");
    expect(traditionalChineseReadme).not.toContain("方案 C：手動部署");
    expect(traditionalChineseReadme).toContain("Fork https://github.com/scupro/edgeever");
    expect(japaneseReadme).not.toContain("deploy.workers.cloudflare.com");
    expect(japaneseReadme).not.toContain("方案 C：手動匯入");
    expect(japaneseReadme).toContain("Fork https://github.com/scupro/edgeever");
  });

  test("product site deployment prompts mirror the root READMEs", () => {
    const englishReadme = readRepositoryFile("README.md");
    const chineseReadme = readRepositoryFile("README.zh-TW.md");
    const siteDeploymentComponent = readRepositoryFile(
      "apps/site/src/components/agent-install-tabs.astro",
    );

    expect(deploymentPrompts["en-US"]).toBe(
      extractTextPrompt(englishReadme, "### Option A: Deploy with an AI Agent (Recommended)"),
    );
    expect(deploymentPrompts["zh-TW"]).toBe(
      extractTextPrompt(chineseReadme, "### 方案一：交給 AI Agent 部署（建議）"),
    );
    expect(siteDeploymentComponent).toContain('deploymentPrompts["en-US"]');
    expect(siteDeploymentComponent).toContain('deploymentPrompts["zh-TW"]');
    expect(siteDeploymentComponent).toContain('manualDeploymentCopy["en-US"]');
    expect(siteDeploymentComponent).toContain('manualDeploymentCopy["zh-TW"]');
    expect(siteDeploymentComponent).toContain("UnionPay");
    expect(siteDeploymentComponent).toContain("銀聯（UnionPay）");
    expect(siteDeploymentComponent).toContain("free storage allowance");
    expect(siteDeploymentComponent).toContain("免費儲存額度");
    expect(siteDeploymentComponent).not.toContain("dual-currency credit card");
    expect(siteDeploymentComponent).not.toContain("雙幣信用卡");
    expect(siteDeploymentComponent).not.toContain("China Merchants Bank");
    expect(siteDeploymentComponent).not.toContain("招商和浦發");

    for (const [locale, readme, heading, separator] of [
      ["en-US", englishReadme, "### Option B: Manual Online Deployment", ": "],
      ["zh-TW", chineseReadme, "### 方案二：手動線上部署", "："],
    ] as const) {
      const section = normalizeMarkdownCopy(extractSection(readme, heading));
      const manualCopy = manualDeploymentCopy[locale];
      expect(section).toContain(manualCopy.intro);
      manualCopy.steps.forEach((step, index) => {
        expect(section).toContain(
          normalizeMarkdownCopy(`${index + 1}. ${step.title}${separator}${step.body}`),
        );
      });
    }
  });

  test("AI Agent deployment remains fully online", () => {
    const englishAgentDoc = readRepositoryFile("docs/agent-deploy-cloudflare.md");
    const chineseAgentDoc = readRepositoryFile("docs/agent-deploy-cloudflare.zh-TW.md");

    expect(englishAgentDoc).toContain("Workers & Pages");
    expect(englishAgentDoc).toContain("no scheduled upstream-sync workflow");
    expect(englishAgentDoc).toContain("[vars]");
    expect(englishAgentDoc).not.toContain("bun run deploy:manual");
    expect(englishAgentDoc).not.toContain("deploy:setup");
    expect(englishAgentDoc).not.toContain(".env.local");
    expect(chineseAgentDoc).toContain("Workers & Pages");
    expect(chineseAgentDoc).toContain("不含任何定時同步上游的工作流程");
    expect(chineseAgentDoc).toContain("[vars]");
    expect(chineseAgentDoc).not.toContain("bun run deploy:manual");
    expect(chineseAgentDoc).not.toContain("bun run deploy:manual");
  });
});
