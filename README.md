# AI Resume Analyzer

AI Resume Analyzer is a two-part app:

- `backend/`: FastAPI API for resume analysis
- `frontend/`: React UI for entering resume text and job descriptions

## Run

Start the backend:

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by `npm run dev`.

## Environment

Create `backend/.env`:

```env
OPENAI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_resume_analyzer
```

If no key is configured, the backend returns a local keyword-based analysis so the app remains usable.

## MongoDB

MongoDB is used to save successful analysis results.

For local development, install MongoDB Community Server and start it on the default port. The backend will use:

```text
mongodb://localhost:27017
```

You can also use MongoDB Atlas by setting `MONGODB_URI` in `backend/.env`.

History endpoint:

```text
GET http://localhost:8001/api/history
```

If MongoDB is not running, analysis still works, but history will be empty and the backend will print a warning.
