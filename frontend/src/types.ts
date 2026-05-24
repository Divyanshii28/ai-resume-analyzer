/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalysisResponse {
  atsScore: number;
  matchRate: number;
  rank: string;
  missingSkills: string[];
  aiSuggestions: string[];
  resumeSummary: string;
}

export interface CandidateResume {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  text: string;
  uploadedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  text: string;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  candidateName: string;
  jobTitle: string;
  atsScore: number;
  matchRate: number;
  rank: string;
  timestamp: string;
  missingSkills: string[];
  aiSuggestions: string[];
  resumeSummary: string;
  jobDescriptionText: string;
  resumeText: string;
}

export type AnalysisHistoryItem = Omit<AnalysisRecord, "jobDescriptionText" | "resumeText">;
