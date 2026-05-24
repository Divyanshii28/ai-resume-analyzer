# Backend Schema

## MongoDB Database

```text
ai_resume_analyzer
```

## Collections

```text
analyses
```

## Collection: `analyses`

Stores successful resume analysis results.

### Document Shape

```json
{
  "_id": "ObjectId",
  "id": "anal-0438e730",
  "candidateName": "End To End Test Candidate",
  "jobTitle": "Full Stack Engineer",
  "atsScore": 95,
  "matchRate": 95,
  "rank": "Optimized",
  "timestamp": "2026-05-24T10:45:40.064897+00:00",
  "missingSkills": ["AWS"],
  "aiSuggestions": [
    "Mirror the highest-priority job-description keywords in the resume summary and skills sections.",
    "Add evidence for AWS through projects, certifications, or measurable outcomes.",
    "Rewrite experience bullets to include metrics, scope, tools used, and business impact."
  ],
  "resumeSummary": "Brief assessment of the candidate's fit.",
  "jobDescriptionText": "Full pasted job description",
  "resumeText": "Extracted or pasted resume text"
}
```

## Field Reference

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | MongoDB internal ID |
| `id` | string | Yes | App-level analysis ID |
| `candidateName` | string | Yes | Candidate name |
| `jobTitle` | string | Yes | Target job title |
| `atsScore` | number | Yes | ATS compatibility score, 0-100 |
| `matchRate` | number | Yes | Job-description match rate, 0-100 |
| `rank` | string | Yes | Human-readable rank label |
| `timestamp` | string | Yes | ISO timestamp |
| `missingSkills` | string[] | Yes | Skills or keywords missing from resume |
| `aiSuggestions` | string[] | Yes | Resume improvement suggestions |
| `resumeSummary` | string | Yes | Short summary of fit |
| `jobDescriptionText` | string | Yes | Original job description |
| `resumeText` | string | Yes | Extracted or pasted resume text |

## Indexes

```text
timestamp descending
candidateName ascending
```

## API Response Shape

### Analysis Result

```json
{
  "id": "anal-0438e730",
  "candidateName": "End To End Test Candidate",
  "jobTitle": "Full Stack Engineer",
  "atsScore": 95,
  "matchRate": 95,
  "rank": "Optimized",
  "timestamp": "2026-05-24T10:45:40.064897+00:00",
  "missingSkills": [],
  "aiSuggestions": [],
  "resumeSummary": "...",
  "jobDescriptionText": "...",
  "resumeText": "..."
}
```

### History Result

The history endpoint excludes large text fields:

```json
{
  "items": [
    {
      "id": "anal-0438e730",
      "candidateName": "End To End Test Candidate",
      "jobTitle": "Full Stack Engineer",
      "atsScore": 95,
      "matchRate": 95,
      "rank": "Optimized",
      "timestamp": "2026-05-24T10:45:40.064897+00:00",
      "missingSkills": [],
      "aiSuggestions": [],
      "resumeSummary": "..."
    }
  ]
}
```

## Validation Rules

### Resume Validation

Before analysis, backend checks:

- Minimum readable text length.
- Minimum word count.
- Resume-like markers:
  - `experience`
  - `skills`
  - `education`
  - `projects`
  - `certifications`
  - `summary`
  - `linkedin`
  - `github`
  - email
  - phone

### Invalid Resume Response

```json
{
  "detail": "This PDF does not contain enough readable resume content. Please provide a complete resume, not a scanned image or unrelated document."
}
```

Status:

```text
422 Unprocessable Entity
```

## Future Collections

### `users`

Use only if authentication is added.

### `resumes`

Use if raw resume records need to be saved separately.

### `jobs`

Use if job descriptions become reusable templates.
