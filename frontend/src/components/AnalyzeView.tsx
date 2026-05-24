/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Sparkles, UploadCloud, ListChecks, Lightbulb, Trash2, CheckCircle2, History } from "lucide-react";
import { AnalysisHistoryItem, AnalysisRecord } from "../types";

interface AnalyzeViewProps {
  onAnalyze: (
    resumeText: string,
    jobText: string,
    candidateName: string,
    jobTitle: string,
    resumeFile?: File | null
  ) => Promise<AnalysisRecord>;
  analysisHistory: AnalysisHistoryItem[];
}

export default function AnalyzeView({ onAnalyze, analysisHistory }: AnalyzeViewProps) {
  // State for content inputs
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");

  const [jobText, setJobText] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // Active method tabs for uploading custom resumes
  const [resumeInputMode, setResumeInputMode] = useState<"upload" | "paste">("upload");

  // Interaction and API state managers
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentResult, setCurrentResult] = useState<AnalysisRecord | null>(null);

  // Hidden references
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseFile = (file: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "txt" && extension !== "pdf") {
      setErrorMsg("Please upload a .pdf or .txt resume, or paste the resume text directly.");
      return;
    }
    setErrorMsg("");

    // Auto populate metadata from name
    const rawName = file.name.replace(/\.[^/.]+$/, "");
    setCandidateName(rawName);

    if (extension === "pdf") {
      setResumeFile(file);
      setResumeText("");
      setSuccessMsg(`PDF ready for analysis: "${file.name}"`);
      setTimeout(() => setSuccessMsg(""), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setResumeFile(null);
        setResumeText(content);
        setResumeInputMode("paste"); // pop editor view
        setSuccessMsg(`Successfully parsed candidate dataset from: "${file.name}"`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  };

  // Core submission trigger
  const handleTriggerAnalysis = async () => {
    setErrorMsg("");
    if (!resumeText.trim() && !resumeFile) {
      setErrorMsg("Please provide, upload, or drag in a candidate resume first.");
      return;
    }
    if (!jobText.trim()) {
      setErrorMsg("Please provide a target job requirement spec to score against.");
      return;
    }

    setIsLoading(true);
    // Smooth scroll page to results view on mobile
    if (window.innerWidth < 1024) {
      document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
    }

    try {
      const finalName = candidateName.trim() || "Untitled Candidate";
      const finalJobTitle = jobTitle.trim() || "Target Corporate Role";

      // Trigger high precision server analysis
      const analysisRecord = await onAnalyze(
        resumeText,
        jobText,
        finalName,
        finalJobTitle,
        resumeFile
      );

      setCurrentResult(analysisRecord);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected issue occurred while evaluating.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-[fadeIn_0.3s_ease]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1A1A1E]">Resume Analysis</h1>
        <p className="font-sans text-sm text-neutral-500 max-w-2xl mt-2 leading-relaxed">
          Upload a candidate resume and provide a job description to generate high-precision ATS
          compatibility scores and actionable improvement suggestions. Powered by Gemini.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-black text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Trash2 className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-[#1A1A1E] text-white rounded-2xl text-xs font-bold flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#C7F284] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-[10px] uppercase font-black tracking-widest text-[#C7F284] hover:underline cursor-pointer">OK</button>
        </div>
      )}

      {/* Layout Split Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT COLUMN: Input Modules */}
        <section className="flex flex-col gap-6">

          {/* Resume Upload Bento Card */}
          <div className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <span className="font-sans text-[10px] font-black uppercase tracking-wider text-neutral-500">
                1. Candidate Resume Parameters
              </span>
              <div className="flex gap-1.5 bg-neutral-100 p-1 border border-neutral-300 rounded-xl">
                <button
                  type="button"
                  onClick={() => setResumeInputMode("upload")}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    resumeInputMode === "upload" ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                  }`}
                >
                  File Drag
                </button>
                <button
                  type="button"
                  onClick={() => setResumeInputMode("paste")}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    resumeInputMode === "paste" ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                  }`}
                >
                  Edit Copy
                </button>
              </div>
            </div>

            {/* Drag File container */}
            {resumeInputMode === "upload" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer group select-none ${
                  isDragging
                    ? "border-black bg-neutral-50"
                    : "border-neutral-200 hover:border-black hover:bg-neutral-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt"
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-neutral-400 mb-4 group-hover:text-black transition-colors" />
                <h3 className="font-sans text-sm font-extrabold text-[#1A1A1E] mb-1">
                  Drop candidate resume here
                </h3>
                <p className="font-sans text-xs text-neutral-500 font-medium">
                  Supports .pdf and .txt, or paste resume text in edit mode
                </p>
                {(resumeText || resumeFile) && (
                  <div className="mt-4 bg-neutral-100 text-[10px] font-mono text-neutral-700 px-3 py-1.5 rounded-xl border border-black/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C7F284] border border-black shadow-[1px_1px_0px_0px_#000] animate-pulse"></span>
                    <span>
                      {resumeFile
                        ? `PDF active (${resumeFile.name})`
                        : `Dataset active (${resumeText.length} characters loaded)`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Raw Paste state
              <div className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 uppercase font-black">Candidate Name</label>
                    <input
                      type="text"
                      placeholder="E.g. Michael Vance"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="text-xs p-2.5 bg-neutral-50 border-2 border-black focus:outline-none focus:scale-[1.01] rounded-xl transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 uppercase font-black">Professional Title</label>
                    <input
                      type="text"
                      placeholder="E.g. DevOps Lead"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      className="text-xs p-2.5 bg-neutral-50 border-2 border-black focus:outline-none focus:scale-[1.01] rounded-xl transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-black">Raw Resume Content</label>
                  <textarea
                    placeholder="Provide full parsed resume career history, skills, experience, and certifications..."
                    value={resumeText}
                    onChange={(e) => {
                      setResumeFile(null);
                      setResumeText(e.target.value);
                    }}
                    className="w-full h-44 bg-neutral-50 border-2 border-black p-3 font-sans text-xs focus:outline-none focus:scale-[1.01] resize-none transition-all rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Job description input Bento Card */}
          <div className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5">
            <span className="font-sans text-[10px] font-black uppercase tracking-wider text-neutral-500 border-b border-black/10 pb-3">
              2. Target Corporate Job Description Spec
            </span>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-black">Role Specification Title</label>
                <input
                  type="text"
                  placeholder="E.g. Senior Fintech Consultant"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="text-xs p-2.5 bg-neutral-50 border-2 border-black focus:outline-none focus:scale-[1.01] rounded-xl transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-black">Required Keyword parameters & expectations</label>
                <textarea
                  placeholder="Paste description coords, requirements, tech stack (e.g. React, Terraform), and key roles..."
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  className="w-full h-44 bg-neutral-50 border-2 border-black p-3 font-sans text-xs focus:outline-none focus:scale-[1.01] resize-none transition-all rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Trigger scan button styled cleanly */}
          <button
            onClick={handleTriggerAnalysis}
            disabled={isLoading}
            className="w-full bg-[#C7F284] text-black border-2 border-black p-5 font-sans text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:bg-neutral-100 disabled:text-neutral-400 disabled:shadow-none disabled:translate-y-0 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4.5 h-4.5 text-black ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Running Compatibility Assessment..." : "Analyze Candidate Resume"}</span>
          </button>

          {analysisHistory.length > 0 && (
            <div className="bg-white border-2 border-black p-5 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-sans text-xs font-black uppercase tracking-wide text-neutral-800 border-b border-black/10 pb-3 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-700" />
                <span>Recent Analyses</span>
              </h3>
              <div className="flex flex-col gap-3">
                {analysisHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border border-black/10 rounded-xl p-3 bg-neutral-50">
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-black text-black truncate">{item.candidateName}</p>
                      <p className="font-sans text-[10px] font-bold text-neutral-500 truncate">{item.jobTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-sans text-sm font-black text-black">{item.atsScore}</p>
                      <p className="font-sans text-[9px] font-black uppercase tracking-widest text-neutral-400">ATS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Bento Results Block */}
        <section className="flex flex-col gap-6 lg:sticky lg:top-24" id="results-panel">

          {/* Skeleton Load indicators */}
          {isLoading ? (
            <div className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-pulse">
              <div>
                <div className="h-4 bg-neutral-200 rounded-lg w-32 mb-4"></div>
                <div className="grid grid-cols-2 gap-4 divide-x divide-neutral-200">
                  <div className="flex flex-col items-center">
                    <div className="h-10 bg-neutral-200 rounded-lg w-16 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded-lg w-20"></div>
                  </div>
                  <div className="flex flex-col items-center pl-4">
                    <div className="h-10 bg-neutral-200 rounded-lg w-16 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded-lg w-28"></div>
                  </div>
                </div>
              </div>
              <div className="border-t-2 border-neutral-100 pt-6">
                <span className="h-4 bg-neutral-200 rounded-lg w-44 mb-4 block"></span>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-neutral-200 rounded-lg w-20"></div>
                  <div className="h-6 bg-neutral-200 rounded-lg w-24"></div>
                </div>
              </div>
            </div>
          ) : currentResult ? (
            // ACTIVE MULTI-BLOCK BENTO GRID RESULTS
            <div className="flex flex-col gap-6">

              {/* Score bento block: GREEN TINT SLATE */}
              <div className="bg-[#C7F284] border-2 border-black p-6 grid grid-cols-2 gap-4 divide-x divide-black/10 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="font-sans text-[9px] text-[#1A1A1E] font-black uppercase tracking-wider mb-2">
                    ATS Score
                  </span>
                  <div className="text-5xl font-black text-black tracking-tighter leading-none">
                    {currentResult.atsScore}
                  </div>
                  <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#1A1A1E] mt-3 bg-white border border-black px-2.5 py-0.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {currentResult.rank}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center pl-4 py-2">
                  <span className="font-sans text-[9px] text-[#1A1A1E] font-black uppercase tracking-wider mb-2">
                    Match Rate
                  </span>
                  <div className="text-5xl font-black text-black tracking-tighter leading-none">
                    {currentResult.matchRate}%
                  </div>
                  <div className="w-full bg-[#1A1A1E]/10 mt-4 h-2 overflow-hidden rounded-full max-w-[140px] border border-black/10">
                    <div
                      className="bg-black h-full transition-all duration-1000"
                      style={{ width: `${currentResult.matchRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Brief Executive Summary Bento: PINK TINT SLATE */}
              {currentResult.resumeSummary && (
                <div className="bg-[#FFD1DA] border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] text-neutral-800 font-black uppercase tracking-widest block mb-1">Executive Summary Report</span>
                  <p className="font-sans text-xs font-bold text-neutral-800 leading-relaxed">
                    "{currentResult.resumeSummary}"
                  </p>
                </div>
              )}

              {/* Missing Skills Bento Spot */}
              <div className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-sans text-xs font-black uppercase tracking-wide text-neutral-800 border-b border-black/10 pb-3 mb-4 flex items-center gap-2">
                  <ListChecks className="w-4.5 h-4.5 text-neutral-700" />
                  <span>Missing Skills &amp; Keywords</span>
                </h3>
                {currentResult.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentResult.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#E0E7FF] border-2 border-black font-sans text-xs font-bold text-black flex items-center gap-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <span className="text-neutral-500 font-extrabold">+</span> {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-xs text-neutral-500 italic font-medium">No critical missing keywords! The resume aligns completely with target tags.</p>
                )}
              </div>

              {/* AI Strategic Suggestions lists */}
              <div className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-sans text-xs font-black uppercase tracking-wide text-neutral-800 border-b border-black/10 pb-3 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4.5 h-4.5 text-neutral-700" />
                  <span>AI Actionable Advice</span>
                </h3>
                <ul className="flex flex-col gap-4">
                  {currentResult.aiSuggestions.map((tip, idx) => {
                    const formattedTip = tip.replace(/^\d+[\.\s]*/, "");
                    const serial = String(idx + 1).padStart(2, "0");
                    return (
                      <li key={idx} className="flex gap-4 items-start">
                        <span className="font-sans font-black text-xs text-black mt-0.5 shrink-0 bg-[#C7F284] border border-black w-6 h-6 flex items-center justify-center rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {serial}
                        </span>
                        <p className="font-sans text-xs text-neutral-700 font-medium leading-relaxed">
                          {formattedTip}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
          ) : (
            // Awaiting coordinates state
            <div className="bg-white border-2 border-dashed border-black/40 rounded-[32px] p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-neutral-400 mb-4 animate-[bounce_2s_infinite]" />
              <h3 className="font-sans text-xs font-black text-neutral-700 uppercase tracking-widest mb-1.5">Awaiting Coordinates</h3>
              <p className="font-sans text-xs text-neutral-500 font-medium max-w-xs leading-relaxed">
                Provide resume inputs or click a quick fastloader preset card on the left columns, then press the <strong className="text-black font-bold">Analyze Candidate Resume</strong> trigger to produce intelligence.
              </p>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
