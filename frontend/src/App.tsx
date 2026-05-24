/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { AnalysisHistoryItem, AnalysisRecord } from "./types";
import Header from "./components/Header";
import AnalyzeView from "./components/AnalyzeView";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export default function App() {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);

  const loadAnalysisHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`);
      if (!res.ok) return;
      const payload = await res.json();
      setAnalysisHistory(payload.items || []);
    } catch {
      setAnalysisHistory([]);
    }
  };

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  // Run ATS Gemini Analysis call
  const handleAnalyzeResume = async (
    resumeText: string,
    jobText: string,
    candidateName: string,
    jobTitle: string,
    resumeFile?: File | null
  ): Promise<AnalysisRecord> => {
    if (resumeFile) {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobText);
      formData.append("candidate_name", candidateName);
      formData.append("job_title", jobTitle);

      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.detail || payload.error || "Server processing failed.");
      }

      const result = await res.json();
      setAnalysisHistory((items) => [result, ...items.filter((item) => item.id !== result.id)].slice(0, 20));
      return result;
    }

    const res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescriptionText: jobText, candidateName, jobTitle })
    });

    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.detail || payload.error || "Server processing failed.");
    }

    const result = await res.json();
    setAnalysisHistory((items) => [result, ...items.filter((item) => item.id !== result.id)].slice(0, 20));
    return result;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] text-[#1A1A1E] font-sans">
      {/* Pristine Floating Header */}
      <Header />

      <div className="max-w-[1240px] mx-auto px-6 pt-24 pb-16">
        <main className="w-full mt-4">
          <AnalyzeView onAnalyze={handleAnalyzeResume} analysisHistory={analysisHistory} />
        </main>
      </div>
    </div>
  );
}
