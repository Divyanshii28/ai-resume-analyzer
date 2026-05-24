from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from pymongo import MongoClient, DESCENDING
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from pydantic import BaseModel
import os
import io
import json
import PyPDF2
import re
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "ai_resume_analyzer")
mongo_client = None
analyses_collection = None

# FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to extract text from PDF
def extract_text_from_pdf(file_bytes):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

    text = []

    for page in pdf_reader.pages:
        extracted = page.extract_text()

        if extracted:
            text.append(extracted)

    return "\n".join(text).strip()


class TextAnalyzeRequest(BaseModel):
    resumeText: str
    jobDescriptionText: str
    candidateName: str = ""
    jobTitle: str = ""


def get_analyses_collection():
    global mongo_client, analyses_collection

    if analyses_collection is not None:
        return analyses_collection

    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1200)
        mongo_client.admin.command("ping")
        analyses_collection = mongo_client[MONGODB_DB]["analyses"]
        analyses_collection.create_index([("timestamp", DESCENDING)])
        analyses_collection.create_index("candidateName")
        return analyses_collection
    except (PyMongoError, ServerSelectionTimeoutError) as error:
        print(f"MongoDB unavailable, continuing without persistence: {error}")
        mongo_client = None
        analyses_collection = None
        return None


def save_analysis_record(record):
    collection = get_analyses_collection()
    if collection is None:
        return

    try:
        collection.update_one(
            {"id": record["id"]},
            {"$set": record},
            upsert=True,
        )
    except PyMongoError as error:
        print(f"Could not save analysis to MongoDB: {error}")


def serialize_analysis_record(record):
    record = dict(record)
    record.pop("_id", None)
    return record


def normalize_percent(value, fallback):
    if isinstance(value, int):
        return max(0, min(100, value))
    if isinstance(value, float):
        return max(0, min(100, round(value)))
    if isinstance(value, str):
        digits = "".join(char for char in value if char.isdigit())
        if digits:
            return max(0, min(100, int(digits)))
    return fallback


def get_rank(score):
    if score >= 85:
        return "Optimized"
    if score >= 72:
        return "Strong Match"
    if score >= 60:
        return "Ready for Review"
    return "Needs Alignment"


def validate_resume_text(resume_text, source="document"):
    normalized = re.sub(r"\s+", " ", resume_text or "").strip()
    words = re.findall(r"[A-Za-z][A-Za-z+#.-]*", normalized)

    if len(normalized) < 250 or len(words) < 40:
        source_label = "PDF" if source == "pdf" else "resume text"
        raise HTTPException(
            status_code=422,
            detail=(
                f"This {source_label} does not contain enough readable resume content. "
                "Please provide a complete resume, not a scanned image or unrelated document."
            )
        )

    resume_markers = [
        "experience", "employment", "work history", "skills", "technical skills",
        "education", "projects", "certifications", "summary", "objective",
        "linkedin", "github", "portfolio", "resume", "curriculum vitae"
    ]
    contact_patterns = [
        r"[\w.+-]+@[\w-]+\.[\w.-]+",
        r"(\+?\d[\d\s().-]{7,}\d)",
    ]

    marker_hits = sum(1 for marker in resume_markers if marker in normalized.lower())
    has_contact = any(re.search(pattern, normalized) for pattern in contact_patterns)

    if marker_hits < 2 and not has_contact:
        next_step = (
            "Please upload a resume PDF with sections such as experience, skills, education, or projects."
            if source == "pdf"
            else "Please paste a complete resume with sections such as experience, skills, education, or projects."
        )
        raise HTTPException(
            status_code=422,
            detail=(
                f"This {source} does not look like a resume. "
                f"{next_step}"
            )
        )

    return normalized


def build_analysis_record(data, parsed):
    ats_score = normalize_percent(
        parsed.get("atsScore", parsed.get("ats_score")),
        70
    )
    match_rate = normalize_percent(
        parsed.get("matchRate", parsed.get("match_percentage")),
        75
    )

    suggestions = parsed.get("aiSuggestions", parsed.get("suggestions", []))
    if isinstance(suggestions, str):
        suggestions = [suggestions]

    missing_skills = parsed.get("missingSkills", parsed.get("missing_skills", []))
    if not isinstance(missing_skills, list):
        missing_skills = []

    return {
        "id": f"anal-{os.urandom(4).hex()}",
        "candidateName": data.candidateName or "Untitled Candidate",
        "jobTitle": data.jobTitle or "Target Role",
        "atsScore": ats_score,
        "matchRate": match_rate,
        "rank": parsed.get("rank") or get_rank(ats_score),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "missingSkills": missing_skills,
        "aiSuggestions": suggestions[:3] or [
            "Add role-specific keywords from the job description to the skills and experience sections.",
            "Quantify achievements with measurable business or engineering impact.",
            "Move the most relevant technical skills closer to the top of the resume."
        ],
        "resumeSummary": parsed.get("resumeSummary", parsed.get("resume_summary", "")),
        "jobDescriptionText": data.jobDescriptionText,
        "resumeText": data.resumeText,
    }


def fallback_analysis(data):
    job_text = data.jobDescriptionText.lower()
    resume_text = data.resumeText.lower()
    skills = [
        "React", "TypeScript", "Node.js", "Python", "FastAPI", "SQL", "AWS",
        "Docker", "Kubernetes", "Terraform", "Redis", "CI/CD", "Git",
        "Product Management", "Agile", "Scrum", "Analytics", "Machine Learning"
    ]

    present = []
    missing = []
    for skill in skills:
        key = skill.lower()
        if key in job_text:
            if key in resume_text:
                present.append(skill)
            else:
                missing.append(skill)

    if not present and not missing:
        important_terms = [
            word.strip(".,:;()[]{}").lower()
            for word in data.jobDescriptionText.split()
            if len(word.strip(".,:;()[]{}")) > 4
        ]
        unique_terms = list(dict.fromkeys(important_terms))[:20]
        present = [term for term in unique_terms if term in resume_text]
        missing = [term.title() for term in unique_terms if term not in resume_text][:4]

    total = len(present) + len(missing)
    match_ratio = len(present) / total if total else 0.5
    ats_score = max(45, min(96, round(55 + match_ratio * 40)))
    match_rate = max(40, min(100, round(50 + match_ratio * 45)))

    if not missing:
        missing = ["Measurable Impact", "Role-Specific Keywords"]

    return build_analysis_record(data, {
        "atsScore": ats_score,
        "matchRate": match_rate,
        "rank": get_rank(ats_score),
        "missingSkills": missing[:5],
        "aiSuggestions": [
            "Mirror the highest-priority job-description keywords in the resume summary and skills sections.",
            f"Add evidence for {', '.join(missing[:2])} through projects, certifications, or measurable outcomes.",
            "Rewrite experience bullets to include metrics, scope, tools used, and business impact."
        ],
        "resumeSummary": (
            f"{data.candidateName or 'The candidate'} shows a {get_rank(ats_score).lower()} "
            f"alignment with {data.jobTitle or 'the target role'}, based on visible keyword overlap."
        )
    })


async def run_ai_analysis(data):
    result = None

    if not client:
        result = fallback_analysis(data)
        save_analysis_record(result)
        return result

    prompt = f"""
Analyze this resume against the job description.

Candidate Name: {data.candidateName}
Job Title: {data.jobTitle}

Resume:
{data.resumeText}

Job Description:
{data.jobDescriptionText}

Return ONLY valid JSON in this exact format:

{{
  "atsScore": 85,
  "matchRate": 78,
  "rank": "Strong Match",
  "missingSkills": ["Docker", "AWS"],
  "aiSuggestions": [
    "Add more backend project detail.",
    "Include measurable business impact.",
    "Move relevant skills higher in the resume."
  ],
  "resumeSummary": "Brief 1-2 sentence summary of fit."
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        result = build_analysis_record(data, json.loads(content))
    except Exception:
        result = fallback_analysis(data)

    save_analysis_record(result)
    return result

# Root route
@app.get("/")
def home():
    return {
        "message": "HireMind AI Backend Running"
    }


@app.get("/api/history")
def get_analysis_history(limit: int = 20):
    collection = get_analyses_collection()
    if collection is None:
        return {
            "items": [],
            "warning": "MongoDB is not connected. Start MongoDB or set MONGODB_URI to enable history."
        }

    limit = max(1, min(limit, 100))
    records = collection.find({}, {"resumeText": 0, "jobDescriptionText": 0}).sort("timestamp", DESCENDING).limit(limit)
    return {
        "items": [serialize_analysis_record(record) for record in records]
    }

# Resume analysis route
@app.post("/analyze")
async def analyze_resume(
    request: Request,
    resume: UploadFile = File(...)
):
    try:
        filename = resume.filename or ""
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Please upload a PDF resume.")

        form = await request.form()
        job_description = str(form.get("job_description") or form.get("jobDescriptionText") or "")
        candidate_name = str(form.get("candidate_name") or form.get("candidateName") or "")
        job_title = str(form.get("job_title") or form.get("jobTitle") or "")

        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required.")

        # Read uploaded PDF
        file_bytes = await resume.read()

        # Extract and validate resume text
        try:
            resume_text = extract_text_from_pdf(file_bytes)
        except Exception:
            raise HTTPException(
                status_code=422,
                detail="Could not read this PDF. Please upload a valid text-based resume PDF."
            )

        resume_text = validate_resume_text(resume_text, source="pdf")

        data = TextAnalyzeRequest(
            resumeText=resume_text,
            jobDescriptionText=job_description,
            candidateName=candidate_name or resume.filename.rsplit(".", 1)[0],
            jobTitle=job_title or "Target Role",
        )
        return await run_ai_analysis(data)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_resume_text(data: TextAnalyzeRequest):
    try:
        if not data.resumeText.strip() or not data.jobDescriptionText.strip():
            raise HTTPException(
                status_code=400,
                detail="Both resume text and job description are required."
            )
        data.resumeText = validate_resume_text(data.resumeText, source="resume text")
        return await run_ai_analysis(data)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
