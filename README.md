# Aether AI | Premium Enterprise-Grade Intelligent Chatbot

Aether AI is a **premium, high-performance, and responsive AI chatbot application** engineered using a modern decoupled architecture. The system features a secure, stateless **Node.js/Express backend** that interfaces with Google's state-of-the-art Gemini API and a highly optimized **vanilla HTML/CSS/JS frontend** boasting a premium glassmorphic design system.

---

## 🌟 Key Features

* **Asynchronous Stream Consumption**: Utilizes the **Server-Sent Events (SSE) protocol** via `/api/chat` to stream responses in real-time, delivering a premium, low-latency conversational interface.
* **Premium Glassmorphic Design System**: Styled using a custom-tailored design system with **HSL dynamic theme tokens**, `backdrop-filter` blur effects, subtle translucent borders, and hardware-accelerated CSS keyframe animations.
* **Responsive Layout Architecture**: Features a fluid sidebar navigation that collapses on mobile devices into an overlay drawer utilizing a hardware-accelerated slide-in transition.
* **State Persistence & Serialization**: Implements local session serialization to `localStorage`, allowing users to maintain, restore, or purge conversational history across sessions.
* **Abstract Syntax Tree (AST) Markdown Parsing**: Uses `marked` to parse markdown outputs into semantic HTML5 structures securely, avoiding raw HTML injections.
* **Contextual Code Highlight Engine**: Dynamically detects code block languages, processes them via the **PrismJS syntax highlighter**, and injects a premium **one-click Clipboard API copy button** with interactive state feedback.
* **Interactive Prompt Bootstrapping**: Features pre-configured suggestion cards on the welcome screen that trigger instant UI input injection and submission.
* **Dynamic Theme Swapper**: Instantaneous client-side theme swapping (Dark/Light) utilizing CSS custom properties.

---

## 🛠️ Technical Stack

### Backend Architecture
* **Node.js**: Asynchronous event-driven JavaScript runtime.
* **Express.js**: High-performance HTTP utility middleware for routing and serving static assets.
* **Google Generative AI SDK (`@google/generative-ai`)**: Official client library interfacing with the `gemini-2.5-flash` model.
* **Dotenv**: Secure environment variable injector for API key encapsulation.
* **CORS**: Cross-Origin Resource Sharing middleware for API request validation.

### Frontend Architecture
* **Semantic HTML5**: Clean, SEO-optimized document object model (DOM) structure.
* **Vanilla CSS**: Premium styling utilizing custom properties, CSS Grid, Flexbox, and transition matrices.
* **Vanilla JavaScript (ES6+)**: Event-driven client-side controller executing stream decoding, DOM diffing, and localStorage state management.
* **Lucide Icons**: SVG-based vector icons.
* **Marked**: High-speed Markdown compiler.
* **Prism.js**: Lightweight, extensible syntax highlighting engine.

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Make sure you have **Node.js** (v18 or higher recommended) installed.

### 2. Install Dependencies
In your terminal, navigate to the project directory and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the root directory and add your Gemini API key:
```env
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> 💡 *You can get a free API key from [Google AI Studio](https://aistudio.google.com/).*

### 4. Run the Server
Start the Express server:
```bash
npm start
```
Or run the server in development mode (with auto-reload on changes):
```bash
npm run dev
```

### 5. Open the Web App
Open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)** (or **[http://127.0.0.1:3000](http://127.0.0.1:3000)**)
