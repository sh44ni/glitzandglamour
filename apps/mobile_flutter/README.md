# Glitz & Glamour — Member App (Flutter)

Premium, login-first mobile app scaffold for **Glitz & Glamour**. This is **not** a webview clone of the website — it’s a remastered, app-native member experience with clean architecture building blocks and placeholder screens ready for backend integration.

## Folder location (important)

This Flutter app lives at:

- `apps/mobile_flutter/`

This is intentional because your repo already has a top-level `android/` folder (Capacitor). Flutter also generates an `android/` folder, so **Flutter must not be at repo root**.

## Tech stack

- **Flutter**: 3.41.x (stable)
- **State management**: Riverpod (`flutter_riverpod`)
- **Routing + auth guard**: `go_router`
- **Networking (stub)**: `dio`
- **Motion**: `flutter_animate`
- **Typography**: `google_fonts` (Poppins)
- **Deep links**: `app_links` (browser-based auth callback)

## Quick start (Windows)

### 1) Install Flutter SDK (if not already)

On this machine I set Flutter up here:

- `%USERPROFILE%\\dev\\flutter\\`

Optional but recommended: add Flutter to PATH permanently:

- Add `%USERPROFILE%\\dev\\flutter\\bin` to your User `PATH`

Verify:

```bash
flutter --version
flutter doctor -v
```

### 2) Android device live testing (your phone)

#### Enable developer mode + USB debugging

- On Android phone: Settings → About phone → tap **Build number** 7 times
- Settings → Developer options → enable **USB debugging**

#### Connect via USB

- Use a data-capable USB cable
- On the phone, accept the “Allow USB debugging” prompt

#### Android SDK / toolchain requirements

`flutter doctor` must show a working Android toolchain. If it shows:

- `cmdline-tools component is missing`

Install **Android Studio** (recommended) and ensure these components are installed:

- Android SDK Platform (latest)
- Android SDK Build-Tools
- Android SDK Platform-Tools
- **Android SDK Command-line Tools (latest)**

Then in Android Studio:

- Settings → Android SDK → SDK Tools → check **Android SDK Command-line Tools (latest)** → Apply

Re-check:

```bash
flutter doctor -v
```

#### Run on your phone

From this folder:

```bash
cd apps/mobile_flutter
flutter devices
flutter run -d <your_device_id>
```

### 3) Environment config (API base URL)

This app uses `--dart-define` (no secrets committed).

#### Default

- Default `API_BASE_URL` is `http://10.0.2.2:3000` (Android emulator -> your PC localhost)

#### Physical Android phone

Use your PC’s LAN IP (example `192.168.1.50`) and make sure your backend is reachable on the same Wi‑Fi:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.50:3000
```

### 3b) Website base URL (browser-based auth)

The login flow opens your existing website auth in an external browser, then redirects back into the app via deep link.

Set your website base URL:

```bash
flutter run --dart-define=WEB_BASE_URL=https://glitzandglamours.com
```

### 4) Auth mode (mock vs backend)

For UI development, auth is mocked by default:

- `USE_MOCK_AUTH=true` (default)

To switch to the backend auth repository stub:

```bash
flutter run --dart-define=USE_MOCK_AUTH=false
```

## Browser-based auth flow (current approach)

### How it works

1) App opens website sign-in page in an external browser:

- `/sign-in?callbackUrl=/app/auth/callback`

2) After successful login (Google/Apple/Email), the website loads:

- `GET /app/auth/callback`

That route generates a short-lived **one-time code** and redirects into the app:

- `glitzmember://auth/callback?code=...`

3) App receives the deep link and exchanges the code for durable tokens:

- `POST /api/mobile/auth/exchange`

### Deep link scheme (Android)

- Scheme: `glitzmember`
- Host: `auth`
- Path: `/callback`

This is configured in:

- `android/app/src/main/AndroidManifest.xml`

## iOS testing on Windows (read this carefully)

### Reality check

You **cannot** run the iOS Simulator on Windows. Apple requires **macOS + Xcode** for:

- iOS Simulator
- iOS code signing
- building/running on an iPhone

### How you can still “test iOS” while on Windows

Pick one:

- **Remote Mac** (recommended): rent a Mac (MacStadium) or use a Mac you own/borrow via remote access, then run:
  - `flutter doctor`
  - `cd apps/mobile_flutter`
  - `flutter run -d iPhone` (Simulator)
- **CI/TestFlight**: set up a macOS build pipeline to produce an `.ipa`, then distribute via TestFlight (requires Apple Developer account).
- **Device farms (BrowserStack/SauceLabs)**: useful for device testing, but you still generally need a macOS build step to generate the iOS build artifact.

This project already includes the generated `ios/` folder, so it’s ready when you have macOS access.

### macOS/Xcode steps (when you have access to a Mac)

Prereqs:

- Install **Xcode** from the Mac App Store
- Run Xcode once and accept licenses
- Install CocoaPods (one-time):
  - `sudo gem install cocoapods`

Then:

```bash
cd apps/mobile_flutter
flutter doctor -v
flutter pub get
cd ios
pod install
cd ..
flutter run -d iPhone
```

iOS signing (Xcode):

- Open `apps/mobile_flutter/ios/Runner.xcworkspace` in Xcode
- Set **Bundle Identifier** (should be `com.glitzandglamour.member` by default)
- Select your **Team** for signing

iOS capabilities (macOS-only):

- Apple Sign-In requires enabling **Sign In with Apple** capability in Xcode
- Push notifications require APNs setup + capabilities

## Manual steps required (do these yourself)

### Google Sign-In (Android + iOS)

Because the app currently reuses your **website auth UI** (NextAuth/Auth.js), you mainly need to ensure your website OAuth providers are correctly configured and that `/app/auth/callback` is reachable.

### Apple Sign-In (iOS)

- Requires Apple Developer Program
- Requires configuring “Sign in with Apple” identifiers/capabilities in Xcode (**macOS-only**)

### Android package configuration (release)

- Configure signing for release builds (keystore)
- Update Play Store listing assets later (icons, screenshots)

### Android toolchain (Windows)

- Install Android Studio + SDK + cmdline-tools (see above)

## What’s already implemented

- Login-first app gate (unauthenticated users cannot access member tabs)
- Bottom navigation after login:
  - Home, Book, Rewards, Appointments, Profile
- Required screens scaffolded:
  - Splash, Login, Signup
  - Home (member-focused layout)
  - Rewards + stamp tracker + CTAs
  - Booking (web now, native later)
  - Appointments, Profile
  - Notifications placeholder
  - Review reward placeholder
  - Wallet pass placeholder
- Premium dark “glass + pink glow” design language aligned to the brand tokens

## Code structure

Core entry:

- `lib/main.dart`
- `lib/app/glitz_app.dart`
- `lib/app/router/app_router.dart`
- `lib/app/theme/*`

Features:

- `lib/features/auth/*`
- `lib/features/home/*`
- `lib/features/rewards/*`
- `lib/features/booking/*`
- `lib/features/appointments/*`
- `lib/features/profile/*`

Shared UI:

- `lib/app/widgets/*`

## Backend/API integration TODO checklist

Target existing backend routes (from your website repo):

- `GET/PATCH /api/profile`
- `GET/POST /api/bookings`
- `GET /api/loyalty`

For the browser-based approach, these are the key endpoints/routes:

- `GET /app/auth/callback` (creates one-time code + redirects to deep link)
- `POST /api/mobile/auth/exchange` (exchanges code for tokens)

Next steps:

- Store tokens securely in the app (we included `flutter_secure_storage`)
- Add `dio` interceptors to attach `Authorization: Bearer <accessToken>`
- Implement real repositories for profile/loyalty/bookings calling your existing routes

