# HOBEE Mobile — Mobile Interface Design

## Objective

HOBEE Mobile will provide a focused native shopping and discovery experience for HOBEE International customers on iOS and Android. The first release intentionally prioritizes the customer-facing marketplace, content discovery, cart, and account journeys extracted from the existing HOBEE web platform. Seller, administrator, travel-operation, education, and other role-specific workspaces remain web-first until their mobile workflows are separately prioritized.

## Design Principles

The application is designed for a 9:16 portrait screen and comfortable one-handed use. Primary actions appear in the lower half of the screen, lists are vertically scrollable, touch controls have generous targets, and each screen has one clear dominant action. The visual language uses warm honey and deep botanical tones to represent HOBEE’s honey products and community commerce, while retaining iOS-native hierarchy, typography, spacing, sheets, and tab navigation.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Home | Editorial welcome, product highlights, categories, community stories, and entry points to Shop and Discover. |
| Shop | Searchable product catalog with category filters, product cards, pricing, stock state, and add-to-cart actions. |
| Product Detail | Product imagery, origin information, description, selected quantity, favorite action, and add-to-cart CTA. |
| Discover | HOBEE articles, local stories, travel and service highlights; detail navigation will be added once the content API contract is confirmed. |
| Cart | Selected products grouped in a compact order list, quantity controls, order total, empty state, and checkout entry. |
| Checkout | Delivery address selection, payment method handoff, order review, and resilient submission feedback. This screen is enabled after the existing payment API is validated for native authentication. |
| Account | Sign-in entry, profile summary, order history entry, saved addresses, loyalty/coupons, and settings. |
| Sign in / Register | Email or Firebase-based account access with secure session storage; social sign-in is introduced after native Firebase configuration is available. |

## Key User Flows

1. A user opens **Home**, browses highlighted honey products or a category, opens a **Product Detail**, chooses quantity, adds the item to **Cart**, and begins checkout.
2. A returning user opens **Account**, signs in, views account details and saved addresses, then continues purchasing from **Shop** without losing the cart.
3. A user opens **Discover**, reads a community story or product-origin feature, and follows its product call-to-action back to **Product Detail**.
4. A user changes a cart quantity or removes an item; the cart updates immediately and is persisted locally so the selection survives an app restart.

## Navigation

The core navigation uses four persistent tabs: **Home**, **Shop**, **Discover**, and **Account**. Cart is available from a compact, visible header control on shopping surfaces and opens as a dedicated screen. Product details and checkout are pushed screens, keeping the tab state intact. Authentication and payment choices use native modal sheets where appropriate.

## Color Choices

| Token | Light mode | Dark mode | Role |
|---|---:|---:|---|
| Primary honey | `#C98716` | `#F0B84A` | Purchase CTA, active tab, key highlights. |
| Botanical ink | `#17352A` | `#E5F0E7` | Brand heading and primary text. |
| Background | `#FFFDF7` | `#111713` | Comfortable canvas for commerce browsing. |
| Surface | `#FFFFFF` | `#1B241E` | Cards, grouped controls, sheets. |
| Moss muted | `#617266` | `#AAB8AD` | Secondary copy, metadata. |
| Border | `#E8E0D0` | `#344237` | Dividers and low-emphasis outlines. |
| Success | `#317A50` | `#6FC58A` | Confirmed cart and order states. |
| Warning | `#B96E0A` | `#F2B84D` | Limited stock and attention states. |
| Error | `#C13F36` | `#F58A81` | Form validation and failed requests. |

## Domain Model for the First Release

| Model | Essential fields | Source strategy |
|---|---|---|
| Product | `id`, `name`, `slug`, `price`, `images`, `shopId`, `shopName`, `status`, `description` | Existing `/api/products` contract. |
| CartItem | `productId`, `name`, `price`, `quantity`, `image`, `shopId`, `shopName` | Local persisted state; maps directly from the existing web cart item shape. |
| UserProfile | `id`, `displayName`, `email`, `phoneNumber`, `addresses`, `points`, `coupons` | Existing Firebase-authenticated profile/API contract. |
| ContentItem | `id`, `title`, `summary`, `image`, `category`, `slug`, `publishedAt` | Existing `/api/content` contract. |
| Order | `id`, `items`, `total`, `status`, `paymentStatus`, `shippingAddress`, `createdAt` | Existing protected `/api/orders` contract after native token support is implemented. |

## Technical Translation Notes

The submitted web project is a React/Vite client with an Express backend, Firebase/Firestore persistence, Firebase Authentication, ThaiBulkSMS OTP handling, order/payment routes, and optional Gemini-powered services. Browser-only APIs such as `localStorage`, `window`, `document`, popup authentication, browser routing, canvas processing, and PWA installation must not be copied directly into the app. Their native equivalents will be Expo Router, SecureStore or AsyncStorage, native Firebase sign-in flows, ImagePicker/ImageManipulator, push notifications, and platform-specific sharing.

The existing web backend should remain the system of record. The mobile app will receive only a configurable HTTPS API base URL and native tokens will be transmitted using the `Authorization: Bearer <token>` convention already used by protected web endpoints. No production credential from the supplied source archive will be embedded in the application.

