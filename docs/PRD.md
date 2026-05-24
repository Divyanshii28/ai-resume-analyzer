# Product Requirements Document

## Product Name

Resume Analyser

## Overview

Resume Analyser is a web application that helps candidates and recruiters evaluate how well a resume matches a target job description. Users upload a resume PDF or paste resume text, enter a job description, and receive an ATS-style score, match percentage, missing skills, summary, and improvement suggestions.

## Problem

Candidates often do not know whether their resume is aligned with a specific job posting. Recruiters and students also need a quick way to identify missing keywords, weak resume sections, and role-fit gaps before submitting or screening resumes.

## Goals

- Allow users to upload a text-based PDF resume or paste resume text.
- Allow users to enter a job description.
- Generate ATS score, match rate, rank, missing skills, summary, and suggestions.
- Reject invalid, blank, scanned, or non-resume documents.
- Persist successful analysis results in MongoDB.
- Display recent analysis history in the frontend.
- Keep the app usable even if the AI API fails by using fallback scoring.

## Non-Goals

- User authentication.
- Payment or subscription handling.
- Resume editing inside the app.
- Storing raw PDF files.
- Enterprise recruiter workflows.
- Multi-tenant organization support.

## Target Users

- Job seekers optimizing resumes for specific roles.
- Students preparing applications.
- Recruiters doing quick resume/job-description matching.
- Career coaches reviewing candidate resumes.

## Core Features

### Resume Input

- Upload `.pdf` resume.
- Upload `.txt` resume.
- Paste resume text manually.
- Validate that uploaded or pasted content looks like a resume.

### Job Description Input

- Paste full job description.
- Add optional role title.

### Analysis Output

- ATS score from 0 to 100.
- Match rate from 0 to 100.
- Rank label such as `Optimized`, `Strong Match`, `Ready for Review`, or `Needs Alignment`.
- Missing skills and keywords.
- AI suggestions.
- Resume summary.

### Analysis History

- Save successful analysis results in MongoDB.
- Show recent analyses in the frontend.
- Provide API endpoint for history retrieval.

## User Stories

- As a job seeker, I want to upload my resume and paste a job description so I can see how well I match the role.
- As a user, I want invalid PDFs rejected so I do not receive fake scores.
- As a user, I want actionable suggestions so I can improve my resume.
- As a returning user, I want to see recent analyses so I can compare previous results.
- As a developer, I want the app to keep working if MongoDB or OpenAI is unavailable.

## Success Metrics

- Valid resumes return analysis results successfully.
- Invalid PDFs return helpful errors instead of fake scores.
- MongoDB stores each successful analysis.
- Recent analyses load on page refresh.
- Frontend and backend run locally with documented commands.

## Risks

- Scanned PDFs may not contain extractable text.
- AI API quota errors may occur.
- Basic fallback scoring is less accurate than AI-generated analysis.
- Resume validation may reject unusual but valid resumes.

## Future Enhancements

- OCR support for scanned PDFs.
- User accounts and saved dashboards.
- Resume improvement editor.
- Export analysis as PDF.
- Compare multiple resumes against one job description.
- Add PostgreSQL or MongoDB Atlas deployment guide.
