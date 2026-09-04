# AI Chatbot Application

A functional, responsive, and secure AI Chatbot web application built with **FastAPI** and **Google Gemini API**. This project features a clean user interface, context-aware conversational memory, markdown/code syntax rendering, and local chat persistence.

Developed as part of the Practical Development Assessment for **Brightlant Software Solutions**.

---

## 🚀 Live Demo

- **Live Web Application:** [https://your-render-app-url.onrender.com](https://your-render-app-url.onrender.com)
- **Interactive API Documentation (Swagger):** [https://your-render-app-url.onrender.com/docs](https://your-render-app-url.onrender.com/docs)

---

## ✨ Features Implemented

1. **AI Chat Interface & API Integration**
   - Seamless real-time conversation flow with Google Gemini API (`gemini-2.5-flash`).
   - Strict server-side handling of API keys to prevent exposure in the frontend or public repositories.

2. **Local Storage Persistence**
   - Automatically saves conversation history locally in the browser so users don't lose context on page refreshes.

3. **Markdown & Code Formatting Support**
   - Integrates `Marked.js` on the frontend to cleanly render code blocks, lists, bold text, and structured AI responses.

4. **Clear Chat Functionality**
   - Allows users to reset the current conversation state and clear local storage with a single click.

5. **Loading State & Error Handling**
   - Real-time typing/loading indicators during response latency.
   - Robust Pydantic model validation and structured exception handling for API failures.

---

## 🛠️ Technology Stack

- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic, Requests, Python-Dotenv
- **Frontend:** HTML5, Tailwind CSS (via CDN), Vanilla JavaScript, Marked.js
- **AI Model / API:** Google Gemini API (`gemini-2.5-flash`)
- **Deployment Platform:** Render

---

## 📁 Repository Structure

```text
ai-chatbot/
│── templates/
│   └── index.html       # Single-page frontend layout & JS logic
│── .env                 # Environment variables (Git-ignored)
│── .gitignore           # File exclusion rule for git
│── main.py              # FastAPI application server & API routes
│── requirements.txt     # Python dependencies
└── README.md            # Project documentation