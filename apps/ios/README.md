# EdgeEver iOS (Swift)

Native SwiftUI client for EdgeEver. This replaces the React Native / Expo iOS target.

## Status

UI/interaction is aligned with the Android RN app (`apps/mobile`):

- Login / session (Keychain with UserDefaults fallback) / device id
- GRDB local mirror + bootstrap / incremental sync
- SQLite outbox (create/update, create-absorbs-update, conflict/retry)
- Workspace chrome: notebook title picker, search (250ms debounce), filter chips, list options (sort/density/batch), FAB create, long-press multi-select, swipe pin/delete
- Memo detail + create/edit autosave, share link, revisions, soft delete
- EditorBundle (WKWebView body + toolbar)
- Image pick + materialize-for-upload (K24) + protected resource blob loading
- Settings: general / account / tags / API tokens / devices / users (owner) / about
- Share Extension (text/URL → App Group → new draft)
- Locale (system/zh/en) + theme + list density

Android remains Expo / React Native in `apps/mobile`. iOS is developed and tested from this native tree in Xcode; this repository ships no App Store signing, archive or submission tooling.

## Motion / animations

Motion stack: **SwiftUI Animation** (short easing transitions) + **[Pow](https://github.com/EmergeTools/Pow)** (Emerge) for focused feedback.

| Effect | Where |
|--------|--------|
| Static list cards and press targets | List entry, create/edit return, card / create / filter presses |
| Short easing transitions | Search, filters, settings, loading states |
| **Shine / Shake / Haptic** | Pin success, errors, selection |

Curves & wrappers: `EdgeEver/DesignSystem/Motion.swift`.

## Requirements

- Xcode 16+ (Xcode 27 beta OK for local dev)
- iOS 17+ deployment target
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) to regenerate the project

```sh
brew install xcodegen
```

## Generate & open

```sh
cd apps/ios
xcodegen generate
open EdgeEver.xcodeproj
```

## Tests

```sh
# Unit + live API tests (live tests skip if local server is down)
xcodebuild test \
  -project EdgeEver.xcodeproj \
  -scheme EdgeEver \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

Live API tests login to `http://127.0.0.1:8787` using `EDGE_EVER_AUTH_PASSWORD` or monorepo `.env.wrangler.generated.local`.

## Simulator auto-login (QA)

With local `bun run dev` running:

```sh
xcrun simctl launch booted org.edgeever.mobile \
  -EdgeEverAutoLoginURL "http://127.0.0.1:8787" \
  -EdgeEverAutoLoginUser admin \
  -EdgeEverAutoLoginPassword "$EDGE_EVER_AUTH_PASSWORD"
```

## Versioning

| Field | File | Notes |
| --- | --- | --- |
| `MARKETING_VERSION` | `Config/Version.xcconfig` | Align with the monorepo release `X.Y.Z` |
| `CURRENT_PROJECT_VERSION` | `Config/Version.xcconfig` | Build number used by local builds |

This repository does not configure App Store distribution: there is no archive script, export options, Xcode Cloud hook or fastlane lane. Distribution settings are the operator's own concern.

## Regenerating the Xcode project

Edit `project.yml`, then:

```sh
xcodegen generate
```
