# EdgeEver Android Builds

The Android app in `apps/mobile` is built with Expo and React Native; this repository ships no iOS client (SwiftUI), not this tree. Main-branch Android packages are built directly on GitHub Actions, without using EAS Build quota.

## App Updates

Installed release builds use EAS Update for compatible JavaScript and asset updates. The app checks once shortly after launch and, at most once every six hours, when it returns to the foreground. Users can also open **My** -> **General settings** -> **App updates** to check manually. A downloaded update is only applied after the user confirms a restart, so an active editing session is not interrupted automatically.

The `production` build and local release builds read from the `production` update channel. Preview EAS builds read from `preview`. Publish and verify an update on `preview` before promoting the same change to production:

```sh
bunx eas-cli update --channel preview --environment preview --message "Describe the update"
bunx eas-cli update --channel production --environment production --message "Describe the update"
```

The update runtime uses the app-version policy. Any native dependency, Expo SDK, native module, or native configuration change requires incrementing `expo.version` and shipping a new binary before publishing code that depends on that native change. EAS Update does not replace a new native binary.

### Update Path for Sideloaded APKs

Release APKs are installed straight from GitHub, so updates come from the app's
GitHub Release updater. The bundled Play In-App Updates integration only engages
when the app was installed from Google Play; for a sideloaded build it stays
inactive and the GitHub updater handles version checks. Nothing in this
repository publishes to Play or the App Store.

Because a sideloaded update must match the installed certificate, every release
has to be signed with the same keystore. Changing keys leaves existing installs
unable to update in place; they must be uninstalled and reinstalled.

## Main-Branch Android APK

The `Build EdgeEver Mobile` workflow runs on GitHub Actions and produces a
fast arm64 APK after mobile changes land on `main`. This APK uses the same
pinned production signing certificate as formal GitHub Release APKs. The fast
build only disables R8, resource shrinking, and PNG crunching; it must never
fall back to `debug.keystore`.

It runs:

```sh
bun install --frozen-lockfile
bun run typecheck:mobile
bun run build:android:fast
```

The APK is uploaded as a GitHub Actions artifact named
`edgeever-android-main-apk`. If the stable signing credentials are unavailable,
the workflow fails and does not upload an APK with a different signer.

For a local fast build, load the same signing environment used for release
builds:

```sh
bun run build:android:fast:local
```

## Release Builds

### GitHub Release APK

Every formal GitHub Release must include a directly installable APK. Build the production-signed `arm64-v8a` APK on the release Mac:

```sh
bun run build:android:apk:local
```

This produces `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`.
Before upload, automation requires exactly one signer. To pin the certificate,
set `EDGE_EVER_ANDROID_ALLOWED_SIGNER_SHA256` locally or the
`ANDROID_APP_SIGNER_SHA256` repository secret in CI; any other signer then
fails the build. Without a pin, the only requirement is a single signer, which
is what a normal keystore produces. Verify the application version and APK
SHA-256 as well. Additional ABIs should only be published for an explicit
compatibility need.

Sign every release with the same keystore: Android only installs an update when
the signing certificate matches, and a failed match leaves users stuck on the
old version.
A release whose audited change range affects mobile runtime
code, shared code used by mobile, mobile dependencies, native configuration,
APK build tooling, or signer verification must rebuild the APK from that
release commit.

If the audited change range does not affect the mobile binary, the most recent compatible, verified APK may be attached again without rebuilding. Keep its original versioned filename and checksum, and state the source release explicitly; never rename an older binary to the current release version.

The release workflow performs this audit automatically and verifies the pinned
signer for both newly built and reused APKs. Web-only releases use an Ubuntu
planning job and copy the single verified `arm64-v8a` APK from the previous
formal Release. The self-hosted Android runner is scheduled only when the
audited range includes mobile runtime code, shared mobile packages,
dependencies, native configuration, Android build tooling, or signer
verification.

The release APK is signed with the operator's upload keystore and verified
to carry exactly that one signer (optionally pinned to an expected fingerprint)
before it is attached to a GitHub Release. Keep
the keystore and its credentials outside the repository, and make sure every
release is signed with the same key so installed clients keep updating in
place. Google Play bundles, App Store submission and other store delivery are
intentionally not part of this repository; installation comes straight from the
GitHub Release APK.

## EAS

EAS is optional; routine CI builds use GitHub Actions local Android builds to avoid consuming EAS monthly build quota.

`apps/mobile/app.json` ships without an Expo project link: the `owner` field names the Expo account that publishes the app, and no `extra.eas.projectId` or `updates.url` is committed. Before running EAS builds or EAS Update for the first time, sign in to your own Expo account and link the app once:

```sh
cd apps/mobile
eas init                  # creates the project and writes extra.eas.projectId
eas update:configure      # writes updates.url for the project
```

Commit the resulting `app.json` changes on your own fork. Until then, GitHub Actions Android builds and the GitHub release feed remain the supported update path; EAS Update stays inactive because no update URL is configured.
