# Namma Angadi - Deep Technical Architecture & Overview

Welcome to the detailed system architectural guide for **Namma Angadi** (meaning "Our Shop" in Kannada, formerly Kirana AI). Namma Angadi is a Progressive Web App (PWA) designed to bring local neighborhood grocery stores online, featuring specialized voice recognition, multi-language list translation, and OCR scanners optimized for Indian households.

---

## 🏗️ 1. PWA & Standalone Sandbox Architecture

Namma Angadi is designed to bypass standard browser containers and provide a standalone native experience.

### A. Manifest Properties Configuration (`public/manifest.webmanifest`)
- **App Boundaries**: Configured with `display: "standalone"`, `scope: "/"`, and `start_url: "/"`.
- **Branding Assets**: Includes version-controlled icons (`icon-192x192.png?v=2` and `maskable-icon.png?v=2`) mapped directly from `shopping-cart.png` to avoid Android/iOS caching old versions.
- **Color Theme**: Locks browser status bars and splash screens to theme color `#16A34A` and background color `#FFFFFF`.

### B. Service Worker Precaching (`vite.config.ts`)
- **Asset Registration**: Uses `vite-plugin-pwa` with Workbox to compile the production service worker (`sw.js`).
- **Precache Manifest**: Captures all compiled bundles (`.js`, `.css`, `.html`, and webmanifest) to guarantee instant offline load.
- **Cache Claiming Rules**:
  - `clientsClaim: true`: Instantly assumes control of open tabs upon activation.
  - `skipWaiting: true`: Forces the waiting service worker to active immediately upon installation.
  - `navigateFallback: "/index.html"`: Redirects arbitrary page refreshes (e.g. `/customer/orders` or `/login`) to the single-page application shell when offline.

### C. Unified Installation Manager Hook (`src/hooks/usePWAInstall.ts`)
```
                          [Window Bootstrap]
                                   │
                                   ▼
          [Global beforeinstallprompt Listener (Pre-Mount)]
                                   │
                                   ▼ (Stores Event)
                     [globalDeferredPrompt State]
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼ (Supported Browser)                               ▼ (iOS Safari / Other)
 [Trigger Native Install Dialog]                      [Display Floating Prompt Alert]
         │                                                   │
         ▼                                                   ▼
 [User accepts: Add to Screen]                        [Manual Add to Home Screen]
```

---

## 🎙️ 2. Semantic Indian Multilingual Voice Recognition

Spoken shopping lists in Indian households often mix English, Hindi, and Kannada. The app handles this translation cleanly.

### A. Voice Capture & Duplication Sanitation (`useVoiceRecognition.ts`)
The Web Speech API frequently triggers multiple intermediate results that append redundant text (e.g., yielding `2 2 kg akki kg akki`). 
- **Duplication Filter**: Suffix-checks each incoming final transcript block. If the previous text state already ends with the new incoming phrase, it cancels appending the duplicate chunk.
- **Locale Target**: Speech recognition language is saved in `localStorage` (`kn-IN` for Kannada, `hi-IN` for Hindi, `en-IN` for English).

### B. Semantic Parser Engine (`server.ts` & `CreateList.tsx`)
On submission, the raw string is parsed by Google's `gemini-2.5-flash` model. The prompt uses a structured system instruction:

```json
[
  {
    "name": "Sona Masoori Rice",
    "quantity": 2,
    "unit": "kg"
  }
]
```

#### Regional Vocabulary & Normalization Translation:
- **Rice / Grains**: *"akki"* (Kannada) / *"chawal"* (Hindi) ➔ **Sona Masoori Rice**
- **Dairy**: *"halu"* (Kannada) / *"doodh"* (Hindi) ➔ **Milk**
- **Vegetables**: *"ullagaddi" / "savala"* (Kannada) / *"pyaz"* (Hindi) ➔ **Onion**
- **Oils**: *"enne"* (Kannada) / *"tel"* (Hindi) ➔ **Sunflower Oil**
- **Measurement units**: Decimals are computed automatically (e.g., *"half"* ➔ `0.5`, *"one and a half"* ➔ `1.5`).

---

## 📷 3. Camera Scan & OCR Parsing Pipeline

The scanner converts image captures (photographs of paper, store receipts, or WhatsApp message screenshots) into clean cart entries.

### OCR Image Processing Flow
1. **Camera Image Upload**: User captures or uploads an image (`mimeType: image/jpeg` or similar).
2. **Payload Base64 Conversion** (`useImageParser.ts`): Strips header headers and sends raw Base64 data to `/api/gemini/parse-image`.
3. **Structured Entity Extraction**: The image is analyzed by `gemini-2.5-flash` using multimodal prompts to:
   - Identify handwritten or printed grocery items.
   - Ignore extraneous invoice lines (discounts, tax values, shop names).
   - Match item names to the localized store catalog database.
   - Return a clean array of structured grocery items.

---

## 📱 4. Mobile UX & Safe-Area Bounds

The interface is built to feel like an Android/iOS system wrapper rather than a web browser.

### Layout Boundary Rules
- **Device Notches & Safe-Areas**: Uses safe-area layout rules in CSS (`src/index.css`) to pad headers and floating navigation panels safely:
  ```css
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  ```
- **Viewport Constraints**: `min-height: 100dvh` is used to prevent layout shifts.
- **Large Touch Targets**: Button templates, tab selectors, and profile controls enforce a minimum touch zone height and width of `48px`.
- **Keyboard Zoom Prevention**: Set input sizes strictly to `16px` to prevent iOS and Android webviews from automatically zooming in when form inputs gain focus.
- **Scrollbar Hiding**: Prevents layout shift animations.

---

## 💳 5. Unified Cart & Price Calculation Model

Calculations in the shopping cart and checkout screens match the pricing system rules.

### Cross-Unit Pricing Algorithm
Prices are stored against the product's `defaultUnit` (e.g. `basePrice: 65` for `defaultUnit: kg`). If the user specifies a sub-unit, the system converts it using the following rules:

```typescript
const totalPrice = items.reduce((acc, item) => {
  const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
  if (product) {
    const basePrice = product.price;
    const baseUnit = product.defaultUnit.toLowerCase();
    const currentUnit = item.unit.toLowerCase();
    let multiplier = 1;

    if (baseUnit === 'kg' && currentUnit === 'g') multiplier = 0.001;
    if (baseUnit === 'g' && currentUnit === 'kg') multiplier = 1000;
    if (baseUnit === 'litre' && currentUnit === 'ml') multiplier = 0.001;
    if (baseUnit === 'ml' && currentUnit === 'litre') multiplier = 1000;
    if (baseUnit === 'piece' && currentUnit === 'dozen') multiplier = 12;
    if (baseUnit === 'dozen' && currentUnit === 'piece') multiplier = 1/12;

    return acc + (basePrice * item.quantity * multiplier);
  }
  return acc;
}, 0);
```
