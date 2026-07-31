# Kirana AI 🛒🤖

Kirana AI is a modern, AI-powered local grocery shopping and store management application designed to bridge local Kirana stores with customers.

## Features

- **Voice & Text Item Parsing**: Uses Gemini AI to understand natural language shopping lists in English and regional languages (e.g., Kannada transliterations).
- **Customer Portal**: Create grocery lists, select local stores, track orders in real-time, and manage profiles.
- **Shop Owner Dashboard**: Manage incoming customer orders, manage product catalog and inventory, and import new products seamlessly.
- **Admin Catalog Management**: Maintain master catalogs and category definitions.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **Backend / Server**: Express, Node.js (via `server.ts`)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Database & Auth**: Firebase Auth & Firestore

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or bun

### Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` or `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
