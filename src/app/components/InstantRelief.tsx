"use client";

import React, { useState, useEffect, useRef } from "react";
import { StudentProfile } from "./Onboarding";
import { FirebaseAssessmentEntry } from "../utils/firestore";
import { generateGoalRecommendation, GoalType } from "../utils/goalEngine";

interface InstantReliefProps {
  profile: StudentProfile;
  assessments: FirebaseAssessmentEntry[];
  onNavigate: (tab: string) => void;
  onUpdateGoal: (goal: GoalType) => void;
}

export default function InstantRelief({ profile, assessments, onNavigate, onUpdateGoal }: InstantReliefProps) {
  // Read active goal from profile, default to "Better Focus"
  const activeGoal = (profile.mainChallenge as GoalType) || "Better Focus";

  const [selectedGoal, setSelectedGoal] = useState<GoalType>(activeGoal);

  // Sync state if profile challenge updates
  useEffect(() => {
    setSelectedGoal(activeGoal);
  }, [activeGoal]);

  // Goal Recommendation Engine output
  const recommendation = generateGoalRecommendation(selectedGoal, assessments, profile);

  // Breathing states
  const [breatheActive, setBreatheActive] = useState(false);
  const [breatheType, setBreatheType] = useState<"box" | "478" | "equal" | "calm">("box");
  const [breatheState, setBreatheState] = useState({ phase: "Ready", seconds: 0 });

  // Affirmations index
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Checklist items completion tracking
  const [sleepChecks, setSleepChecks] = useState<Record<number, boolean>>({});
  const [balanceChecks, setBalanceChecks] = useState<Record<number, boolean>>({});

  // Reset breathing when switching goals or types
  useEffect(() => {
    setBreatheActive(false);
  }, [selectedGoal, breatheType]);

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

  const handleGoalChange = (goal: GoalType) => {
    setSelectedGoal(goal);
    onUpdateGoal(goal); // Persist in student profile
  };

  const getScoreColor = (score: number) => {
    if (selectedGoal === "Reduce Anxiety") {
      // In Reduce Anxiety, scoreValue represents calmness index
      return score >= 70 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--danger))";
    }
    return score >= 75 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--danger))";
  };

  const renderActiveWidget = () => {
    // 🧘 Breathing Visuals
    if (selectedGoal === "Better Focus" || selectedGoal === "Reduce Anxiety") {
      const getBreatheScale = () => {
        if (breatheState.phase === "Inhale") return "scale(1.25)";
        if (breatheState.phase === "Hold (Full)") return "scale(1.25)";
        if (breatheState.phase === "Exhale") return "scale(0.95)";
        if (breatheState.phase === "Hold (Empty)") return "scale(0.95)";
        return "scale(1)";
      };

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", margin: "1rem 0" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
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

          <div style={{
            width: "150px", height: "150px", borderRadius: "50%",
            background: "hsl(var(--primary) / 0.05)",
            border: "2px dashed hsl(var(--primary) / 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: "0.5rem"
          }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "0.9rem",
              transition: "transform 1s ease-in-out",
              transform: getBreatheScale()
            }}>
              {breatheActive ? (
                <>
                  <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>{breatheState.phase}</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>{breatheState.seconds}s</span>
                </>
              ) : (
                <span style={{ fontSize: "1.1rem" }}>Ready</span>
              )}
            </div>
          </div>

          <button
            className={`btn ${breatheActive ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setBreatheActive(!breatheActive)}
            style={{ width: "180px" }}
          >
            {breatheActive ? "Stop Breathing" : "Begin Breathing Cycle"}
          </button>
        </div>
      );
    }

    // ✨ Confidence Affirmation Card
    if (selectedGoal === "Build Confidence") {
      const confidenceAffirmations = [
        "I trust my exam preparation and conceptual understanding completely.",
        "My ultimate value as a human is not bound to a grade. I choose to put effort today.",
        "I am capable, resilient, and ready to navigate complex conceptual blocks.",
        "Mock tests highlight structural review areas. I grow stronger through failures.",
        "I choose to compete with my scores of yesterday, ignoring comparison stressors.",
        "I feel my concentration and calm confidence rising with every topic I complete."
      ];

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", margin: "1rem 0" }}>
          <div style={{
            background: "linear-gradient(135deg, #f0fdf4, #f6fef9)",
            border: "1px dashed #bbf7d0",
            padding: "1.5rem 1rem",
            borderRadius: "var(--radius-md)",
            textAlign: "center",
            width: "100%"
          }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#166534", lineHeight: 1.4, fontStyle: "italic" }}>
              “ {confidenceAffirmations[affirmationIdx]} ”
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setAffirmationIdx((prev) => (prev + 1) % confidenceAffirmations.length)}
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}
          >
            🔄 Next Affirmation
          </button>
        </div>
      );
    }

    // 🛌 Sleep Wind-down Checklist
    if (selectedGoal === "Improve Sleep") {
      const routineItems = [
        "Device power down: Lock away phones and laptops 45m before bed.",
        "Write study lists: Dump remaining syllabus tasks on a notepad to clear loops.",
        "Bed calming breathing: Do 3 minutes of 4-4 Equal breathing in your bed.",
        "Melatonin prep: Keep your room cool, completely dark, and ventilated."
      ];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "0.5rem 0" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
            Complete this routine tonight to restore cognitive recovery balance:
          </p>
          {routineItems.map((item, idx) => {
            const isChecked = !!sleepChecks[idx];
            return (
              <label key={idx} style={{
                display: "flex", gap: "0.75rem", alignItems: "center",
                padding: "0.75rem", background: isChecked ? "var(--bg-accent)" : "#ffffff",
                border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                cursor: "pointer", fontSize: "0.88rem", color: isChecked ? "#94a3b8" : "var(--text-primary)"
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
      );
    }

    // 🚀 Motivation Booster
    if (selectedGoal === "Stay Motivated") {
      const quotes = [
        "Success is the sum of small micro-milestones repeated day in and day out.",
        "Your future self will thank you for opening the books and studying today.",
        "Discipline is choosing between what you want now and what you want most.",
        "Make today count. Even 1 productive hour is better than 0 hours."
      ];

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", margin: "0.5rem 0" }}>
          <div style={{
            background: "linear-gradient(135deg, #fffbeb, #fafaf9)",
            border: "1px dashed #fde68a",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            textAlign: "center",
            width: "100%"
          }}>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#92400e", lineHeight: 1.45 }}>
              💡 {quotes[affirmationIdx % quotes.length]}
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setAffirmationIdx(prev => prev + 1)}
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
          >
            ✨ Draw Motivation Booster
          </button>
        </div>
      );
    }

    // 📝 Balanced Study Plan
    if (selectedGoal === "Maintain Balance") {
      const balanceItems = [
        "Pace study blocks: Spend 50 minutes studying, followed by 10 minutes rest.",
        "Cardiovascular pause: Walk outside for 15-20 minutes during target rest slots.",
        "Connect socially: Chat with family/friends for 15 minutes away from desks.",
        "Decompress shoulders: Stretch upper neck, wrists, and shoulders every 2 hours."
      ];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "0.5rem 0" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
            Complete your self-care balanced checkpoints during today's study blocks:
          </p>
          {balanceItems.map((item, idx) => {
            const isChecked = !!balanceChecks[idx];
            return (
              <label key={idx} style={{
                display: "flex", gap: "0.75rem", alignItems: "center",
                padding: "0.75rem", background: isChecked ? "var(--bg-accent)" : "#ffffff",
                border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                cursor: "pointer", fontSize: "0.88rem", color: isChecked ? "#94a3b8" : "var(--text-primary)"
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
      );
    }

    return null;
  };

  const GOALS: { val: GoalType; label: string; icon: string }[] = [
    { val: "Better Focus", label: "Better Focus", icon: "🎯" },
    { val: "Reduce Anxiety", label: "Reduce Anxiety", icon: "🧘" },
    { val: "Build Confidence", label: "Build Confidence", icon: "✨" },
    { val: "Improve Sleep", label: "Improve Sleep", icon: "🛌" },
    { val: "Stay Motivated", label: "Stay Motivated", icon: "🚀" },
    { val: "Maintain Balance", label: "Maintain Balance", icon: "🌿" }
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Dynamic Header */}
      <div style={{
        background: "linear-gradient(135deg, hsl(250 84% 54%) 0%, hsl(280 80% 65%) 100%)",
        color: "white",
        padding: "1.75rem 2rem",
        borderRadius: "var(--radius-lg)"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.35rem" }}>🤖 Interactive AI Wellness Coach</h2>
        <p style={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.45 }}>
          Select a mindset area where you need help today. The engine calibrates suggestions, checklists, and breathing sessions based on your profile inputs.
        </p>
      </div>

      {/* Goal Selector Grid */}
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
          Pick Your Primary Focus Area:
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem" }}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.val;
            return (
              <button
                key={goal.val}
                type="button"
                className="glass-panel"
                onClick={() => handleGoalChange(goal.val)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "1.25rem 1rem",
                  cursor: "pointer",
                  border: isSelected ? "2px solid hsl(var(--primary))" : "1px solid var(--border-color)",
                  background: isSelected ? "var(--bg-accent)" : "var(--bg-card)",
                  color: isSelected ? "hsl(var(--primary))" : "var(--text-primary)",
                  fontWeight: isSelected ? 700 : 500,
                  transition: "all 0.15s ease",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <span style={{ fontSize: "2rem" }}>{goal.icon}</span>
                <span style={{ fontSize: "0.9rem", textAlign: "center" }}>{goal.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Left Column: Metrics & Suggestions */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Score Index Card */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              border: `6px solid ${getScoreColor(recommendation.scoreValue)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: getScoreColor(recommendation.scoreValue) }}>
                {recommendation.scoreValue}%
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                Wellness Metric
              </span>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.15rem" }}>
                {recommendation.scoreLabel}
              </h4>
            </div>
          </div>

          {/* Suggestions List */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              💡 Actionable Suggestions:
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", paddingLeft: "1.25rem", fontSize: "0.88rem", lineHeight: 1.4 }}>
              {recommendation.suggestions.map((s, idx) => (
                <li key={idx} style={{ color: "var(--text-secondary)" }}>{s}</li>
              ))}
            </ul>
          </div>

          {/* AI Insights Card */}
          <div style={{ background: "var(--bg-accent)", padding: "1.25rem", borderRadius: "var(--radius-sm)", borderLeft: "4px solid hsl(var(--primary))" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "hsl(var(--primary))", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              🧠 Personal Coach Insights
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recommendation.aiInsights.map((insight, idx) => (
                <p key={idx} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {insight}
                </p>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Wellness Actions */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              🎯 Mindset Action & Interactive Tool
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Engage with this dynamic module to calm anxiety or build cognitive focus.
            </p>

            {renderActiveWidget()}
          </div>

          {/* Quick Actions Row */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              ⚡ Quick Redirect Actions:
            </h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {recommendation.quickActions.map((action) => (
                <button
                  key={action.actionKey}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onNavigate(action.actionKey)}
                  style={{ flexGrow: 1, padding: "0.5rem", fontSize: "0.82rem", gap: "0.25rem" }}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
