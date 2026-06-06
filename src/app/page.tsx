"use client";

import React, { useState, useEffect } from "react";
import { db, FirebaseAssessmentEntry } from "./utils/firestore";
import { ExamSettings, getMockAssessments } from "./utils/wellbeing";
import Onboarding, { StudentProfile } from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import WellnessAssessment from "./components/WellnessAssessment";
import InstantRelief from "./components/InstantRelief";
import Analytics from "./components/Analytics";
import CopingTools from "./components/CopingTools";
import ZenBuddy from "./components/ZenBuddy";
import Settings from "./components/Settings";
import { GoalType } from "./utils/goalEngine";

type TabType = "dashboard" | "tracker" | "relief" | "analytics" | "tools" | "buddy" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [assessments, setAssessments] = useState<FirebaseAssessmentEntry[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load profile, assessments, and theme on client mount
  useEffect(() => {
    const init = async () => {
      // Theme setting loading
      try {
        const storedTheme = localStorage.getItem("mindtrack_theme") as "light" | "dark";
        if (storedTheme) {
          setTheme(storedTheme);
          if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } catch (e) {
        console.warn("Theme load failed", e);
      }

      try {
        const storedProfile = localStorage.getItem("mindtrack_profile");
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.warn("Profile load failed", e);
      }

      try {
        const snapshot = await db.collection("wellness_assessments").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseAssessmentEntry[];
        setAssessments(data);
      } catch (e) {
        console.warn("Firestore load failed", e);
      }

      setIsHydrated(true);
    };
    init();
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("mindtrack_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem("mindtrack_profile", JSON.stringify(newProfile));
  };

  const handleAssessmentCompleted = async () => {
    const snapshot = await db.collection("wellness_assessments").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseAssessmentEntry[];
    setAssessments(data);
  };

  const handleLoadMockData = async () => {
    const mock = getMockAssessments();
    db.collection("wellness_assessments").seed(mock);
    const snapshot = await db.collection("wellness_assessments").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseAssessmentEntry[];
    setAssessments(data);
  };

  const handleClearAllData = () => {
    db.collection("wellness_assessments").seed([]);
    localStorage.removeItem("mindtrack_profile");
    setAssessments([]);
    setProfile(null);
    setActiveTab("dashboard");
  };

  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    localStorage.setItem("mindtrack_profile", JSON.stringify(updated));
  };

  // Convert profile → ExamSettings shape for components that need it
  const examSettings: ExamSettings = profile
    ? { studentName: profile.name, examName: profile.examName, examDate: profile.examDate, studyHourGoal: profile.studyHourGoal }
    : { studentName: "", examName: "JEE", examDate: "", studyHourGoal: 8 };

  // Loading spinner
  if (!isHydrated) {
    return (
      <div className="fade-in" style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "typing 1s infinite linear" }} />
          <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>Loading MindTrack...</span>
        </div>
      </div>
    );
  }

  // ── Show Onboarding if no profile ──
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ── Main App ──
  const getPageTitle = () => {
    const map: Record<TabType, string> = {
      dashboard: "Zen Center",
      tracker: "Daily Wellness Survey",
      relief: "Instant Relief",
      analytics: "Insights",
      tools: "Coping Toolbox",
      buddy: "ZenBuddy Counselor",
      settings: "Settings",
    };
    return map[activeTab];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard profile={profile} assessments={assessments} onNavigate={(t) => setActiveTab(t as TabType)} />;
      case "tracker":
        return (
          <WellnessAssessment
            onAssessmentCompleted={handleAssessmentCompleted}
            latestSnapshot={assessments.length > 0
              ? [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
              : null}
          />
        );
      case "relief":
        return (
          <InstantRelief
            profile={profile}
            assessments={assessments}
            onNavigate={(t) => setActiveTab(t as TabType)}
            onUpdateGoal={(g) => handleUpdateProfile({ ...profile, mainChallenge: g })}
          />
        );
      case "analytics":
        return <Analytics assessments={assessments} onLoadMockData={handleLoadMockData} />;
      case "tools":
        return <CopingTools settings={examSettings} />;
      case "buddy":
        return <ZenBuddy settings={examSettings} />;
      case "settings":
        return (
          <Settings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onLoadMockData={handleLoadMockData}
            onClearAllData={handleClearAllData}
          />
        );
      default:
        return <Dashboard profile={profile} assessments={assessments} onNavigate={(t) => setActiveTab(t as TabType)} />;
    }
  };

  const NAV_ITEMS: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    {
      tab: "dashboard", label: "Zen Center",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    },
    {
      tab: "tracker", label: "Daily Survey",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
    },
    {
      tab: "relief", label: "Instant Relief",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    },
    {
      tab: "analytics", label: "Insights",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    },
    {
      tab: "tools", label: "Coping Toolbox",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
    },
    {
      tab: "buddy", label: "Counselor Chat",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    },
    {
      tab: "settings", label: "Settings",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    },
  ];

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "1.75rem" }}>🍃</span>
            <div>
              <span style={{ fontWeight: 800, fontSize: "1.15rem", display: "block", color: "#0f172a" }}>MindTrack</span>
              <span style={{ fontSize: "0.65rem", color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {profile.examName.split(" ")[0]} Prep
              </span>
            </div>
          </div>

          {/* Student chip */}
          <div style={{
            margin: "1rem 0",
            padding: "0.75rem",
            background: "linear-gradient(135deg, #f0f4ff, #f5f0ff)",
            borderRadius: "10px",
            border: "1px solid #e0e7ff"
          }}>
            <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.2rem" }}>
              Signed in as
            </p>
            <p style={{ fontWeight: 800, color: "#4f46e5", fontSize: "1rem" }}>{profile.name}</p>
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{profile.currentPreparationLevel} · {profile.coachingType}</p>
          </div>

          <nav className="nav-links" aria-label="Main navigation">
            {NAV_ITEMS.map(({ tab, label, icon }) => (
              <button
                key={tab}
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {icon}
                {label}
                {tab === "tracker" && !assessments.some(a => a.date === new Date().toISOString().split("T")[0]) && (
                  <span style={{
                    marginLeft: "auto",
                    width: "8px", height: "8px",
                    background: "#f59e0b",
                    borderRadius: "50%",
                    flexShrink: 0
                  }} />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <button
            onClick={handleToggleTheme}
            className="btn btn-secondary"
            style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>© MindTrack 2026 · Private local data</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "1rem",
          marginBottom: "1.75rem"
        }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", display: "block" }}>
              MindTrack · Wellness Platform
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{getPageTitle()}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Theme Toggle for Mobile/Header */}
            <button
              onClick={handleToggleTheme}
              className="btn btn-secondary"
              style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Toggle dark mode theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            {assessments.length > 0 && (
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }} className="desktop-only">
                {assessments.length} log{assessments.length !== 1 ? "s" : ""} saved
              </span>
            )}
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: "1rem"
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {renderTabContent()}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ tab, label, icon }) => (
          <button
            key={tab}
            className={`bottom-nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            style={{ position: "relative" }}
          >
            {icon}
            <span style={{ fontSize: "0.58rem", marginTop: "0.2rem" }}>{label.split(" ")[0]}</span>
            {tab === "tracker" && !assessments.some(a => a.date === new Date().toISOString().split("T")[0]) && (
              <span style={{
                position: "absolute",
                top: "4px",
                right: "32%",
                width: "6px",
                height: "6px",
                background: "#f59e0b",
                borderRadius: "50%"
              }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
