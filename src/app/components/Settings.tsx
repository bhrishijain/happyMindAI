"use client";

import React, { useState } from "react";
import { StudentProfile } from "./Onboarding";

interface SettingsProps {
  profile: StudentProfile;
  onUpdateProfile: (p: StudentProfile) => void;
  onLoadMockData: () => void;
  onClearAllData: () => void;
}

const EXAMS = ["JEE (Main + Advanced)", "NEET", "CUET", "CAT", "GATE", "UPSC", "Board Exams (Class 12)", "Board Exams (Class 10)", "Other"];
const PREP_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COACHING_TYPES = ["Self Study", "Coaching Institute", "Online Coaching", "Mixed"] as const;

export default function Settings({ profile, onUpdateProfile, onLoadMockData, onClearAllData }: SettingsProps) {
  const [name, setName] = useState(profile.name);
  const [examName, setExamName] = useState(profile.examName);
  const [examDate, setExamDate] = useState(profile.examDate);
  const [studyHourGoal, setStudyHourGoal] = useState(profile.studyHourGoal);
  const [targetScore, setTargetScore] = useState(profile.targetScore || "");
  const [prepLevel, setPrepLevel] = useState(profile.currentPreparationLevel);
  const [coachingType, setCoachingType] = useState(profile.coachingType);
  const [saved, setSaved] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (examDate && (examDate < todayStr || examDate > maxDateStr)) {
      alert(`Please choose a target date between today and 10 years from now (${maxDateStr}).`);
      return;
    }
    onUpdateProfile({
      ...profile,
      name: name.trim() || profile.name,
      examName,
      examDate,
      studyHourGoal: Number(studyHourGoal),
      targetScore,
      currentPreparationLevel: prepLevel,
      coachingType,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Profile Edit */}
      <div className="glass-panel">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>⚙️ Edit Your Profile</h2>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>

            <div>
              <label htmlFor="s-name" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Your Name</label>
              <input id="s-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label htmlFor="s-exam" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Target Exam</label>
              <select id="s-exam" value={examName} onChange={e => setExamName(e.target.value)}>
                {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="s-date" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Exam Date</label>
              <input id="s-date" type="date" value={examDate} min={todayStr} max={maxDateStr} onChange={e => setExamDate(e.target.value)} onKeyDown={(e) => {
                if (e.key !== "Tab") e.preventDefault();
              }} />
            </div>

            <div>
              <label htmlFor="s-target" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Target Score / Rank</label>
              <input id="s-target" type="text" placeholder="e.g. AIR 500, 99 percentile" value={targetScore} onChange={e => setTargetScore(e.target.value)} />
            </div>

            <div>
              <label htmlFor="s-hours" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Daily Study Goal (hrs)</label>
              <input id="s-hours" type="number" min="1" max="18" value={studyHourGoal} onChange={e => setStudyHourGoal(Number(e.target.value))} required />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Preparation Level</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {PREP_LEVELS.map(l => (
                  <button key={l} type="button" onClick={() => setPrepLevel(l)}
                    style={{
                      padding: "0.4rem 0.9rem", borderRadius: "20px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600,
                      border: prepLevel === l ? "2px solid #6366f1" : "1px solid #e2e8f0",
                      background: prepLevel === l ? "#eef2ff" : "#fff",
                      color: prepLevel === l ? "#4f46e5" : "#64748b"
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.875rem" }}>Study Mode</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {COACHING_TYPES.map(c => (
                  <button key={c} type="button" onClick={() => setCoachingType(c)}
                    style={{
                      padding: "0.4rem 0.9rem", borderRadius: "20px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600,
                      border: coachingType === c ? "2px solid #6366f1" : "1px solid #e2e8f0",
                      background: coachingType === c ? "#eef2ff" : "#fff",
                      color: coachingType === c ? "#4f46e5" : "#64748b"
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {saved && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.9rem" }}>✅ Profile saved!</span>}
          </div>
        </form>
      </div>

      {/* Data Controls */}
      <div className="glass-panel" style={{ borderLeft: "4px solid #f59e0b" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>💾 Data Controls</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          Load sample data for testing, or wipe everything to reset your profile.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => { onLoadMockData(); alert("7-day mock data loaded!"); }}>
            📊 Load Mock Assessment Data
          </button>
          <button
            className="btn"
            style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fecaca" }}
            onClick={() => { if (window.confirm("This will clear all data and restart onboarding. Continue?")) { onClearAllData(); } }}
          >
            🗑️ Reset All Data
          </button>
        </div>
      </div>

    </div>
  );
}
