# HOBEE Mobile — Development Build & Device QA

ต้องใช้ **development build** สำหรับ Magic Link, push notification และ custom scheme; Expo Go ไม่ใช่หลักฐานแทน native flow เหล่านี้

## Preconditions

- iOS bundle identifier และ Android package: `com.app.hobeemobile`
- Custom scheme: `manushobeemobile`
- เพิ่ม Supabase Redirect URL: `manushobeemobile://auth/callback`
- Sign in to the Expo/EAS account that owns the application identifiers and signing credentials

## Build commands

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

## Test cases

| Area | Must test on actual device |
|---|---|
| Magic Link | cold start, foreground callback, expired/invalid link, cancellation, logout/session restore |
| Push | allow/deny permission, token upsert, foreground/background, tap → order detail |
| iOS | notch/Dynamic Island, home indicator, keyboard, sticky CTA |
| Android | gesture/system navigation, back behavior, keyboard resize, notification permission |
| Checkout | Shop → Cart → Address → Payment and order return after backend/provider sandbox is available |

## Callback safety already validated in source

- Magic Link callback accepts only `manushobeemobile://auth/callback` before asking Supabase to complete a session.
- Payment callback parses only `manushobeemobile://payment/callback`; it never marks an order paid from client parameters.
- Notification taps may navigate only to `/orders` or `/orders/{id}`. Payment status remains server/provider verified.

Mark any case not completed as **NOT TESTED ON DEVICE** in release reporting.
