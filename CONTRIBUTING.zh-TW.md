# 為 EdgeEver 貢獻程式碼

繁體中文 | [English](CONTRIBUTING.md)

感謝您為 EdgeEver 貢獻程式碼。用於 Cloudflare 部署的 Fork 也可以提交程式碼貢獻，但部署與開發必須使用不同的分支。

## 將部署分支與貢獻分支分開

如果您的 Fork 用於部署 EdgeEver：

- 將 Fork 的 `main` 視為僅用於部署的分支，並交由 **Update deployed EdgeEver** 管理。
- 不要直接在這個 `main` 分支上開發功能。
- 日常開發和部署更新時，不要透過 GitHub **Sync fork** 更新部署用的 `main`。
- 每項程式碼貢獻都應從官方倉庫最新的 `upstream/main` 建立獨立分支。

部署更新工作流只會更新 Fork 的 `main`，不會修改您的貢獻分支。

## 建立貢獻分支

克隆您的 Fork，並將官方倉庫新增為 `upstream`：

```sh
git clone https://github.com/<您的帳號>/edgeever.git
cd edgeever
git remote add upstream https://github.com/scupro/edgeever.git
git fetch upstream
```

從官方最新的 `main` 建立新分支，不要從部署分支開始開發：

```sh
git switch -c feat/簡短說明 upstream/main
```

完成修改並提交後，將貢獻分支推送到您的 Fork：

```sh
git push -u origin feat/簡短說明
```

然後建立以下 Pull Request：

```text
<您的帳號>/edgeever:feat/簡短說明
    -> tianma-if/edgeever:main
```

提交這個 Pull Request 時，您的 Fork `main` 不需要與官方 `main` 保持一致。GitHub 使用的是貢獻分支，而不是部署分支。

## 為開發中的貢獻同步上游程式碼

官方倉庫有新提交時，直接更新貢獻分支，不要改動部署用的 `main`：

```sh
git fetch upstream
git switch feat/簡短說明
git rebase upstream/main
```

如果該分支已經推送過，請安全地更新遠端貢獻分支：

```sh
git push --force-with-lease origin feat/簡短說明
```

如有衝突，請在貢獻分支中解決，不要透過同步部署用的 `main` 來處理。

## 驗證修改

安裝依賴並執行與改動相關的檢查。核心驗證命令包括：

```sh
bun install
bun run test
bun run typecheck
bun run typecheck:mobile
bun run build:web
```

特定平臺的改動可能還需要額外檢查。

## 定製部署

如果您希望將個人產品改動長期保留在部署用的 `main`，這屬於定製部署，而不是普通的程式碼貢獻流程。定製部署需要設定 `EDGE_EVER_PRESERVE_FORK_CHANGES=true`，並自行維護與上游的合併。使用獨立分支貢獻程式碼時不需要設定這個變數。
