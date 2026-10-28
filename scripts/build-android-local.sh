#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
ANDROID_DIR="$MOBILE_DIR/android"
MODE="${1:-fast}"

if [[ "$MODE" != "fast" && "$MODE" != "apk" ]]; then
  echo "用法: $0 [fast|apk]" >&2
  exit 2
fi

if [[ -z "${JAVA_HOME:-}" && -d /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ]]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
fi

if [[ -n "${JAVA_HOME:-}" ]]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

if ! command -v java >/dev/null 2>&1; then
  echo "未找到 Java 17。請先執行: brew install openjdk@17" >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" && -d /opt/homebrew/share/android-commandlinetools ]]; then
  export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
fi
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
export NODE_ENV="${NODE_ENV:-production}"

run_timed() {
  local label="$1"
  shift
  local started_at=$SECONDS

  echo "[$(date '+%H:%M:%S')] 開始：${label}"
  "$@"
  echo "[$(date '+%H:%M:%S')] 完成：${label}（$((SECONDS - started_at)) 秒）"
}

if [[ -z "$ANDROID_SDK_ROOT" ]]; then
  echo "未找到 Android SDK，請設定 ANDROID_HOME 或 ANDROID_SDK_ROOT。" >&2
  exit 1
fi

cd "$PROJECT_ROOT"
run_timed "安裝 JavaScript 依賴" bun install --frozen-lockfile
run_timed "準備移動端圖示" bun run prepare:mobile:icons

PREBUILD_FINGERPRINT="$({
  shasum \
    apps/mobile/app.json \
    apps/mobile/assets/adaptive-icon-transparent.svg \
    apps/web/public/pwa-512x512.png \
    bun.lock
} | shasum | awk '{print $1}')"
PREBUILD_STAMP="$ANDROID_DIR/.edgeever-prebuild-fingerprint"
PREVIOUS_FINGERPRINT="$(test -f "$PREBUILD_STAMP" && cat "$PREBUILD_STAMP" || true)"

if [[ ! -x "$ANDROID_DIR/gradlew" || "$PREBUILD_FINGERPRINT" != "$PREVIOUS_FINGERPRINT" ]]; then
  echo "更新 Android 原生工程（保留已有編譯快取）..."
  cd "$MOBILE_DIR"
  run_timed "生成 Android 原生工程" bunx expo prebuild --platform android
  printf '%s' "$PREBUILD_FINGERPRINT" > "$PREBUILD_STAMP"
else
  echo "跳過 Android prebuild：原生配置未變化。"
fi

cd "$ANDROID_DIR"
COMMON_ARGS=(
  --build-cache
  --parallel
  --daemon
  -Dorg.gradle.jvmargs=-Xmx6g\ -XX:MaxMetaspaceSize=1g\ -Dfile.encoding=UTF-8
)

: "${ANDROID_KEYSTORE_FILE:?請設定 ANDROID_KEYSTORE_FILE（本機上傳金鑰路徑）}"
: "${ANDROID_KEYSTORE_PASSWORD:?請設定 ANDROID_KEYSTORE_PASSWORD}"
: "${ANDROID_KEY_ALIAS:?請設定 ANDROID_KEY_ALIAS}"
: "${ANDROID_KEY_PASSWORD:?請設定 ANDROID_KEY_PASSWORD}"

# Expo's DOM exporter writes current files without pruning old files. React Native's
# Gradle inputs also omit workspace packages. Rebuild only the generated JS/DOM
# assets from an empty directory; native compilation keeps its existing caches.
rm -rf "$ANDROID_DIR/app/build/generated/assets/react/release" \
  "$ANDROID_DIR/app/build/generated/res/react/release"
run_timed "重新整理生產 JavaScript 與 DOM 資源" ./gradlew \
  :app:createBundleReleaseJsAndAssets --rerun --no-build-cache "${COMMON_ARGS[@]:1}"


APK_ARCHS="${EDGE_EVER_ANDROID_APK_ARCHS:-arm64-v8a}"
KEYSTORE_FILE="$(cd "$(dirname "$ANDROID_KEYSTORE_FILE")" && pwd)/$(basename "$ANDROID_KEYSTORE_FILE")"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
APKSIGNER_PATH="$ANDROID_SDK_ROOT/build-tools/36.0.0/apksigner"

if [[ "$MODE" == "fast" ]]; then
  echo "構建生產簽名 arm64 快速 APK（關閉 R8、資源壓縮和 PNG crunch）..."
  run_timed "Gradle 快速 APK 構建" ./gradlew assembleRelease \
    "${COMMON_ARGS[@]}" \
    -PreactNativeArchitectures=arm64-v8a \
    -Pandroid.enableMinifyInReleaseBuilds=false \
    -Pandroid.enableShrinkResourcesInReleaseBuilds=false \
    -Pandroid.enablePngCrunchInReleaseBuilds=false \
    -Pandroid.injected.signing.store.file="$KEYSTORE_FILE" \
    -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD" \
    -Pandroid.injected.signing.store.type=PKCS12
  test -s "$APK_PATH"
  test -x "$APKSIGNER_PATH"
  run_timed "校驗 APK 固定簽名" \
    node "$PROJECT_ROOT/scripts/verify-android-apk-signature.mjs" \
    "$APK_PATH" "$APKSIGNER_PATH"
  echo "完成: $APK_PATH"
  exit 0
fi

if [[ "$MODE" == "apk" ]]; then
  echo "構建生產簽名 APK（${APK_ARCHS}）..."
  run_timed "Gradle 生產 APK 構建" ./gradlew assembleRelease \
    "${COMMON_ARGS[@]}" \
    -PreactNativeArchitectures="$APK_ARCHS" \
    -Pandroid.injected.signing.store.file="$KEYSTORE_FILE" \
    -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD" \
    -Pandroid.injected.signing.store.type=PKCS12
  AAPT2_PATH="$ANDROID_SDK_ROOT/build-tools/36.0.0/aapt2"
  test -s "$APK_PATH"
  test -x "$APKSIGNER_PATH"
  test -x "$AAPT2_PATH"
  run_timed "校驗 APK 固定簽名" \
    node "$PROJECT_ROOT/scripts/verify-android-apk-signature.mjs" \
    "$APK_PATH" "$APKSIGNER_PATH"
  run_timed "讀取 APK 資訊" bash -c '"$1" dump badging "$2" | sed -n "1p"' _ "$AAPT2_PATH" "$APK_PATH"
  run_timed "計算 APK SHA-256" shasum -a 256 "$APK_PATH"
  echo "完成: $APK_PATH"
  exit 0
fi
