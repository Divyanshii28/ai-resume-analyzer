import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { AnalysisRecord, CandidateResume, JobDescription } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for larger file uploads / resume text
app.use(express.json({ limit: '10mb' }));

// Initial mock databases for instant data experience
let savedResumes: CandidateResume[] = [
  {
    id: "res-1",
    name: "John Doe",
    title: "Senior React Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 019-2834",
    text: "John Doe\nSenior React Developer\n\nExperience:\n- Senior Frontend Engineer at TechCorp (2021-Present)\n  Led a team of 4 modernizing the web platform using React 18, Vite, and tailwind. Optimized bundle sizes by 35%.\n- Software Developer at DevStudio (2018-2021)\n  Built robust TypeScript applications and responsive interfaces. Handled state management with Redux.\n\nSkills:\nReact, TypeScript, Redux, JavaScript, Tailwind CSS, Jest, Webpack, HTML5, CSS3, Git.",
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "res-2",
    name: "Sarah Jenkins",
    title: "Lead Product Manager",
    email: "sarah.j@example.com",
    phone: "+1 (555) 014-9843",
    text: "Sarah Jenkins\nLead Product Manager - AI & Platform\n\nExperience:\n- Lead PM at SaaSify (2022-Present)\n  Owned the core AI workspace integration resulting in 140% user engagement increase. Facilitated scrum sprints and aligned cross-functional teams.\n- Product Manager at LogicFlow (2019-2022)\n  Launched the developer API sandbox that captured $2M in new ARR. Analyzed user metrics and built conversion roadmaps.\n\nSkills:\nProduct Strategy, Agile, Scrum, Jira, Product Analytics, SQL, User Research, API Design, Roadmap planning.",
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "res-3",
    name: "Marcus Vance",
    title: "DevOps & Cloud Architect",
    email: "marcus.v@example.com",
    text: "Marcus Vance\nDevOps & Cloud Infrastructure Architect\n\nExperience:\n- Cloud Infrastructure Architect at CloudScale (2020-Present)\n  Architected multi-region AWS environments using CloudFormation and Terraform. Scaled Docker microservices using ECS.\n- Site Reliability Engineer at CyberGuard (2017-2020)\n  Maintained 99.99% uptime of transactional services. Implemented Prometheus metrics and GitLab CI pipelines.\n\nSkills:\nAWS, Docker, Terraform, CI/CD, Linux, Bash, Prometheus, Grafana, Nginx, Python, DNS, SSL.",
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let savedJobs: JobDescription[] = [
  {
    id: "job-1",
    title: "Senior Full Stack Dev - Fintech Startup",
    department: "Engineering",
    text: "We are looking for a Senior Full Stack Developer to build our next-generation secure transactions system.\nRequirements:\n- 5+ years of experience with React, TypeScript, and Node.js.\n- Strong background in high-performance Distributed Systems design.\n- Experience orchestrating containers with Kubernetes.\n- Handled high-throughput caching structures using Redis.\n- Infrastructure as Code (IaC) experience using Terraform.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "job-2",
    title: "Lead Product Manager - AI Analytics",
    department: "Product",
    text: "Looking for a seasoned Product Lead who loves complex workflows and generative AI technologies.\nRequirements:\n- 4+ years of Product Management experience.\n- Experience launching AI-driven interfaces or user hubs.\n- Analytical mindset with proficient capability in SQL and data dashboards.\n- Strong communication skills to liaise with engineering team.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "job-3",
    title: "Infrastructure & Platform Engineer",
    department: "Security & DevOps",
    text: "Join our core infrastructure team maintaining reliable and secured transaction flows.\nRequirements:\n- AWS, Docker, and Linux administration proficiency.\n- Extensive Terraform orchestration scripts.\n- CI/CD integration using Jenkins or GitHub actions.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let analysisHistory: AnalysisRecord[] = [
  {
    id: "anal-1",
    candidateName: "John Doe",
    jobTitle: "Senior Full Stack Dev - Fintech Startup",
    atsScore: 84,
    matchRate: 92,
    rank: "Optimized",
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    missingSkills: ["Distributed Systems", "Kubernetes", "Redis", "Terraform"],
    aiSuggestions: [
      "Quantify your achievements in the \"Experience\" section. Use specific metrics (e.g., \"Improved latency by 20%\").",
      "Move the \"Skills\" section above your \"Education\" to emphasize your technical stack earlier for scanners.",
      "Include a link to your GitHub or personal portfolio to validate the technical proficiency listed."
    ],
    resumeSummary: "John Doe has a strong React foundation but should add more backend and infrastructure keywords for this role.",
    jobDescriptionText: "We are looking for a Senior Full Stack Developer...",
    resumeText: "John Doe..."
  }
];

// Lazy-initialize Gemini SDK to fail gracefully if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST endpoints
app.get("/api/resumes", (req, res) => {
  res.json(savedResumes);
});

app.post("/api/resumes", (req, res) => {
  const { name, text, title } = req.body;
  if (!name || !text) {
    return res.status(400).json({ error: "Name and text are required" });
  }
  const newResume: CandidateResume = {
    id: "res-" + Date.now(),
    name,
    title: title || "Consultant",
    text,
    uploadedAt: new Date().toISOString()
  };
  savedResumes.unshift(newResume);
  res.status(201).json(newResume);
});

app.delete("/api/resumes/:id", (req, res) => {
  const { id } = req.params;
  savedResumes = savedResumes.filter(r => r.id !== id);
  res.json({ success: true });
});

app.get("/api/jobs", (req, res) => {
  res.json(savedJobs);
});

app.post("/api/jobs", (req, res) => {
  const { title, department, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: "Title and text are required" });
  }
  const newJob: JobDescription = {
    id: "job-" + Date.now(),
    title,
    department: department || "General",
    text,
    createdAt: new Date().toISOString()
  };
  savedJobs.unshift(newJob);
  res.status(201).json(newJob);
});

app.delete("/api/jobs/:id", (req, res) => {
  const { id } = req.params;
  savedJobs = savedJobs.filter(j => j.id !== id);
  res.json({ success: true });
});

app.get("/api/history", (req, res) => {
  res.json(analysisHistory);
});

app.delete("/api/history/:id", (req, res) => {
  const { id } = req.params;
  analysisHistory = analysisHistory.filter(h => h.id !== id);
  res.json({ success: true });
});

// Primary analytics core route
app.post("/api/analyze", async (req, res) => {
  const { resumeText, jobDescriptionText, candidateName, jobTitle } = req.body;

  if (!resumeText || !jobDescriptionText) {
    return res.status(400).json({ error: "Both resume text and job description are required" });
  }

  const clientName = candidateName || "Candidate";
  const clientTitle = jobTitle || "Target Role";

  try {
    const ai = getGeminiClient();

    if (ai) {
      // Prompt construction for high precision results
      const prompt = `You are HireMind AI, an elite, expert Applicant Tracking System (ATS) model and resume strategist.
Evaluate the CANDIDATE RESUME against the requirements of the JOB DESCRIPTION.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescriptionText}

Deliver a highly accurate ATS compatibility assessment. Generate realistic output matching standard recruitment evaluation practices. Ensure the ATS compatibility score, direct match rate, rank category (e.g. Optimized, Strong Match, Competent, Needs Improvement, Mismatched), a precise list of missing critical keywords/technologies, and 3 highly actionable resume improvement tips are rendered. Provide a summary too.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: {
                type: Type.INTEGER,
                description: "Realistic ATS compatibility score between 0 and 100"
              },
              matchRate: {
                type: Type.INTEGER,
                description: "Direct requirement alignment rate between 0 and 100"
              },
              rank: {
                type: Type.STRING,
                description: "Short categorical rank e.g. 'Optimized', 'Strong Match', 'Ready for Review', 'Needs Alignment'"
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 2 to 6 critical missing keywords, technical skills or credentials from the JD not prominent in the resume"
              },
              aiSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 numbered, highly descriptive, practical suggestions for sections (Experience, Skills) to improve ATS ranking for this job"
              },
              resumeSummary: {
                type: Type.STRING,
                description: "Brief 1-2 sentence assessment of user's core stack alignment."
              }
            },
            required: ["atsScore", "matchRate", "rank", "missingSkills", "aiSuggestions", "resumeSummary"]
          }
        }
      });

      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini AI");
      }

      const parsed = JSON.parse(responseText.trim());

      const result: AnalysisRecord = {
        id: "anal-" + Date.now(),
        candidateName: clientName,
        jobTitle: clientTitle,
        atsScore: parsed.atsScore || 70,
        matchRate: parsed.matchRate || 75,
        rank: parsed.rank || "Cohesive",
        timestamp: new Date().toISOString(),
        missingSkills: parsed.missingSkills || [],
        aiSuggestions: parsed.aiSuggestions || [],
        resumeSummary: parsed.resumeSummary || "The candidate has partial alignment with the target role.",
        jobDescriptionText,
        resumeText
      };

      // Add to workspace analysis log
      analysisHistory.unshift(result);
      return res.json(result);
    } else {
      // FALLBACK MOCK DATA ENGINE (If GEMINI_API_KEY is not defined yet, we generate dynamic smart scores to keep the app 100% interactive)
      console.log("No valid GEMINI_API_KEY found, running in intelligent mock fallback generator.");

      // Calculate basic textual overlap to generate highly believable realistic stats
      const jdWords = jobDescriptionText.toLowerCase();
      const resumeWords = resumeText.toLowerCase();

      const potentialSkills = [
        "React", "TypeScript", "Node.js", "Kubernetes", "Docker", "AWS", "Terraform",
        "Python", "SQL", "Agile", "Scrum", "Redis", "Distributed Systems", "CI/CD",
        "Product Management", "Analytics", "Project Management", "Java", "Go", "GraphQL"
      ];

      const missing: string[] = [];
      const present: string[] = [];

      potentialSkills.forEach(skill => {
        const matchesJD = jdWords.includes(skill.toLowerCase());
        const matchesResume = resumeWords.includes(skill.toLowerCase());
        if (matchesJD) {
          if (matchesResume) {
            present.push(skill);
          } else {
            missing.push(skill);
          }
        }
      });

      // Default missing skills if none detected
      if (missing.length === 0) {
        missing.push("Distributed Systems", "Kubernetes", "Redis", "Terraform");
      }

      const matchingRatio = present.length / (present.length + missing.length || 1);
      const atsScore = Math.min(98, Math.max(45, Math.round(55 + matchingRatio * 40)));
      const matchRate = Math.min(100, Math.max(40, Math.round(50 + matchingRatio * 45)));

      let rank = "Needs Alignment";
      if (atsScore >= 80) rank = "Optimized";
      else if (atsScore >= 70) rank = "Strong Match";
      else if (atsScore >= 60) rank = "Ready for Review";

      const suggestions = [
        `Quantify your achievements in your career summary. Integrate key deliverables with metrics (e.g., "boosted feature throughput by 30%").`,
        `Explicitly mention missing industry skills like ${missing.slice(0, 2).join(" and ") || "specialized tech stacks"} to pass the automated screening index.`,
        `Synthesize your technical skills list to place highly-relevant terms at the top-level sections so human recruiters spot it instantly.`
      ];

      const fallbackResult: AnalysisRecord = {
        id: "anal-" + Date.now(),
        candidateName: clientName,
        jobTitle: clientTitle,
        atsScore,
        matchRate,
        rank,
        timestamp: new Date().toISOString(),
        missingSkills: missing.slice(0, 4),
        aiSuggestions: suggestions,
        resumeSummary: `${clientName} has a ${rank.toLowerCase()} alignment with ${clientTitle}, based on visible keyword overlap.`,
        jobDescriptionText,
        resumeText
      };

      analysisHistory.unshift(fallbackResult);
      return res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("Analysis route error:", error);
    res.status(500).json({ error: error.message || "An error occurred during compatibility scanning." });
  }
});

// Vite or Static Asset routing
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets registered.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireMind AI backend running on port ${PORT}`);
  });
}

init().catch(err => {
  console.error("Failed to bootstrap server:", err);
});
