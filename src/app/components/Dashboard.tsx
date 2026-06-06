"use client";

import React, { useEffect, useState, useRef } from "react";
import { StudentProfile } from "./Onboarding";
import { FirebaseAssessmentEntry } from "../utils/firestore";
import { getQuoteForExam } from "../utils/wellbeing";

interface DashboardProps {
  profile: StudentProfile;
  assessments: FirebaseAssessmentEntry[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ profile, assessments, onNavigate }: DashboardProps) {
  const [quote, setQuote] = useState(() => getQuoteForExam(profile.examName));
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Burning midnight oil";
  });

  useEffect(() => {
    setQuote(getQuoteForExam(profile.examName));
  }, [profile.examName]);

  // Derived data
  const latestAssessment = assessments.length > 0
    ? [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const wellnessScore = latestAssessment?.wellnessScore ?? null;
  const loggedToday = assessments.some(a => a.date === new Date().toISOString().split("T")[0]);

  // Countdown
  const getDaysLeft = () => {
    if (!profile.examDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [year, month, day] = profile.examDate.split("-").map(Number);
    const exam = new Date(year, month - 1, day); exam.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const daysLeft = getDaysLeft();

  const getScoreColor = (s: number) =>
    s >= 80 ? "#16a34a" : s >= 55 ? "#d97706" : "#dc2626";

  const getScoreLabel = (s: number) =>
    s >= 80 ? { emoji: "🌿", text: "Excellent Mindset" }
      : s >= 55 ? { emoji: "⚡", text: "Moderate Pressure" }
      : { emoji: "🚨", text: "High Burnout Risk" };

  // Prep level colour
  const prepColors: Record<string, string> = {
    Beginner: "#0ea5e9", Intermediate: "#8b5cf6", Advanced: "#16a34a"
  };

  // --- Dynamic Focus Action Widget States ---
  const hasSleepDeficit = latestAssessment ? latestAssessment.sleepHours < 7 : false;
  
  // Default to low sleep routine if there is a deficit, otherwise default to the logged focus goal
  const [selectedFocusOverride, setSelectedFocusOverride] = useState<string | null>(null);
  const activeFocus = selectedFocusOverride || (hasSleepDeficit ? "Improve Sleep" : (latestAssessment?.focusGoal || "Better Focus"));

  // Breathing states
  const [breatheActive, setBreatheActive] = useState(false);
  const [breatheType, setBreatheType] = useState<"box" | "478" | "equal" | "calm">("box");
  const [breatheState, setBreatheState] = useState({ phase: "Ready", seconds: 0 });

  // Affirmations shuffle index
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Lists checklists
  const [sleepChecks, setSleepChecks] = useState<Record<number, boolean>>({});
  const [balanceChecks, setBalanceChecks] = useState<Record<number, boolean>>({});

  // Reset breathing when switching focus/type
  useEffect(() => {
    setBreatheActive(false);
  }, [activeFocus, breatheType]);

  // Breathing loop
  useEffect(() => {
    if (!breatheActive) {
      setBreatheState({ phase: "Ready", seconds: 0 });
      return;
    }

    let currentPhase = "Inhale";
    let currentSeconds = breatheType === "calm" ? 5 : 4;
    setBreatheState({ phase: currentPhase, seconds: currentSeconds });

    const interval = setInterval(() => {
      setBreatheState((prev) => {
        if (prev.seconds <= 1) {
          let nextPhase = "Inhale";
          let nextSeconds = 4;

          if (breatheType === "box") {
            if (prev.phase === "Inhale") { nextPhase = "Hold (Full)"; nextSeconds = 4; }
            else if (prev.phase === "Hold (Full)") { nextPhase = "Exhale"; nextSeconds = 4; }
            else if (prev.phase === "Exhale") { nextPhase = "Hold (Empty)"; nextSeconds = 4; }
            else if (prev.phase === "Hold (Empty)") { nextPhase = "Inhale"; nextSeconds = 4; }
          } else if (breatheType === "478") {
            if (prev.phase === "Inhale") { nextPhase = "Hold (Full)"; nextSeconds = 7; }
            else if (prev.phase === "Hold (Full)") { nextPhase = "Exhale"; nextSeconds = 8; }
            else if (prev.phase === "Exhale") { nextPhase = "Inhale"; nextSeconds = 4; }
          } else if (breatheType === "equal") {
            if (prev.phase === "Inhale") { nextPhase = "Exhale"; nextSeconds = 4; }
            else if (prev.phase === "Exhale") { nextPhase = "Inhale"; nextSeconds = 4; }
          } else if (breatheType === "calm") {
            if (prev.phase === "Inhale") { nextPhase = "Hold (Full)"; nextSeconds = 2; }
            else if (prev.phase === "Hold (Full)") { nextPhase = "Exhale"; nextSeconds = 5; }
            else if (prev.phase === "Exhale") { nextPhase = "Inhale"; nextSeconds = 5; }
          }
          return { phase: nextPhase, seconds: nextSeconds };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breatheActive, breatheType]);

  const renderFocusActionCard = () => {
    // 1. Breathing exercises for anxiety or focus
    if (activeFocus === "Better Focus" || activeFocus === "Reduce Anxiety") {
      const getBreatheScale = () => {
        if (breatheState.phase === "Inhale") return "scale(1.25)";
        if (breatheState.phase === "Hold (Full)") return "scale(1.25)";
        if (breatheState.phase === "Exhale") return "scale(0.95)";
        if (breatheState.phase === "Hold (Empty)") return "scale(0.95)";
        return "scale(1)";
      };

      const breatheDescriptions: Record<string, string> = {
        box: "Box Breathing (4-4-4-4): Excellent for calming the nervous system, clearing conceptual fog, and pacing brain logic.",
        "478": "4-7-8 Breathing (4-7-8): A deep relaxation exercise that activates the parasympathetic nerve to drop anxiety levels immediately.",
        equal: "Equal Breathing (4-4): Balances breathing rhythms, settles rapid heart rate, and resets thoughts before studies.",
        calm: "Deep Calm (5-2-5): Extended in-and-out pacing that releases carbon dioxide and calms the amygdala."
      };

      return (
        <div className="glass-panel" style={{ borderLeft: "5px solid hsl(var(--primary))", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.25rem", color: "#0f172a" }}>
              🧘 Breathing Exercise Routine
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Tailored support to manage exam anxiety, reduce study strain, and improve concentration.
            </p>
          </div>

          {/* Sub-types selection */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {(["box", "478", "equal", "calm"] as const).map((type) => {
              const labels = { box: "Box (4-4-4-4)", "478": "4-7-8 Relax", equal: "Equal (4-4)", calm: "Deep Calm (5-2-5)" };
              return (
                <button
                  key={type}
                  className={`btn ${breatheType === type ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setBreatheType(type)}
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderRadius: "20px" }}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4, minHeight: "34px" }}>
            💡 <em>{breatheDescriptions[breatheType]}</em>
          </p>

          {/* Interactive Breathing Ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", margin: "0.5rem 0" }}>
            <div style={{
              width: "140px", height: "140px", borderRadius: "50%",
              background: "hsl(var(--primary) / 0.05)",
              border: "2px dashed hsl(var(--primary) / 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{
                width: "90px", height: "90px", borderRadius: "50%",
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: "0.85rem",
                transition: "transform 1s ease-in-out",
                transform: getBreatheScale()
              }}>
                {breatheActive ? (
                  <>
                    <span style={{ fontSize: "0.7rem", opacity: 0.9 }}>{breatheState.phase}</span>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800 }}>{breatheState.seconds}s</span>
                  </>
                ) : (
                  <span>Ready</span>
                )}
              </div>
            </div>

            <button
              className={`btn ${breatheActive ? "btn-secondary" : "btn-primary"}`}
              onClick={() => setBreatheActive(!breatheActive)}
              style={{ width: "160px", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              {breatheActive ? "Stop Exercise" : "Start Breathing"}
            </button>
          </div>
        </div>
      );
    }

    // 2. Affirmations for Confidence
    if (activeFocus === "Build Confidence") {
      const affirmations = [
        "I have prepared diligently. I trust my logic, memory, and conceptual knowledge.",
        "My scores do not define my self-worth. I will give my sincere effort today.",
        "I am calm, centered, and capable of solving complex questions step-by-step.",
        "Practice mistakes are pathways to correct my gaps. I welcome hard questions to learn.",
        "I have the strength to guide my mind through test anxiety. I choose clarity.",
        "My concentration is sharp, and my confidence is growing stronger with every study block."
      ];

      return (
        <div className="glass-panel" style={{ borderLeft: "5px solid #16a34a", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              ✨ Confidence Mindset Affirmation
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Repeat this focus routine to override mock exam self-doubt and peer comparisons.
            </p>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #f6fef9 100%)",
            border: "1px dashed #bbf7d0",
            padding: "1.5rem 1.25rem",
            borderRadius: "12px",
            textAlign: "center",
            position: "relative"
          }}>
            <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#166534", lineHeight: 1.45, fontStyle: "italic" }}>
              “ {affirmations[affirmationIdx]} ”
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setAffirmationIdx((prev) => (prev + 1) % affirmations.length)}
            style={{ alignSelf: "center", fontSize: "0.82rem", padding: "0.45rem 1rem" }}
          >
            🔄 Shuffle Affirmation
          </button>
        </div>
      );
    }

    // 3. Motivational Booster
    if (activeFocus === "Stay Motivated") {
      const motivationalTips = [
        "Focus on process: Today's study goal is your only metric. The final rank is a compound effect of daily blocks.",
        "Micro milestones: Don't look at the entire massive syllabus. Just write down 3 clear tasks for the next 2 hours.",
        "Accept difficulties: Struggling on a tough MCQ now means you won't make that exact mistake on the final exam day.",
        "Prep a small reward: Schedule a minor 10-minute treat (music, walking, hot beverage) right after your study slot."
      ];

      return (
        <div className="glass-panel" style={{ borderLeft: "5px solid #d97706", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              🚀 Motivation Booster Tips
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              High-energy advice to keep you consistent when exhaustion or burn-out flags rise.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
            {motivationalTips.map((tip, idx) => (
              <div key={idx} style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                padding: "0.75rem", background: idx % 2 === 0 ? "#fffbeb" : "#fafaf9",
                borderRadius: "8px", border: "1px solid #fef3c7"
              }}>
                <span style={{ fontSize: "1rem" }}>⚡</span>
                <p style={{ fontSize: "0.85rem", color: "#92400e", lineHeight: 1.4 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. Sleep Routine Card (Low Sleep alerts automatically redirect here)
    if (activeFocus === "Improve Sleep" || hasSleepDeficit) {
      const routineItems = [
        "Power off screens: Melatonin secretion is delayed by blue light. Put devices away 45m before bed.",
        "List tomorrow's tasks: Write study targets on paper so your brain doesn't loop on unfinished work.",
        "Bed Equal Breathing: Spend 3 minutes doing Equal Inhale/Exhale (4s-4s) in bed to trigger slow heartbeat.",
        "Physical prep: Sip warm water or ensure the room is completely dark and ventilated."
      ];

      return (
        <div className="glass-panel" style={{ borderLeft: "5px solid #dc2626", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                🛌 Sleep Recharge Wind-Down Routine
              </h3>
              {hasSleepDeficit && (
                <span style={{ fontSize: "0.7rem", background: "#fef2f2", color: "#dc2626", padding: "0.15rem 0.5rem", borderRadius: "10px", fontWeight: 700 }}>
                  Sleep Deficit Alert ({latestAssessment?.sleepHours}h)
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.15rem" }}>
              Suggested focus action to recover focus stamina. Tick items as you prepare for rest.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {routineItems.map((item, idx) => {
              const isChecked = !!sleepChecks[idx];
              return (
                <label key={idx} style={{
                  display: "flex", gap: "0.75rem", alignItems: "center",
                  padding: "0.75rem", background: isChecked ? "#f8fafc" : "#ffffff",
                  border: "1px solid var(--border-color)", borderRadius: "8px",
                  cursor: "pointer", fontSize: "0.85rem", color: isChecked ? "#94a3b8" : "#374151"
                }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setSleepChecks(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // 5. Study Plan & Balance planner
    if (activeFocus === "Maintain Balance") {
      const balanceItems = [
        "Pomodoro blocks: Stick to 50 minutes of studying and 10 minutes away from your chair.",
        "Afternoon walking: Take a 15-minute quick outdoor break to restore cognitive capacity.",
        "Social check-in: Spend 15 minutes checking in with family or a friend on non-academic topics.",
        "Physical decompression: Do simple shoulder rolls and neck stretches every 2 hours."
      ];

      return (
        <div className="glass-panel" style={{ borderLeft: "5px solid #06b6d4", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              🌿 Balanced Daily Study Plan
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Protect yourself from over-study fatigue. Check off self-care items during today's study.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {balanceItems.map((item, idx) => {
              const isChecked = !!balanceChecks[idx];
              return (
                <label key={idx} style={{
                  display: "flex", gap: "0.75rem", alignItems: "center",
                  padding: "0.75rem", background: isChecked ? "#f8fafc" : "#ffffff",
                  border: "1px solid var(--border-color)", borderRadius: "8px",
                  cursor: "pointer", fontSize: "0.85rem", color: isChecked ? "#94a3b8" : "#374151"
                }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setBalanceChecks(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "16px",
        padding: "2rem 2.25rem",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: "-50px", right: "100px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.85, marginBottom: "0.25rem" }}>
            {greeting}, 👋
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem", lineHeight: 1.2 }}>
            {profile.name}
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.88, fontStyle: "italic", maxWidth: "480px", lineHeight: 1.4 }}>
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Profile Snapshot Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {/* Exam badge */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Target Exam</span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#4f46e5" }}>
            {profile.examName.split(" ")[0]}
          </span>
        </div>

        {/* Days left badge */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Days Left</span>
          {daysLeft !== null ? (
            <span style={{ fontSize: "1.6rem", fontWeight: 900, color: daysLeft < 30 ? "#dc2626" : daysLeft < 90 ? "#d97706" : "#4f46e5" }}>
              {daysLeft > 0 ? daysLeft : daysLeft === 0 ? "Today!" : `+${Math.abs(daysLeft)}`}
            </span>
          ) : (
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Not set</span>
          )}
        </div>

        {/* Prep level */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Prep Level</span>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: prepColors[profile.currentPreparationLevel] }}>
            {profile.currentPreparationLevel === "Beginner" ? "🌱" : profile.currentPreparationLevel === "Intermediate" ? "🌿" : "🌳"}{" "}
            {profile.currentPreparationLevel}
          </span>
        </div>

        {/* Study goal */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Daily Goal</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#4f46e5" }}>
            {profile.studyHourGoal}<span style={{ fontSize: "0.85rem", fontWeight: 600 }}>h</span>
          </span>
        </div>

        {/* Study mode */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Mode</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#374151" }}>
            {profile.coachingType}
          </span>
        </div>

        {/* Wellness score */}
        <div className="glass-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.35rem" }}>Wellness</span>
          {wellnessScore !== null ? (
            <>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: getScoreColor(wellnessScore) }}>
                {wellnessScore}%
              </span>
              <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b", marginTop: "0.15rem" }}>
                {getScoreLabel(wellnessScore).text}
              </span>
            </>
          ) : (
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>No data yet</span>
          )}
        </div>
      </div>

      {/* ── Assessment CTA / Today's Status ── */}
      <div className="glass-panel" style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        borderLeft: loggedToday ? "5px solid #16a34a" : "5px solid #6366f1"
      }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.4rem" }}>
            {loggedToday
              ? `✅ Today's assessment is complete, ${profile.name}!`
              : `📋 Start today's Daily Wellness Assessment`}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {loggedToday
              ? `Your focus today: "${latestAssessment?.focusGoal}". Remember to take short breaks.`
              : `A quick 7-question check-in tracks your mood, anxiety, sleep, and more — takes under a minute.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => onNavigate("tracker")}>
            {loggedToday ? "View Snapshot" : "Take Survey →"}
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("tools")}>
            🧘 Breathe
          </button>
        </div>
      </div>

      {/* ── Today's Mindset Toggles & Dynamic Suggestion ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
            🎯 Today&apos;s Mindset Action Suggested
          </h2>
          {latestAssessment && (
            <span style={{ fontSize: "0.8rem", color: "#6366f1", fontWeight: 700, background: "#eef2ff", padding: "0.25rem 0.75rem", borderRadius: "20px" }}>
              Focus: {latestAssessment.focusGoal}
            </span>
          )}
        </div>

        {/* Toggle Pills row */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
          {([
            { val: "Better Focus", label: "🧘 Breathing (Focus/Anxiety)" },
            { val: "Build Confidence", label: "✨ Confidence (Affirmation)" },
            { val: "Stay Motivated", label: "🚀 Motivation (Booster)" },
            { val: "Improve Sleep", label: "🛌 Sleep Routine" },
            { val: "Maintain Balance", label: "📝 Study Plan (Balance)" }
          ]).map((item) => {
            const isSelected = activeFocus === item.val || (item.val === "Better Focus" && activeFocus === "Reduce Anxiety");
            return (
              <button
                key={item.val}
                type="button"
                className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSelectedFocusOverride(item.val)}
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.75rem",
                  borderRadius: "20px",
                  fontWeight: isSelected ? 700 : 500
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {renderFocusActionCard()}
      </div>

      {/* ── Today's Snapshot (if completed) ── */}
      {latestAssessment && loggedToday && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

          {/* Mood & Wellness mini card */}
          <div className="glass-panel" style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%", flexShrink: 0,
              border: `6px solid ${getScoreColor(latestAssessment.wellnessScore)}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: getScoreColor(latestAssessment.wellnessScore) }}>
                {latestAssessment.wellnessScore}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>
                Wellness Score
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 800 }}>
                {getScoreLabel(latestAssessment.wellnessScore).emoji} {getScoreLabel(latestAssessment.wellnessScore).text}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Mood: <strong>{latestAssessment.mood}</strong> · Anxiety: <strong>{latestAssessment.anxietyScore}/10</strong>
              </p>
            </div>
          </div>

          {/* Sleep & Study stats */}
          <div className="glass-panel" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Sleep</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: latestAssessment.sleepHours >= 7 ? "#16a34a" : "#dc2626" }}>
                {latestAssessment.sleepHours}h
              </p>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {latestAssessment.sleepHours >= 7 ? "Good" : "Below optimal"}
              </p>
            </div>
            <div style={{ width: "1px", height: "50px", background: "#e2e8f0" }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Study</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#4f46e5" }}>
                {latestAssessment.studyHours}h
              </p>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Goal: 8h
              </p>
            </div>
            <div style={{ width: "1px", height: "50px", background: "#e2e8f0" }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Confidence</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: latestAssessment.confidenceScore >= 6 ? "#16a34a" : "#d97706" }}>
                {latestAssessment.confidenceScore}/10
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Personalized Tip card ── */}
      <div className="glass-panel" style={{ borderLeft: "4px solid #0ea5e9", padding: "1.25rem 1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>
          💡 Personalized Insight for {profile.name}
        </h3>
        <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.55 }}>
          {profile.currentPreparationLevel === "Beginner"
            ? `As a ${profile.examName} beginner, your priority this week is building consistent daily study habits. Aim to stick to your ${profile.studyHourGoal}-hour daily target before optimizing content.`
            : profile.currentPreparationLevel === "Intermediate"
            ? `For a ${profile.examName} candidate in intermediate phase — your biggest leverage point is identifying conceptual gaps in weak subjects through deliberate mock practice. Don't increase study hours; increase study quality.`
            : `At an advanced level, ${profile.name}, you now need to protect your mental recovery as fiercely as you protect your study schedule. Overtraining your brain has diminishing returns in the final phase.`}
          {profile.mainChallenge && ` Your self-identified challenge is **${profile.mainChallenge}** — check the ZenBuddy Counselor tab for targeted support.`}
        </p>
      </div>

    </div>
  );
}
