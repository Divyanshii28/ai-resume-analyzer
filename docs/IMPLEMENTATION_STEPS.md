# Implementation Steps

## Phase 1: Project Cleanup

1. Confirm FastAPI is the only real backend.
2. Keep React frontend in `frontend/`.
3. Keep FastAPI backend in `backend/`.
4. Remove or ignore unused Node/Express API routes in `frontend/server.ts`.
5. Ensure `.env` is not committed.
6. Keep `.env.example` as the public environment template.

## Phase 2: Backend Setup

1. Create backend virtual environment.
2. Install dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

3. Configure `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_resume_analyzer
```

4. Start MongoDB locally or configure MongoDB Atlas.
5. Run FastAPI:

```powershell
uvicorn main:app --reload --port 8001
```

## Phase 3: Frontend Setup

1. Install frontend dependencies:

```powershell
cd frontend
npm install
```

2. Start frontend:

```powershell
npm run dev
```

3. Open:

```text
http://127.0.0.1:3000
```

## Phase 4: Resume Upload and Validation

1. Accept `.pdf` and `.txt` files in the frontend.
2. Send PDF files as `FormData`.
3. Send pasted text as JSON.
4. Extract PDF text in backend with PyPDF2.
5. Reject blank, scanned, short, or unrelated documents.
6. Show backend validation errors in the frontend.

## Phase 5: Analysis Logic

1. Build AI prompt with resume text and job description.
2. Ask AI to return strict JSON.
3. Normalize response into frontend-compatible shape.
4. Fall back to local scoring if AI fails.
5. Return:
   - ATS score
   - match rate
   - rank
   - missing skills
   - suggestions
   - resume summary

## Phase 6: MongoDB Persistence

1. Connect backend to MongoDB with PyMongo.
2. Create `analyses` collection.
3. Add indexes:
   - `timestamp`
   - `candidateName`
4. Save every successful analysis.
5. Avoid saving failed validation attempts.
6. Add `GET /api/history`.
7. Exclude large text fields from history response.

## Phase 7: History UI

1. Load history on app startup.
2. Store history in `analysisHistory` state.
3. Show latest 5 records in `Recent Analyses`.
4. Add new successful result to history immediately after analysis.
5. Keep the history panel compact.

## Phase 8: Testing

### Backend Health

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/
```

### Text Analysis

```powershell
Invoke-WebRequest -UseBasicParsing -Method POST -Uri http://127.0.0.1:8001/api/analyze -ContentType "application/json" -Body '{"resumeText":"...","jobDescriptionText":"...","candidateName":"Test","jobTitle":"Engineer"}'
```

### History

```powershell
$json = (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/api/history).Content | ConvertFrom-Json
$json.items | Select-Object candidateName, jobTitle, atsScore, matchRate, rank
```

### Frontend Type Check

```powershell
cd frontend
npx tsc --noEmit
```

### Frontend Build

```powershell
cd frontend
npm run build
```

## Phase 9: Production Hardening

1. Replace wildcard CORS with explicit frontend domain.
2. Move MongoDB to Atlas or managed hosting.
3. Add logging.
4. Add rate limiting.
5. Add file size limits.
6. Add OCR if scanned PDFs are required.
7. Add authentication only when saved user accounts are needed.
8. Add automated tests for validation and API response shape.

## Phase 10: Future Features

1. Export analysis as PDF.
2. Save reusable job descriptions.
3. Compare multiple resumes.
4. Add candidate dashboard.
5. Add recruiter view.
6. Add resume rewrite suggestions.
7. Add OpenAI structured output improvements.
8. Add deployment guide.
