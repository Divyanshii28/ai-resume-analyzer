# AI Resume Analyzer

React frontend for the AI Resume Analyzer app.

## Run Locally

Start the FastAPI backend first:

```powershell
cd ..\backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

Then start the frontend:

```powershell
cd ..\frontend
npm install
npm run dev
```

The frontend calls the backend at `http://localhost:8001` by default.

To use a different backend URL, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8001
```

## AI Key

Set `OPENAI_API_KEY` in `backend/.env` to enable OpenAI analysis.

Without a key, the backend uses a local keyword-based fallback so the app still works for demos and development.

## MongoDB

To save analysis history, add MongoDB settings in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_resume_analyzer
```

The backend saves successful analysis results in the `analyses` collection.
