# Minbar Mobile: Standalone APK Compilation & Build Guide

### 100% Offline, Zero-Network Android & iOS Build Instructions
**Package Name:** `ai.minbar.mobile` | **Engine:** Expo SDK 51+ (React Native 0.74+)

---

## 1. Zero-Network Security Guarantee

Minbar Mobile is configured with **zero network permissions** in `app.json`:
```json
"android": {
  "package": "ai.minbar.mobile",
  "permissions": [],
  "blockedPermissions": ["android.permission.INTERNET"]
}
```
This guarantees at the OS manifest level that the app cannot make outbound network requests or connect to remote servers. All retrieval, verification, and synthesis execute 100% on the mobile device.

---

## 2. Prerequisites

1. **Node.js:** v18+ or v20+ (v22.x verified).
2. **Package Manager:** `npm` or `yarn`.
3. **Android Build Tools (for local Gradle builds):**
   - JDK 17 (OpenJDK).
   - Android Studio with Android SDK (API 34) and NDK (26.x).
   - Set environment variable `ANDROID_HOME` pointing to your Android SDK directory.
4. **EAS CLI (for EAS build workflow):**
   ```bash
   npm install -g eas-cli
   ```

---

## 3. Method A: Export Standalone APK via EAS Build (Recommended)

EAS Build provides the fastest path to export an installable `.apk` file for sideloading onto real Android devices or Minbar tablets.

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Validate Verification Engine Tests
Before compiling, run the offline verification test suite:
```bash
npm test
```
*Expected output: All 4 verification suites pass (Normalization, Hash Determinism, Exact Match, Zero-Hallucination Auto-Swapper).*

### Step 3: Trigger APK Build
Run EAS build using the pre-configured `preview` profile (which specifies `"buildType": "apk"` in `eas.json`):

```bash
# Cloud Build:
eas build --platform android --profile preview

# OR Local Machine Build (Requires local Docker or Android SDK):
eas build --platform android --profile preview --local
```

### Step 4: Download and Install APK
Once the build completes:
- Download the resulting `.apk` file.
- Transfer to your Android device via USB or direct download.
- Tap the `.apk` file to install.

---

## 4. Method B: Local Offline Build via Gradle (No Expo Account Required)

If you wish to compile completely offline on your local development workstation without any cloud service:

### Step 1: Generate Native Android Project
```bash
cd mobile
npx expo prebuild --platform android
```
This creates the native `mobile/android/` directory with `settings.gradle`, `build.gradle`, and `AndroidManifest.xml`.

### Step 2: Compile Release APK with Gradle
On Windows (PowerShell):
```powershell
cd android
./gradlew assembleRelease
```

On macOS / Linux:
```bash
cd android
./gradlew assembleRelease
```

### Step 3: Locate Compiled APK
The standalone `.apk` will be generated at:
```
mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk
```
(Or signed `.apk` if you have configured your release keystore in `android/app/build.gradle`).

---

## 5. Pre-Bundling the SQLite Database Asset

To ensure instant 0-latency startup, the pre-bundled SQLite database `minbar_canonical.db` is loaded into device storage:

1. The SQL asset is pre-staged in `mobile/assets/database/schema.sql` and `seed_data.sql`.
2. When the app boots, `MobileDatabase.init()` executes in `App.tsx` and populates the SQLite tables with verified Uthmanic Quran verses, Sahih Hadiths, and Classical Poetry.
3. FTS5 virtual tables (`quran_fts`, `hadith_fts`, `poetry_fts`) are initialized with SQLite automated synchronization triggers.

---

## 6. Sideloading & Pulpit Device Setup

1. **Enable Developer Options on Tablet / Phone:**
   - Go to *Settings* $\rightarrow$ *About Phone* $\rightarrow$ Tap *Build Number* 7 times.
   - Under *Developer Options*, toggle *Allow Unknown Sources* / *Install Unknown Apps*.
2. **Copy the APK:**
   ```bash
   adb install -r path/to/minbar-mobile.apk
   ```
3. **Launch Minbar Mobile:**
   - Launch the app.
   - Tap **"محددات صياغة الخطبة"** to set sermon theme, duration, and citation quota.
   - Tap **"وضع المنبر (الملقن)"** to start live pulpit delivery with enlarged typography and autoscroll!
