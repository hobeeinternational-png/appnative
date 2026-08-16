# HOBEE Mobile — Real Device Validation Checklist

## Build prerequisites

| Platform | Current configuration | Owner prerequisite | Evidence to retain |
|---|---|---|---|
| iOS | Bundle ID `com.app.hobeemobile`, scheme `manushobeemobile`, portrait, Face ID permission, image picker, location, notifications | Apple Developer access, signing certificate/provisioning, development build distribution path and physical iPhone | Build identifier, device/OS, install screenshot and app launch record |
| Android | Package `com.app.hobeemobile`, `POST_NOTIFICATIONS`, coarse/fine location, Android adaptive icon, min SDK 24 | Android signing key, development build distribution path and physical Android device | APK/AAB build identifier, device/OS, install screenshot and app launch record |

## Critical device test matrix

| Domain | iOS | Android | Expected evidence |
|---|---|---|---|
| Cold start / app shell | Launch, safe area, fixed header, tab bar | Launch, edge-to-edge, back gesture, tab bar | Screenshot + no native crash |
| Email sign-in / logout / restore | Login, terminate, relaunch, logout | Same | Session behavior and error state |
| Password reset | Email link opens `manushobeemobile://auth/reset-password` | Same | Deep link lands on reset screen with no route injection |
| Phone sign-in | Only after Phone Auth/SMS enabled | Only after Phone Auth/SMS enabled | Success, invalid number, unsupported provider message |
| Payment return | PromptPay/card return callback once backend is deployed | Same | `payment/callback` validation and order status refresh |
| Push permission | Grant, deny, re-enable, foreground/background/cold response | Android 13 channel + grant/deny/re-enable | Expo token stored; notification opens only allowed entity route |
| Evidence upload | Camera/library permission, photo, video, denied state, retry | Same | Private evidence renders only in own claim |
| Location/navigation | Allow once/deny and Google Maps handoff | Same | No unrelated data or broken permission loop |
| Customer after-sales | Claim, message, return tracking, refund/replacement status | Same | Ownership isolation and correct timeline |
| Seller / admin | Organization work queue and authorized action | Admin portal in supported web context plus native role flow | Role denial/allow outcomes and audit event |

## Release evidence gates

Do not proceed to a store submission or production payment enablement until every critical device row has an evidence record for both iOS and Android. Network loss, app relaunch during payment, duplicate notification tap, denied permissions, expired session, and failed upload must be recorded as explicit negative cases.

## Build procedure

1. Configure only public mobile values such as `EXPO_PUBLIC_HOBEE_API_BASE_URL`; never embed `SUPABASE_SERVICE_ROLE_KEY`, `OPN_SECRET_KEY`, webhook secret or Vercel cron secret.
2. Create development builds through the managed build/distribution workflow after Apple and Android signing access is available. Do not attempt to build heavy native artifacts manually in the sandbox.
3. Install on at least one recent iPhone and one Android 13+ device, then execute the matrix above using controlled test personas.
4. Attach resulting device evidence and backend/Supabase logs to the release gate before enabling production payment or push.
