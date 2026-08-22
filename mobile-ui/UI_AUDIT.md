# UrbanEco-Link Mobile UI — Comprehensive Audit

This audit evaluates the `mobile-ui/` Flutter application against the `web-app/` visual design language, the UrbanEco-Link system architecture, and mobile viewport responsiveness.

---

## 1. Existing Screens Audit

| Screen Name | File Path | Status | Responsive | Mobile Touch Fit |
| :--- | :--- | :--- | :--- | :--- |
| **Splash Screen** | `lib/features/auth/splash_screen.dart` | Complete | Yes | Good |
| **Login Screen** | `lib/features/auth/login_screen.dart` | Complete | Yes | Good |
| **Registration Screen** | `lib/features/auth/registration_screen.dart` | Complete | Yes | Needs Scroll Safety |
| **Forgot Password** | `lib/features/auth/forgot_password_screen.dart` | Complete | Yes | Good |
| **OTP Verification** | `lib/features/auth/otp_verification_screen.dart` | Complete | Yes | Good |
| **Society Dashboard** | `lib/features/society/society_dashboard_screen.dart` | Complete | Partial | Needs Grid Aspect Fix |
| **Request Pickup** | `lib/features/society/request_pickup_screen.dart` | Complete | Yes | Good |
| **Forecast Confirmation** | `lib/features/society/forecast_confirmation_screen.dart` | Complete | Yes | Good |
| **Pickup History** | `lib/features/society/pickup_history_screen.dart` | Complete | Yes | Good |
| **Rewards & Credits** | `lib/features/society/rewards_screen.dart` | Complete | Yes | Good |
| **Trust Score & Grade** | `lib/features/society/trust_grade_screen.dart` | Complete | Yes | Good |
| **Driver Dashboard** | `lib/features/driver/driver_dashboard_screen.dart` | Complete | Partial | Needs Grid Aspect Fix |
| **Driver QR Scanner** | `lib/features/driver/qr_scanner_screen.dart` | Complete | Yes | Good |
| **Factory Dashboard** | `lib/features/factory/factory_dashboard_screen.dart` | Complete | Partial | Needs Grid Aspect Fix |
| **Factory Status Controls** | `lib/features/factory/factory_status_controls_screen.dart` | Complete | Yes | Good |
| **Capacity Management** | `lib/features/factory/capacity_management_screen.dart` | Complete | Yes | Good |
| **Batch Processing UI** | `lib/features/factory/processing_screen.dart` | Complete | Yes | Good |

---

## 2. Missing Screens Inventory

| Role | Missing Screen | Severity | Required Action |
| :--- | :--- | :--- | :--- |
| **Global** | `NotificationCenterScreen` | **HIGH** | Build notification page with All/Unread/Important filters and role-specific alert types. |
| **Society** | `SocietySettingsScreen` | **HIGH** | Build complete settings (Account, Pickup Preferences, Notifications, Theme, Language, Help, Terms, Logout). |
| **Society** | `PickupDetailsScreen` & `PickupTrackingTimeline` | **HIGH** | Build 10-stage live tracking timeline (Created -> Confirmed -> Assigned -> En Route -> Arrived -> Collected -> In Transit -> Factory Received -> Processing -> Completed). |
| **Society** | `SocietyProfileScreen` | **MEDIUM** | Build detailed society profile (RWA details, address, resident count, contact). |
| **Driver** | `DriverSettingsScreen` | **HIGH** | Build complete settings (Profile, Vehicle [Type, Capacity, Info], Availability, Hours, Navigation, Emergency, Help, Logout). |
| **Driver** | `DriverPickupDetailsScreen` & `RouteMapScreen` | **HIGH** | Build pickup details, customer contact, location map preview, and route steps. |
| **Driver** | `DriverVerificationScreen` & `FactoryDeliveryScreen` | **HIGH** | Build photo evidence upload, weight verification sign-off, and weighbridge handoff. |
| **Driver** | `DriverHistoryScreen` & `DriverProfileScreen` | **MEDIUM** | Build driver job logs, vehicle specs, and profile. |
| **Factory** | `FactorySettingsScreen` | **HIGH** | Build complete settings (Profile, Info, Waste Types, Capacity, Hours, Daily Reminder toggle, Staff, Security, Logout). |
| **Factory** | `IncomingBatchesScreen` & `QrReceiveScreen` | **HIGH** | Dedicated incoming trucks list with View, Scan QR, Weighbridge Intake confirmation. |
| **Factory** | `ProcessingHistoryScreen` & `CapacityHistoryScreen` | **MEDIUM** | Build processing logs, daily recovery rates, and maintenance history list. |
| **Factory** | `EmergencyShutdownDialog` | **HIGH** | Add confirmation dialog with warning & reason input to prevent accidental activation. |

---

## 3. Responsive & Overflow Audit

| Screen | Identified Problem | Severity | Required Fix |
| :--- | :--- | :--- | :--- |
| `society_dashboard_screen.dart` | Fixed 1.35 aspect ratio in StatCard grid causes text overflow on small 320px screens. | **HIGH** | Replace hardcoded aspect ratio with `SliverGrid` or responsive card height constraint. |
| `driver_dashboard_screen.dart` | StatCard grid 1.35 aspect ratio overflows on 360px phones. | **HIGH** | Adjust aspect ratio to 1.5 or build responsive grid adapter. |
| `factory_dashboard_screen.dart` | Grid cards overflow vertically on compact viewports. | **HIGH** | Wrap cards in flexible layouts and add `SafeArea`. |
| `login_screen.dart` | Role grid (2x2) cards slightly squished on 320px width. | **MEDIUM** | Use `LayoutBuilder` to auto-adjust grid columns for ultra-compact screens. |
| `processing_screen.dart` | Dialog text inputs can overflow keyboard on 568px height phones. | **MEDIUM** | Wrap dialog contents in `SingleChildScrollView`. |
| `app_button.dart` | Long text strings can push icon out of button container. | **MEDIUM** | Wrap button text in `Flexible` with `maxLines: 1` and `TextOverflow.ellipsis`. |

---

## 4. Design & Identity Inconsistencies

- All colors, fonts (Inter), and radii match `web-app/` correctly.
- All missing screens must strictly inherit from `AppTheme`, `AppColors`, `AppCard`, `AppButton`, `StatusBadge`, and `AppTextField`.
