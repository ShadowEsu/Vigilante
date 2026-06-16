# Vigil iOS

Native **Swift + SwiftUI** client for the Apple App Store.

## Requirements

- macOS with Xcode 16+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`)
- Supabase project (same as web)
- Deployed Vigil web API (Vercel) for `runAnalysis`

## Configure

```bash
cd ios
cp Config.xcconfig.example Config.xcconfig
# Edit Config.xcconfig with your Supabase + API URLs
xcodegen generate
open Vigil.xcodeproj
```

In Supabase Auth settings, add redirect URL:

```
vigil://auth/callback
```

## Run

Select a simulator or device in Xcode, then **Run** (⌘R).

## App Store release

1. Enroll in Apple Developer Program
2. Set signing team in Xcode → Signing & Capabilities
3. Archive: Product → Archive
4. Upload to App Store Connect via Organizer
5. Complete App Store listing (privacy, screenshots, review)
   - Privacy Policy URL: `https://your-domain/legal/privacy`
   - Terms / EULA: `https://your-domain/legal/eula`

Bundle ID: `com.vigil.app`

## URL scheme

Magic links open the app via `vigil://auth/callback` (configured in `Info.plist`).
