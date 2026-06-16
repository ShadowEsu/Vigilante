# Vigil Android

Native **Kotlin + Jetpack Compose** client for Google Play.

## Requirements

- Android Studio Ladybug or newer
- JDK 17
- Supabase project (same as web)
- Deployed Vigil web API (Vercel) for `runAnalysis`

## Configure

Copy `local.properties.example` → `local.properties`:

```properties
sdk.dir=C\:\\Users\\you\\AppData\\Local\\Android\\Sdk
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=https://your-vigil-app.vercel.app
```

In Supabase Auth settings, add redirect URL:

```
vigil://auth/callback
```

## Run

Open the `android/` folder in Android Studio, sync Gradle, run on device/emulator.

Or from terminal (after Android Studio generates the Gradle wrapper jar):

```bat
gradlew.bat assembleDebug
```

## Play Store release

1. Create a release keystore
2. Configure signing in `app/build.gradle.kts`
3. Build App Bundle: `./gradlew bundleRelease`
4. Upload `app/build/outputs/bundle/release/app-release.aab` to Google Play Console

Bundle ID: `com.vigil.app`
