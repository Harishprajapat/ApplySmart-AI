import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  User, 
  Target, 
  TrendingUp, 
  Terminal, 
  AlertCircle, 
  BadgeAlert,
  Zap
} from 'lucide-react';
export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState('bullets');
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Spotlight mouse track
  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - card.left,
      y: e.clientY - card.top,
    });
  };
  const transformData = {
    summary: {
      before: {
        score: 35,
        title: "Generic Objective Fluff",
        text: "Motivated and hardworking React developer looking for a challenging role in an esteemed organization where I can grow my professional career, utilize my HTML/CSS skills, and add maximum value to the team.",
        flaws: [
          "Outdated 'Objective' format",
          "Vague, generic filler words",
          "Zero core technologies listed",
          "Focuses on what you want, not what you offer"
        ]
      },
      after: {
        score: 89,
        title: "High-Impact Value Hook",
        text: "Frontend Engineer with 3+ years of experience engineering high-performance React & Next.js applications. Proven track record of reducing bundle sizes by 42%, improving Lighthouse performance scores to 98, and directly boosting product conversion rates by 14%.",
        wins: [
          "Modern recruiter-ready summary",
          "Clear experience and specialization",
          "Quantifiable business achievements",
          "ATS-optimized key technologies"
        ]
      },
      feedback: "Recruiters spend 6 seconds reading your resume. A generic summary is an instant skip. Surfacing technical metrics immediately keeps them reading."
    },
    bullets: {
      before: {
        score: 42,
        title: "Passive Duties",
        text: "Responsible for writing React code, building UI components, fixing bugs, and integrating backend REST APIs. Attended daily standups and collaborated with the product team.",
        flaws: [
          "Weak passive phrasing ('Responsible for')",
          "No performance metrics or numbers",
          "Zero engineering complexity explained",
          "Reads like a job description list"
        ]
      },
      after: {
        score: 92,
        title: "Impact-Driven Achievements",
        text: "Refactored legacy dashboard using React Query & component virtualization, cutting initial API latency by 45% and saving 18+ server-side computing hours weekly. Orchestrated smooth Redux Toolkit integration for 15k+ active monthly users.",
        wins: [
          "Strong action-oriented engineering verbs",
          "Hard metrics (45% latency, 18+ hours saved)",
          "Highlights complex tooling & scale (15k+ users)",
          "Shows proactive architecture mindset"
        ]
      },
      feedback: "The old 'Responsible for' bullet points describe what you were supposed to do. The rewritten bullet points prove the business value you actually delivered."
    },
    skills: {
      before: {
        score: 28,
        title: "Unstructured Fluff List",
        text: "HTML, CSS, JavaScript, React, Redux, Teamwork, Hardworking, Fast Learner, Good Communication, Microsoft Word, Excel, VS Code.",
        flaws: [
          "Soft skills waste valuable resume space",
          "Shows general tools instead of core engineering skills",
          "No categorization or structure",
          "Drowns high-value keywords in fluff"
        ]
      },
      after: {
        score: 96,
        title: "ATS-Optimized Technical Matrix",
        text: "• Core Tech: React, Next.js, TypeScript, JavaScript (ES6+)\n• State & APIs: Redux Toolkit, React Query, REST, GraphQL\n• Styling & UI: TailwindCSS, CSS Modules, Framer Motion\n• Testing & Tools: Jest, Cypress, Git, Webpack, Vite",
        wins: [
          "ATS-compliant structural categorization",
          "100% focused on high-demand modern tech stack",
          "No non-technical filler words",
          "High density of keywords searched by recruiters"
        ]
      },
      feedback: "ATS scanners parse resumes for exact matching keyword strings. Categorizing your skills makes you rank top-tier in recruiter queries instantly."
    }
  };
  const current = transformData[activeTab];
  return (
    <section id="preview" className="relative py-24 sm:py-32 overflow-hidden bg-black text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 fill-red-400/20" />
              Before / After Rewrite
            </div>
            
            <h2 className="text-balance text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl text-white leading-tight">
              Same profile. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-rose-500">
                Sharper signal.
              </span>
            </h2>
            
            <p className="text-lg leading-relaxed text-zinc-400">
              Stop guessing if your resume is good. We transform passive descriptions into metric-driven achievements that make recruiters pick up the phone.
            </p>
            {/* Interactive Tab Selectors */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: 'summary', label: '1. Profile Summary' },
                { id: 'bullets', label: '2. Bullet Points' },
                { id: 'skills', label: '3. Technical Skills' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] border border-red-400/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* AI Advisor Card */}
            <div className="rounded-2xl border border-red-500/10 bg-gradient-to-br from-red-950/20 to-transparent p-5">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-300">Why this makes you stand out:</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {current.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Right Visual Dashboard Mockup */}
          <div className="relative">
            {/* Ambient Background Glow behind Card */}
            <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-red-500 to-rose-500 opacity-20 blur-3xl pointer-events-none" />
            {/* Main Interactive Spotlight Card */}
            <div 
              onMouseMove={handleMouseMove}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl transition-all duration-500"
            >
              {/* Spotlight Glow Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(650px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239,68,68,0.08), transparent 45%)`
                }}
              />
              {/* Card Browser Bar */}
              <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/50 px-6 py-4 relative z-10">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <span className="rounded-full bg-black/60 px-4 py-1 text-xs font-semibold text-zinc-500 border border-white/5 tracking-wider font-mono">
                  applysmart.ai/transform
                </span>
                <div className="w-14" /> {/* Spacer */}
              </div>
              {/* Side-by-Side Comparison Container */}
              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto_1fr] relative z-10">
                
                {/* BEFORE COLUMN (Left) */}
                <div className="flex flex-col justify-between rounded-2xl border border-red-500/10 bg-red-950/5 p-5 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                        Before ApplySmart
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20">
                        Weak Signal
                      </span>
                    </div>
                    {/* Progress score */}
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-6xl font-black tracking-[-0.08em] text-zinc-100 font-mono">
                        {current.before.score}
                      </span>
                      <span className="text-zinc-500 font-mono font-medium">/100</span>
                    </div>
                    {/* Accurate styled progress bar */}
                    <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-out" 
                        style={{ width: isMounted ? `${current.before.score}%` : '0%' }}
                      />
                    </div>
                    <div className="mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        {current.before.title}
                      </h4>
                      <p className="rounded-xl bg-zinc-900/60 p-3.5 text-sm leading-relaxed text-zinc-400 border border-white/5 italic">
                        "{current.before.text}"
                      </p>
                    </div>
                  </div>
                  {/* Red flags list */}
                  <div className="mt-6 border-t border-white/5 pt-4 space-y-2">
                    {current.before.flaws.map((flaw, i) => (
                      <div key={i} className="flex gap-2 text-xs text-red-400/90 items-start">
                        <X className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{flaw}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Arrow Transition Column */}
                <div className="flex items-center justify-center py-2 lg:py-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                    <ArrowRight className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                {/* AFTER COLUMN (Right) */}
                <div className="flex flex-col justify-between rounded-2xl border border-green-500/10 bg-green-950/5 p-5 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                        After AI Optimize
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                        Recruiter Ready
                      </span>
                    </div>
                    {/* Progress score */}
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-6xl font-black tracking-[-0.08em] text-white font-mono bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                        {current.after.score}
                      </span>
                      <span className="text-zinc-500 font-mono font-medium">/100</span>
                    </div>
                    {/* Accurate styled progress bar */}
                    <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1000 ease-out" 
                        style={{ width: isMounted ? `${current.after.score}%` : '0%' }}
                      />
                    </div>
                    <div className="mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                        {current.after.title}
                      </h4>
                      <div className="rounded-xl bg-zinc-900/60 p-3.5 text-sm leading-relaxed text-zinc-200 border border-white/5 font-medium whitespace-pre-line">
                        {current.after.text}
                      </div>
                    </div>
                  </div>
                  {/* Checkmarks list */}
                  <div className="mt-6 border-t border-white/5 pt-4 space-y-2">
                    {current.after.wins.map((win, i) => (
                      <div key={i} className="flex gap-2 text-xs text-emerald-400/90 items-start">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom Quick Benefits Grid */}
              <div className="grid gap-3 border-t border-white/5 bg-zinc-900/10 p-6 sm:grid-cols-3 relative z-10">
                {[
                  { title: "No filler fluff", desc: "Instantly deletes words like 'team-player', 'creative', and 'hardworking'." },
                  { title: "Metric-first proof", desc: "Converts basic tasks into data-driven achievements with clear margins." },
                  { title: "Recruiter-scanned ready", desc: "Specifically targets search criteria used on Linkedin & ATS filters." }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="group rounded-2xl border border-white/5 bg-zinc-950 p-4 transition-all duration-300 hover:bg-zinc-900/60 hover:border-red-500/10"
                  >
                    <h5 className="font-bold text-xs text-zinc-300 uppercase tracking-wider group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h5>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
