# Namma Angadi 🛒🤖

Namma Angadi (formerly Kirana AI) is a premium, AI-powered local grocery shopping and store management application designed to connect local Kirana stores with customers. The application is built as a Progressive Web App (PWA) to behave indistinguishably from a native mobile application.

For a detailed breakdown of architectural decisions, parsing models, and PWA capabilities, check out [Technical Overview](overview.md).

## Core Features

- **Progressive Web App (PWA)**: Launches in fullscreen standalone mode (`display: standalone`) without any browser URL bars, supports offline shell serving, and triggers native 1-tap browser installation dialogs.
- **Multilingual Semantic Voice Parsing**: Transcribes speech (English, Hindi, Kannada) and maps regional terms (e.g. *"akki"*, *"doodh"*, *"halu"*) to standard inventory products using Google's Gemini API.
- **Image Scanner (OCR)**: Analyzes photographs of handwritten shopping lists, printed checkout bills, and chat screenshots, extracting structured items directly to the shopping list.
- **Indian Localized Catalog**: Database containing common daily grocery products, regional translations, and optimized packaging sizes.
- **Safe-Area Layouts**: Design utilizes CSS notches (`safe-area-inset`) and 48px touch targets to provide an Android/iOS native app experience.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **Service Worker Compilation**: Workbox (`vite-plugin-pwa`)
- **Backend Server**: Node.js & Express (`server.ts`)
- **AI Model SDK**: Google GenAI SDK (`@google/genai` using `gemini-2.5-flash`)
- **Database & Auth**: Firebase Authentication & Cloud Firestore

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Setup & Installation

1. Install local dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Build production files:
   ```bash
   npm run build
   ```
