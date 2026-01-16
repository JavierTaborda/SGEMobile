# Changelog

All notable changes to this project will be documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-16

### Added

- **Core Modules:**
  - Goals Module (product goals and metrics).
  - Orders Module (order search and approval).
  - Create Orders Module (order creation).
  - Returns Report Module (reporting and tracking returns).
  - Home Module (dashboard and metrics).
  - Profile Module (user profile and settings).
  - Auth Module (login, session handling, biometric authentication).
- **Navigation & Architecture:**
  - Expo Router with Drawer and Tabs.
  - Modular architecture by feature.
- **Integrations & Libraries:**
  - Supabase for authentication and storage.
  - Zustand for state management.
  - Axios for API requests.
  - NativeWind for styling and dark mode.
  - Expo Camera, Expo Image Picker, base64-arraybuffer.
  - Charts with `react-native-charts-kit`.
- **Global Components & Utilities:**
  - `BarcodeScanner` for QR and barcodes.
  - `CustomFlatList` with automatic pagination, incremental loading, and optimized scrolling.
  - `safeHaptics` utility for consistent haptic feedback across iOS/Android.
  - `pickImage` and `deleteImage` helpers for Supabase image handling.
  - `CustomImage` and other reusable UI components.
- **UI/UX Enhancements:**
  - Improved styles in Drawer, Tabs, and lists.
  - Conditional switch in OrderSearchScreen.
  - Advanced filters in GoalsFilter.
  - Animated modals (`AnimatedView`).
  - Unified `Overlay` component supporting `success`, `error`, `warning`, and `info`.
  - Dynamic animations and icons based on overlay type.

  Usage:

      ```ts
      const overlay = useOverlayStore();

      //Success
      overlay.show("success", { title: "Guardado correctamente", subtitle: "Tus cambios se aplicaron" });

      // Error
      overlay.show("error", { title: "Error al guardar", subtitle: "Revisa tu conexión" });

      // Warning
      overlay.show("warning", { title: "Campos incompletos", subtitle: "Debes llenar todos los campos" });

      // Info
      overlay.show("info", { title: "Versión instalada", subtitle: "App actualizada a v1.2" });
      ```
  - Added  `react-native-pager-view` library.

### Changed

- Global types and new interfaces (`DataClient`, `Motive`).
- Refactored `ClientModal` → `Components/inputs`.
- Adjusted `ChartLineView` to show the last day.
- Improved `ScreenSearchLayout` with `showfilterButton` property.
- Replaced `alert` with `Alert.alert`.
- Replaced Expo Haptics with `safeHaptics`.
- Replaced FlatList component with FlashList from `@shopify/flash-list`  

### Fixed

- Validations in orders and discounts.
- Fixed biometric authentication when disabled.
- Deleted Supabase images if return fails.
- Corrected auto-refresh logic in lists.
- Removed shadow in tab buttons on Android.
- Prevented crashes when orders are null.

### Removed

- Unnecessary UI elements (emojis and icons in Home and Drawer).
- Duplicate dependencies replaced by internal utilities.
