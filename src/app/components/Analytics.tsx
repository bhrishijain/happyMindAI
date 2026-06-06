"use client";

import React from "react";
import { FirebaseAssessmentEntry } from "../utils/firestore";

interface AnalyticsProps {
  assessments: FirebaseAssessmentEntry[];
  onLoadMockData: () => void;
}

export default function Analytics({ assessments, onLoadMockData }: AnalyticsProps) {
  // Last 7 assessments sorted chronologically
  const sortedAssessments = [...assessments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Averages
  const avgSleep = assessments.length > 0
    ? (assessments.reduce((acc, a) => acc + a.sleepHours, 0) / assessments.length).toFixed(1)
    : "0";

  const avgStudy = assessments.length > 0
    ? (assessments.reduce((acc, a) => acc + a.studyHours, 0) / assessments.length).toFixed(1)
    : "0";

  const avgAnxiety = assessments.length > 0
    ? (assessments.reduce((acc, a) => acc + a.anxietyScore, 0) / assessments.length).toFixed(1)
    : "0";

  const avgConfidence = assessments.length > 0
    ? (assessments.reduce((acc, a) => acc + a.confidenceScore, 0) / assessments.length).toFixed(1)
    : "0";

  // Concerns frequency mapping
  const getConcernStats = () => {
    if (assessments.length === 0) return [];
    const counts: Record<string, number> = {};
    assessments.forEach(a => {
      if (a.biggestConcern) {
        counts[a.biggestConcern] = (counts[a.biggestConcern] || 0) + 1;
      }
    });
    
    return Object.keys(counts)
      .map(key => ({
        concern: key,
        count: counts[key],
        percentage: Math.round((counts[key] / assessments.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  };

  const concernStats = getConcernStats();

  if (assessments.length === 0) {
    return (
      <div className="fade-in glass-panel" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📊 Insights Center</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
          We need assessment histories to compile your wellness trends. Take today's assessment, or click below to populate the local database with 7 days of mock test prep logs.
        </p>
        <button className="btn btn-primary" onClick={onLoadMockData}>
          Load Sample Database Logs
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Avg Sleep Duration</span>
          <strong style={{ fontSize: "1.75rem", color: "hsl(var(--success))" }}>{avgSleep}h / night</strong>
        </div>
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Avg Study Hours</span>
          <strong style={{ fontSize: "1.75rem", color: "hsl(var(--primary))" }}>{avgStudy}h / day</strong>
        </div>
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Avg Anxiety Level</span>
          <strong style={{ fontSize: "1.75rem", color: Number(avgAnxiety) > 6 ? "hsl(var(--danger))" : "var(--text-primary)" }}>{avgAnxiety} / 10</strong>
        </div>
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Avg Confidence Index</span>
          <strong style={{ fontSize: "1.75rem", color: Number(avgConfidence) >= 6 ? "hsl(var(--success))" : "var(--text-primary)" }}>{avgConfidence} / 10</strong>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        
        {/* Chart 1: Sleep vs Study */}
        <div className="glass-panel">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>🛌 Sleep vs. Study Hours</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Presents study pacing relative to sleep recovery.
          </p>

          <div className="bar-chart-container" style={{ height: "220px" }}>
            {sortedAssessments.map((a, idx) => {
              const studyPct = `${Math.min(100, (a.studyHours / 16) * 100)}%`;
              const sleepPct = `${Math.min(100, (a.sleepHours / 12) * 100)}%`;
              const dateObj = new Date(a.date);
              const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

              return (
                <div key={a.id || idx} className="bar-wrapper" style={{ justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "100%", width: "100%", justifyContent: "center" }}>
                    
                    {/* Study Hours bar (Indigo) */}
                    <div 
                      className="bar-column" 
                      style={{ 
                        height: studyPct, 
                        background: "hsl(var(--primary))", 
                        width: "12px", 
                        borderRadius: "2px" 
                      }}
                    >
                      <div className="bar-tooltip">Study: {a.studyHours}h</div>
                    </div>

                    {/* Sleep Hours bar (Mint/Green) */}
                    <div 
                      className="bar-column" 
                      style={{ 
                        height: sleepPct, 
                        background: "hsl(var(--success))", 
                        width: "12px", 
                        borderRadius: "2px" 
                      }}
                    >
                      <div className="bar-tooltip">Sleep: {a.sleepHours}h</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legends */}
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", background: "hsl(var(--primary))", borderRadius: "2px" }} />
              <span>Study Hours</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", background: "hsl(var(--success))", borderRadius: "2px" }} />
              <span>Sleep Hours</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Anxiety vs Confidence */}
        <div className="glass-panel">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>⚡ Anxiety vs. Confidence Trends</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Anxiety indices (Rose) compared with mental optimism (Emerald).
          </p>

          <div className="bar-chart-container" style={{ height: "220px" }}>
            {sortedAssessments.map((a, idx) => {
              const anxietyPct = `${a.anxietyScore * 10}%`;
              const confidencePct = `${a.confidenceScore * 10}%`;
              const dateObj = new Date(a.date);
              const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

              return (
                <div key={a.id || idx} className="bar-wrapper" style={{ justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "100%", width: "100%", justifyContent: "center" }}>
                    
                    {/* Anxiety bar (Rose/Red) */}
                    <div 
                      className="bar-column" 
                      style={{ 
                        height: anxietyPct, 
                        background: "hsl(var(--danger))", 
                        width: "12px", 
                        borderRadius: "2px" 
                      }}
                    >
                      <div className="bar-tooltip">Anxiety: {a.anxietyScore}/10</div>
                    </div>

                    {/* Confidence bar (Emerald/Green) */}
                    <div 
                      className="bar-column" 
                      style={{ 
                        height: confidencePct, 
                        background: "hsl(var(--success))", 
                        width: "12px", 
                        borderRadius: "2px" 
                      }}
                    >
                      <div className="bar-tooltip">Confidence: {a.confidenceScore}/10</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legends */}
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", background: "hsl(var(--danger))", borderRadius: "2px" }} />
              <span>Anxiety Index</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", background: "hsl(var(--success))", borderRadius: "2px" }} />
              <span>Confidence Index</span>
            </div>
          </div>
        </div>

      </div>

      {/* Concerns breakdown */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>⚠️ Primary Stress Drivers Analysis</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {concernStats.map(stat => (
            <div key={stat.concern} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, width: "180px" }}>{stat.concern}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexGrow: 1, margin: "0 1.5rem" }}>
                <div style={{ flexGrow: 1, height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${stat.percentage}%`, 
                      background: "hsl(var(--primary))",
                      borderRadius: "4px"
                    }} 
                  />
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, width: "80px", textAlign: "right" }}>
                {stat.count} entries ({stat.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
