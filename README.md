# RUDRI AI Chatbot

RUDRI is a FastAPI-based AI chatbot powered by Google Gemini. It provides a bright white and royal-blue chat interface, multiple local conversations, selectable assistant personas, markdown responses, and browser-based chat persistence.

## Features

- Google Gemini `gemini-2.5-flash` responses
- Angelic and Evil RUDRI personas
- Multiple conversations in the chat history sidebar
- Create, switch, delete, clear, and export chats
- Chat history saved in browser `localStorage`
- Markdown rendering for assistant responses
- Loading and API error states
- Responsive white and royal-blue frontend

## Requirements

- Python 3.10 or newer
- A Google Gemini API key

## Setup

1. Open a terminal in the project folder.

2. Create and activate a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Keep this file private and do not commit it to source control.

## Run The App

Start the development server:

```powershell
uvicorn main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

Interactive API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## API

### `POST /api/chat`

Request body:

```json
{
   "message": "What is 2 + 2?",
   "persona": "angelic",
   "userName": "Guest"
}
```

Response:

```json
{
   "response": "2 + 2 = 4"
}
```

The `persona` value can be `angelic` or `evil`. The API key is read server-side from `GEMINI_API_KEY` and is never sent to the browser.

## Project Structure

```text
.
├── main.py                 # FastAPI server and Gemini API route
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation
├── templates/
│   └── index.html           # Chat interface markup
└── static/
   ├── css/
   │   └── style.css        # White and royal-blue theme
   └── js/
      └── main.js          # Chat state, rendering, and API calls
```

## Notes

- Conversations are stored only in the current browser's `localStorage`; they are not stored on the server.
- Clearing browser site data removes locally saved conversations.
- Tailwind CSS and Marked.js are loaded from CDN in the frontend.
