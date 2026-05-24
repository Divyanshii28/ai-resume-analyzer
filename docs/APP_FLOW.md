# App Flow

## Primary User Flow

1. User opens the app.
2. Frontend loads recent analyses from `GET /api/history`.
3. User uploads a PDF resume or switches to paste mode.
4. User enters or confirms candidate name.
5. User enters job title.
6. User pastes a job description.
7. User clicks `Analyze Candidate Resume`.
8. Frontend sends the request to FastAPI.
9. Backend validates input.
10. Backend extracts resume text if PDF was uploaded.
11. Backend rejects invalid or non-resume content.
12. Backend analyzes resume against job description.
13. Backend saves successful result in MongoDB.
14. Frontend displays ATS score, match rate, rank, missing skills, summary, and suggestions.
15. Frontend updates recent analyses list.

## PDF Upload Flow

```text
User selects PDF
  -> frontend stores File object
  -> user enters job description
  -> frontend sends FormData to POST /analyze
  -> backend extracts text with PyPDF2
  -> backend validates resume content
  -> backend analyzes content
  -> backend saves result to MongoDB
  -> frontend renders result
```

## Pasted Text Flow

```text
User pastes resume text
  -> frontend sends JSON to POST /api/analyze
  -> backend validates resume content
  -> backend analyzes content
  -> backend saves result to MongoDB
  -> frontend renders result
```

## Invalid PDF Flow

```text
User uploads random/scanned/blank PDF
  -> backend extracts little or no text
  -> validation fails
  -> backend returns 422
  -> frontend shows error message
  -> no MongoDB record is saved
```

## AI Failure Flow

```text
User submits valid resume
  -> OpenAI quota/network/key error occurs
  -> backend runs local fallback scoring
  -> backend returns usable result
  -> backend saves result to MongoDB
```

## MongoDB Failure Flow

```text
User submits valid resume
  -> backend analyzes successfully
  -> MongoDB connection fails
  -> backend logs warning
  -> frontend still receives analysis result
  -> history may be empty
```

## Frontend State Flow

- `resumeText`: stores pasted or `.txt` resume content.
- `resumeFile`: stores selected PDF file.
- `jobText`: stores job description.
- `candidateName`: stores candidate name.
- `jobTitle`: stores target role.
- `currentResult`: stores latest analysis result.
- `analysisHistory`: stores recent MongoDB history.
- `isLoading`: controls loading state.
- `errorMsg`: controls error display.
- `successMsg`: controls upload success display.
