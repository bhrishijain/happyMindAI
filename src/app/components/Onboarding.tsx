"use client";

import React, { useState } from "react";

export interface StudentProfile {
  name: string;
  examName: string;
  examDate: string;
  studyHourGoal: number;
  targetScore: string;
  studyDurationMonths: number;
  currentPreparationLevel: "Beginner" | "Intermediate" | "Advanced";
  coachingType: "Self Study" | "Coaching Institute" | "Online Coaching" | "Mixed";
  mainChallenge: string;
  preferredStudyTime: "Morning" | "Afternoon" | "Evening" | "Night";
}

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

const EXAMS = ["JEE (Main + Advanced)", "NEET", "CUET", "CAT", "GATE", "UPSC", "Board Exams (Class 12)", "Board Exams (Class 10)", "Other"];
const CHALLENGES = [
  "Time Management",
  "Difficulty Understanding Concepts",
  "Mock Test Anxiety",
  "Lack of Motivation",
  "Parental Pressure",
  "Peer Comparison",
  "Vast Syllabus",
  "Balancing Subjects"
];
const PREP_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COACHING_TYPES = ["Self Study", "Coaching Institute", "Online Coaching", "Mixed"] as const;
const STUDY_TIMES = ["Morning", "Afternoon", "Evening", "Night"] as const;

const STEP_LABELS = [
  "Who are you?",
  "Your Exam Target",
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 2;

  // Form state
  const [name, setName] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const maxDateStr = (() => {
    const d = new Date();
    const y = d.getFullYear() + 10;
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) {
      if (examName.length === 0 || examDate.length === 0) return false;
      return examDate >= todayStr && examDate <= maxDateStr;
    }
    return true;
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      examName,
      examDate,
      studyHourGoal: 8,
      targetScore: "",
      studyDurationMonths: 6,
      currentPreparationLevel: "Intermediate",
      coachingType: "Self Study",
      mainChallenge: "Exam Pressure",
      preferredStudyTime: "Morning",
    });
  };

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px",
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(99, 102, 241, 0.1), 0 4px 20px rgba(0,0,0,0.04)",
        overflow: "hidden",
        margin: "auto"
      }}>
        {/* Top gradient bar */}
        <div style={{
          height: "6px",
          background: "linear-gradient(90deg, hsl(250 84% 54%), hsl(280 80% 65%))",
          width: `${progress || 10}%`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }} />

        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🍃</span>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                MindTrack
              </h1>
              <p style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                Student Setup — Step {step} of {TOTAL_STEPS}
              </p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
              {STEP_LABELS[step - 1]}
            </span>
          </div>

          {/* ---- Step 1: Name ---- */}
          {step === 1 && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "#0f172a" }}>
                  Hey there! 👋
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.4 }}>
                  Personal exam wellness companion. Let&apos;s quickly set up your profile.
                </p>
              </div>
              <div>
                <label htmlFor="student-name" style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem", color: "#374151" }}>
                  What should we call you?
                </label>
                <input
                  id="student-name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && setStep(2)}
                  autoFocus
                  style={{ fontSize: "1.05rem", fontWeight: 600, padding: "0.85rem" }}
                />
                {name.length > 0 && name.length < 2 && (
                  <p style={{ color: "hsl(var(--danger))", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                    Please enter at least 2 characters.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ---- Step 2: Exam Info ---- */}
          {step === 2 && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.35rem", color: "#0f172a" }}>
                  Which exam are you targeting, {name}?
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  Set up your target countdown.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem", color: "#374151" }}>
                  Select Exam
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {EXAMS.map(exam => {
                    const isSelected = examName === exam;
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => setExamName(exam)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          border: isSelected ? "2px solid #6366f1" : "1px solid #e2e8f0",
                          background: isSelected ? "#eef2ff" : "#fff",
                          color: isSelected ? "#4f46e5" : "#475569",
                          borderRadius: "16px",
                          cursor: "pointer",
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: "0.8rem",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {exam}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="exam-date-ob" style={{ display: "block", fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.85rem", color: "#374151" }}>
                  Target Exam Date
                </label>
                <input
                  id="exam-date-ob"
                  type="date"
                  value={examDate}
                  min={todayStr}
                  max={maxDateStr}
                  onChange={(e) => setExamDate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Tab") e.preventDefault();
                  }}
                  style={{ padding: "0.75rem", fontSize: "0.95rem" }}
                  required
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.75rem" }}>
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              style={{
                padding: "0.6rem 1.1rem",
                border: "1px solid #e2e8f0",
                background: "white",
                color: step === 1 ? "#cbd5e1" : "#475569",
                borderRadius: "8px",
                cursor: step === 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.85rem"
              }}
            >
              ← Back
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: step === i + 1 ? "18px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i < step ? "#6366f1" : "#e2e8f0",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                style={{
                  padding: "0.6rem 1.25rem",
                  border: "none",
                  background: canProceed() ? "#6366f1" : "#e2e8f0",
                  color: canProceed() ? "white" : "#94a3b8",
                  borderRadius: "8px",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease"
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canProceed()}
                style={{
                  padding: "0.6rem 1.25rem",
                  border: "none",
                  background: canProceed() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0",
                  color: canProceed() ? "white" : "#94a3b8",
                  borderRadius: "8px",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: canProceed() ? "0 4px 12px rgba(99,102,241,0.25)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                Enter Dashboard 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
