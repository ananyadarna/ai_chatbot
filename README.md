# Aether AI | Premium Intelligent Chatbot

Aether AI is a highly polished, modern, and responsive AI chatbot application. It features a secure **Node.js/Express backend** that interfaces with Google's Gemini API and a beautiful **vanilla HTML/CSS/JS frontend** boasting a glassmorphic dark-theme design.

---

## 🌟 Key Features

* **Real-Time Response Streaming**: Generates responses character-by-character (using Server-Sent Events) to provide a fluid, instant feedback loop.
* **Premium Glassmorphic UI**: Sleek, modern styling utilizing HSL color palettes, custom gradients, `backdrop-filter` blurs, and smooth animations.
* **Responsive Layout**: Sidebar collapses on mobile screens into a slide-out drawer with overlay backdrops.
* **Local Session Persistence**: All conversations are stored in the browser's `localStorage` so you can close your tab, return later, and resume or delete past chats.
* **Rich Markdown Rendering**: Automatically parses Markdown output into clean HTML elements (lists, bold text, inline code, etc.).
* **Advanced Code Highlighting**: Automatically detects code blocks, highlights their syntax based on the programming language, and includes a **one-click "Copy" button** with visual feedback.
* **Prompt Suggestions**: Interactive quick-start prompt cards on the welcome screen to help you get started.
* **Theme Toggling**: Seamless transition between Dark Mode and Light Mode.

---

## 🛠️ Tech Stack

### Backend
* **Node.js**: Server runtime environment.
* **Express.js**: Minimalist web framework for routing and serving static files.
* **Google Generative AI SDK (`@google/generative-ai`)**: Official SDK used to communicate with the `gemini-2.5-flash` model.
* **Dotenv**: Loads environment variables from a `.env` file for secure API key management.
* **CORS**: Enables cross-origin resource sharing.

### Frontend
* **HTML5**: Semantic markup.
* **Vanilla CSS**: Responsive grids, flexbox layouts, CSS custom variables, glassmorphism, and keyframe animations.
* **Vanilla JavaScript (ES6+)**: Handles user interaction, DOM manipulation, SSE stream reading, and local storage management.
* **Lucide Icons**: Clean, consistent vector icons.
* **Marked**: A fast, lightweight Markdown parser.
* **Prism.js**: Robust code syntax highlighting.

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
