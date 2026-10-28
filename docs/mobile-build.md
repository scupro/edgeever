# EdgeEver Android Builds

The Android app in `apps/mobile` is built with Expo and React Native. iOS store binaries come from `apps/ios` (SwiftUI), not this tree. Main-branch Android packages are built directly on GitHub Actions, without using EAS Build quota.

## App Updates

Installed release builds use EAS Update for compatible JavaScript and asset updates. The app checks once shortly after launch and, at most once every six hours, when it returns to the foreground. Users can also open **My** -> **General settings** -> **App updates** to check manually. A downloaded update is only applied after the user confirms a restart, so an active editing session is not interrupted automatically.

The `production` build and locally generated Play build read from the `production` update channel. Preview EAS builds read from `preview`. Publish and verify an update on `preview` before promoting the same change to production:

```sh
bunx eas-cli update --channel preview --environment preview --message "Describe the update"
bunx eas-cli update --channel production --environment production --message "Describe the update"
```

The update runtime uses the app-version policy. Any native dependency, Expo SDK, native module, or native configuration change requires incrementing `expo.version` and shipping a new store build before publishing code that depends on that native change. EAS Update does not replace Google Play or App Store updates for native binaries.

### Google Play Flexible Updates

Android release builds first query Google's Play In-App Updates SDK. When Play offers a flexible update, the automatic check opens Google's native consent dialog. Downloads run in the background; the app asks before completing installation and restarting. Declining consent suppresses further automatic prompts for that version during the current app session, while the settings update action allows a manual retry. Manual checks discover the update without opening the consent dialog until the user selects the update action.

Play download state is checked on every return to the foreground, including during the ordinary six-hour check cooldown. Downloaded updates remain available through **Restart to apply** if the user dismisses the restart prompt. Failed or unavailable Play flows retain the existing Google Play listing and GitHub update destinations; compatible EAS updates remain a separate fallback. Old binaries without the native SDK safely skip this integration when receiving compatible JavaScript.

This native SDK addition requires a new Android binary and a new app runtime version at release time. Existing binaries cannot gain the native dialog through OTA alone. A GitHub release does not mean a Play update is available: Play decides eligibility using its own distribution state, account ownership, application ID, signing certificate, and higher version code. See [Google's testing requirements](https://developer.android.com/guide/playcore/in-app-updates/test).

Before publishing this update-path change, validate on a USB-connected physical Android device using a Play test track or internal app sharing:

1. Install an older build that already includes this SDK integration, then make a higher-version-code build available to the same account through Play. For internal app sharing, follow Google's link-opening procedure without installing the newer build from its listing.
2. Confirm the native consent dialog, cancellation without repeated automatic prompts, and manual retry.
3. Accept the flexible update and continue editing during download. Background and foreground the app, and restart the process to verify download recovery.
4. Dismiss the ready prompt, then use **Restart to apply**. Confirm the new native version launches and existing notes and pending edits remain intact.
5. Verify the existing manual destinations on a device/account without an eligible Play update, plus download/installation failure recovery and the older-native-binary OTA fallback.

Compilation and automated state-machine tests do not replace this real old-to-new installation gate. Until these steps pass, Play installation, process recovery, signing compatibility, and data preservation across this update remain unverified.

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
Before upload, automation requires exactly one signer and pins its certificate
SHA-256 to
`22bf52a9501c89020f5acc966960152c826bfa64f31e578e858d088f8cd75d87`.
Any other signer fails the build. Verify the application version and APK
SHA-256 as well. Additional ABIs should only be published for an explicit
compatibility need. The Play AAB is also intentionally limited to
`arm64-v8a`, so its Play-signed universal APK remains a single-ABI download.
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
against the pinned certificate before it is attached to a GitHub Release. Keep
the keystore and its credentials outside the repository, and make sure every
release is signed with the same key so installed clients keep updating in
place. Google Play bundles, App Review submission and other store delivery are
intentionally not part of this repository.

## EAS

EAS is optional; routine CI builds use GitHub Actions local Android builds to avoid consuming EAS monthly build quota.

`apps/mobile/app.json` ships without an Expo project link: the `owner` field names the Expo account that publishes the app, and no `extra.eas.projectId` or `updates.url` is committed. Before running EAS builds or EAS Update for the first time, sign in to your own Expo account and link the app once:

```sh
cd apps/mobile
eas init                  # creates the project and writes extra.eas.projectId
eas update:configure      # writes updates.url for the project
```

Commit the resulting `app.json` changes on your own fork. Until then, GitHub Actions Android builds and the GitHub release feed remain the supported update path; EAS Update stays inactive because no update URL is configured.
