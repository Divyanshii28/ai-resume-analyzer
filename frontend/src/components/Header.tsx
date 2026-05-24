/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-4 left-6 right-6 z-50 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-14">
      <div className="flex justify-between items-center h-full px-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-black text-[#C7F284] p-1 rounded-lg border border-black shadow-[1px_1px_0px_0px_#C7F284]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-sans text-sm font-black tracking-tight text-black">Resume Analyser</span>
          </div>
        </div>
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-neutral-500">
          ATS Resume Analysis
        </span>
      </div>
    </header>
  );
}
