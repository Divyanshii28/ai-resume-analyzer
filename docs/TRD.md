# Technical Requirements Document

## System Overview

Resume Analyser uses a React frontend, a FastAPI backend, OpenAI for AI-assisted analysis, PyPDF2 for PDF text extraction, and MongoDB for persistence.

## Architecture

```text
User Browser
  |
  | React frontend
  | http://localhost:3000
  v
FastAPI backend
  | http://localhost:8001
  |
  |-- PDF extraction with PyPDF2
  |-- Resume validation
  |-- OpenAI analysis or fallback analysis
  |-- MongoDB persistence
  v
MongoDB
  mongodb://localhost:27017
```

## Frontend

### Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons

### Key Files

- `frontend/src/App.tsx`
- `frontend/src/components/AnalyzeView.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/types.ts`

### Responsibilities

- Provide resume and job-description input UI.
- Support PDF/TXT upload and pasted text.
- Call FastAPI endpoints.
- Show analysis result.
- Load and display recent analysis history.

## Backend

### Stack

- Python
- FastAPI
- Uvicorn
- PyPDF2
- OpenAI Python SDK
- PyMongo
- python-dotenv

### Key File

- `backend/main.py`

### Responsibilities

- Accept PDF upload and form data.
- Extract text from PDFs.
- Validate resume-like content.
- Analyze resume against job description.
- Save successful analysis records in MongoDB.
- Expose history endpoint.
- Handle AI API failure with fallback scoring.

## Database

### Database

`ai_resume_analyzer`

### Collection

`analyses`

### Purpose

Store successful resume analysis results for history display and future reporting.

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_resume_analyzer
```

## API Endpoints

### `GET /`

Health check.

Response:

```json
{
  "message": "HireMind AI Backend Running"
}
```

### `POST /api/analyze`

Analyze pasted resume text.

Request:

```json
{
  "resumeText": "...",
  "jobDescriptionText": "...",
  "candidateName": "Asha Rao",
  "jobTitle": "Frontend Engineer"
}
```

### `POST /analyze`

Analyze uploaded PDF resume.

Request type:

```text
multipart/form-data
```

Fields:

- `resume`: PDF file
- `job_description`: job description text
- `candidate_name`: optional candidate name
- `job_title`: optional job title

### `GET /api/history`

Get recent saved analyses.

Response:

```json
{
  "items": []
}
```

## Validation Rules

- Resume text must be long enough to be meaningful.
- Resume text must contain resume-like markers, such as:
  - experience
  - skills
  - education
  - projects
  - certifications
  - email
  - phone
  - LinkedIn
  - GitHub
- Invalid PDFs return `422`.
- Missing job description returns `400`.

## Error Handling

- AI errors fall back to local analysis.
- MongoDB errors do not block analysis.
- Invalid resume content returns a user-facing error.
- Bad uploads return a user-facing error.

## Security Requirements

- Do not commit `.env`.
- Do not expose API keys in frontend code.
- Keep AI calls server-side.
- Avoid storing raw PDF files by default.

## Performance Requirements

- PDF extraction should complete within a few seconds for normal resumes.
- API history should return at most 100 records.
- Frontend should remain responsive while analysis is loading.

## Deployment Notes

- Frontend can be built with `npm run build`.
- Backend can be run with `uvicorn main:app --host 0.0.0.0 --port 8001`.
- MongoDB can be local or Atlas.
- Production should use explicit CORS origins instead of `*`.
