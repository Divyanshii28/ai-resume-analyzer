# UI/UX Brief

## Product Personality

Resume Analyser should feel focused, practical, and credible. The app is a work tool, not a marketing page. The interface should help users quickly upload a resume, paste a job description, and understand the result.

## Design Goals

- Make the main workflow obvious.
- Keep input and results visible side by side on desktop.
- Avoid decorative sections that do not help analysis.
- Use clear error messages for invalid PDFs and missing inputs.
- Make scores and missing skills easy to scan.
- Keep visual style consistent and restrained.

## Layout

### Header

- Fixed header.
- Product name on the left.
- Small static descriptor on the right.
- No Login or Sign Up buttons until authentication exists.

### Main Page

Two-column layout on desktop:

- Left column: resume input, job description input, analyze button, recent analyses.
- Right column: loading state, empty state, or analysis result.

Single-column layout on mobile:

- Inputs first.
- Results below.
- Results panel scrolls into view after analysis starts.

## Input UX

### Resume Input

Users can:

- Upload a PDF.
- Upload a TXT file.
- Paste text manually.

PDF upload should show confirmation text like:

```text
PDF active (filename.pdf)
```

Invalid file type should show:

```text
Please upload a .pdf or .txt resume, or paste the resume text directly.
```

### Job Description Input

Users paste the complete role description. The app should not require perfect formatting.

## Results UX

### Empty State

Show a calm message that tells users to provide inputs and run analysis.

### Loading State

Show skeleton cards while analysis is running.

### Result State

Show:

- ATS score.
- Match rate.
- Rank.
- Resume summary.
- Missing skills.
- Suggestions.

## History UX

The Recent Analyses panel should:

- Show the latest 5 records.
- Display candidate name, job title, and ATS score.
- Stay compact.
- Avoid showing full resume text.

## Visual Style

Current style:

- High-contrast borders.
- White cards.
- Light neutral page background.
- Lime accent for primary action and score emphasis.
- Pastel blocks for summaries and tags.

Guidelines:

- Keep cards purposeful.
- Avoid placeholder imagery.
- Avoid decorative quote blocks.
- Avoid fake navigation or unused actions.
- Keep text compact and readable.

## Accessibility

- Inputs should have visible labels.
- Buttons should have clear text.
- Error messages should be readable and specific.
- Color should not be the only signal.
- Text should not overflow in cards or buttons.

## Content Tone

Use practical language:

- `Analyze Candidate Resume`
- `Missing Skills & Keywords`
- `AI Actionable Advice`
- `Recent Analyses`

Avoid vague or overly technical UI labels like:

- `Workspace Fast-Injectors`
- `Awaiting Coordinates`
- `Corporate Job Description Spec`

## Recommended UI Polish

- Rename `File Drag` to `Upload`.
- Rename `Edit Copy` to `Paste Text`.
- Rename `Target Corporate Job Description Spec` to `Target Job Description`.
- Rename `Required Keyword parameters & expectations` to `Job Description`.
- Remove remaining overly stylized wording from placeholders.
