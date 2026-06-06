"use client";

import React, { useState } from "react";
import { db, FirebaseAssessmentEntry } from "../utils/firestore";
import { calculateWellnessScore } from "../utils/wellbeing";

interface WellnessAssessmentProps {
  onAssessmentCompleted: () => void;
  latestSnapshot: FirebaseAssessmentEntry | null;
}

const CONCERNS_LIST = [
  "Mock Tests",
  "Low Scores",
  "Exam Pressure",
  "Result Anxiety",
  "Comparison With Others",
  "Lack Of Preparation",
  "Parents Expectations",
  "Future Uncertainty",
  "Time Management",
  "Other"
];

const FOCUS_GOALS = [
  "Better Focus",
  "Reduce Anxiety",
  "Build Confidence",
  "Improve Sleep",
  "Stay Motivated",
  "Maintain Balance"
];

export default function WellnessAssessment({ onAssessmentCompleted, latestSnapshot }: WellnessAssessmentProps) {
  const [step, setStep] = useState(latestSnapshot ? 8 : 1); // Step 8 is Snapshot View if already completed
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [mood, setMood] = useState<"Great" | "Good" | "Okay" | "Stressed" | "Overwhelmed">("Good");
  const [anxiety, setAnxiety] = useState(5);
  const [confidence, setConfidence] = useState(6);
  const [sleep, setSleep] = useState<string>("7");
  const [study, setStudy] = useState<string>("8");
  const [concern, setConcern] = useState("Mock Tests");
  const [focus, setFocus] = useState("Better Focus");

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sleepNum = Number(sleep) || 7;
    const studyNum = Number(study) || 8;
    const score = calculateWellnessScore(mood, anxiety, confidence, sleepNum);

    const entry: Omit<FirebaseAssessmentEntry, "id"> = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      mood,
      anxietyScore: anxiety,
      confidenceScore: confidence,
      sleepHours: sleepNum,
      studyHours: studyNum,
      biggestConcern: concern,
      focusGoal: focus,
      wellnessScore: score
    };

    try {
      // Save in mock Firestore database collection
      await db.collection("wellness_assessments").add(entry);
      setIsSubmitting(false);
      setStep(8); // Go to snapshot view
      onAssessmentCompleted();
    } catch (err) {
      console.error("Firestore write failed", err);
      setIsSubmitting(false);
    }
  };

  // Render score message
  const getScoreMessage = (score: number) => {
    if (score >= 80) return { title: "🌟 Excellent Mindset", desc: "You are pacing yourself beautifully. Keep this balance up, sleep well, and don't push past exhaustion." };
    if (score >= 60) return { title: "🌱 Steady Progress", desc: "You are managing, but watch out for rising anxiety. Incorporate short walking pauses into your study blocks." };
    if (score >= 40) return { title: "⚠️ High Strain", desc: "Your indicators show heavy academic fatigue. Reduce study hours slightly today and target 8 hours of sleep." };
    return { title: "🚨 Burnout Warning", desc: "Your wellness indices are critically low. Please drop the books today, take a rest block, and check in with ZenBuddy counselor." };
  };

  const snapshot = latestSnapshot;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Questionnaire Form Steps */}
      {step <= 7 && (
        <div className="glass-panel" style={{ position: "relative", minHeight: "360px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          
          {/* Header Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Daily Wellness Assessment
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Question {step} of 7
            </span>
          </div>

          {/* Form Content */}
          <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "550px" }} className="fade-in">
              
              {/* Question 1: Mood */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
                    1. How are you feeling today?
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}>
                    {(["Great", "Good", "Okay", "Stressed", "Overwhelmed"] as const).map(option => {
                      const emojis = { Great: "😊", Good: "🙂", Okay: "😐", Stressed: "😰", Overwhelmed: "🔋" };
                      const isSelected = mood === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMood(option)}
                          style={{
                            padding: "0.85rem 1.25rem",
                            border: isSelected ? "2px solid hsl(var(--primary))" : "1px solid var(--border-color)",
                            background: isSelected ? "var(--bg-accent)" : "#ffffff",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.95rem",
                            transition: "all 0.15s ease",
                            transform: isSelected ? "scale(1.02)" : "none"
                          }}
                        >
                          <span>{emojis[option]}</span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 2: Anxiety Slider */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
                    2. Anxiety Level (1-10)
                  </h3>
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    How tense or restless are you feeling regarding examinations?
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <input 
                      aria-label="Anxiety Level Slider"
                      type="range" 
                      min="1" 
                      max="10" 
                      value={anxiety} 
                      onChange={(e) => setAnxiety(Number(e.target.value))}
                      style={{ width: "80%", accentColor: "hsl(var(--primary))", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: anxiety > 7 ? "hsl(var(--danger))" : "hsl(var(--primary))" }}>
                      {anxiety}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {anxiety <= 3 ? "Peaceful & Settled" : anxiety <= 6 ? "Moderate pressure, focused" : "Highly tense, hard to focus"}
                    </span>
                  </div>
                </div>
              )}

              {/* Question 3: Confidence Slider */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
                    3. Confidence Level (1-10)
                  </h3>
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    How optimistic are you feeling about your exam preparations?
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <input 
                      aria-label="Confidence Level Slider"
                      type="range" 
                      min="1" 
                      max="10" 
                      value={confidence} 
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      style={{ width: "80%", accentColor: "hsl(var(--primary))", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: confidence < 4 ? "hsl(var(--warning))" : "hsl(var(--success))" }}>
                      {confidence}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {confidence <= 3 ? "Feeling self-doubt" : confidence <= 6 ? "Gaining consistency" : "Highly optimistic & prepared"}
                    </span>
                  </div>
                </div>
              )}

              {/* Question 4: Sleep Hours */}
              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
                    4. Sleep Hours
                  </h3>
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    How many hours did you sleep last night?
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input 
                      aria-label="Enter sleep hours"
                      type="number" 
                      min="0" 
                      max="24" 
                      step="0.5"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      required
                      style={{ width: "150px", textAlign: "center", fontSize: "1.5rem", fontWeight: 700, padding: "0.75rem" }}
                    />
                  </div>
                  <span style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Targeting 7-8 hours is crucial for cognitive memory consolidation.
                  </span>
                </div>
              )}

              {/* Question 5: Study Hours */}
              {step === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
                    5. Study Hours
                  </h3>
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    How many hours did you study yesterday?
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input 
                      aria-label="Enter study hours"
                      type="number" 
                      min="0" 
                      max="24" 
                      step="0.5"
                      value={study}
                      onChange={(e) => setStudy(e.target.value)}
                      required
                      style={{ width: "150px", textAlign: "center", fontSize: "1.5rem", fontWeight: 700, padding: "0.75rem" }}
                    />
                  </div>
                </div>
              )}

              {/* Question 6: Concern */}
              {step === 6 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
                    6. What is your biggest concern today?
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                    {CONCERNS_LIST.map(option => {
                      const isSelected = concern === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setConcern(option)}
                          style={{
                            padding: "0.5rem 1rem",
                            border: isSelected ? "1px solid hsl(var(--primary))" : "1px solid var(--border-color)",
                            background: isSelected ? "hsl(var(--primary))" : "#ffffff",
                            color: isSelected ? "white" : "var(--text-secondary)",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontSize: "0.85rem",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 7: Focus Goal */}
              {step === 7 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
                    7. What is your primary focus goal today?
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                    {FOCUS_GOALS.map(option => {
                      const isSelected = focus === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFocus(option)}
                          style={{
                            padding: "0.6rem 1.2rem",
                            border: isSelected ? "2px solid hsl(var(--primary))" : "1px solid var(--border-color)",
                            background: isSelected ? "var(--bg-accent)" : "#ffffff",
                            color: isSelected ? "hsl(var(--primary))" : "var(--text-primary)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              style={{ opacity: step === 1 ? 0.3 : 1, cursor: step === 1 ? "not-allowed" : "pointer" }}
            >
              Previous
            </button>

            {/* Stepper Dots indicator */}
            <div className="survey-dots">
              {[1, 2, 3, 4, 5, 6, 7].map(dot => (
                <div key={dot} className={`survey-dot ${step === dot ? "active" : ""}`} />
              ))}
            </div>

            {step < 7 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ background: "hsl(var(--success))" }}
              >
                {isSubmitting ? "Submitting..." : "Generate Snapshot"}
              </button>
            )}
          </div>

        </div>
      )}

      {/* Snapshot Visual Card */}
      {step === 8 && snapshot && (
        <div className="glass-panel fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "hsl(var(--primary))", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Active Session Summary
              </span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.25rem" }}>
                🌿 Today's Wellness Snapshot
              </h2>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              Retake Assessment
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            
            {/* Visual Gauge Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid var(--border-color)", paddingRight: "1.5rem" }}>
              <div style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: `10px solid ${snapshot.wellnessScore >= 80 ? "hsl(var(--success))" : snapshot.wellnessScore >= 55 ? "hsl(var(--warning))" : "hsl(var(--danger))"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                marginBottom: "1rem"
              }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800 }}>{snapshot.wellnessScore}%</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Wellness Score</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: snapshot.wellnessScore >= 80 ? "hsl(var(--success))" : "hsl(var(--warning))" }}>
                {getScoreMessage(snapshot.wellnessScore).title}
              </h3>
            </div>

            {/* Snapshot Index Values */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)" }}>Snapshot Metrics:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Mood</span>
                  <strong style={{ fontSize: "1.1rem" }}>
                    {snapshot.mood === "Great" && "😊 Great"}
                    {snapshot.mood === "Good" && "🙂 Good"}
                    {snapshot.mood === "Okay" && "😐 Okay"}
                    {snapshot.mood === "Stressed" && "😰 Stressed"}
                    {snapshot.mood === "Overwhelmed" && "🔋 Overwhelmed"}
                  </strong>
                </div>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Anxiety Score</span>
                  <strong style={{ fontSize: "1.1rem" }}>{snapshot.anxietyScore} / 10</strong>
                </div>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Confidence Score</span>
                  <strong style={{ fontSize: "1.1rem" }}>{snapshot.confidenceScore} / 10</strong>
                </div>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Sleep Hours</span>
                  <strong style={{ fontSize: "1.1rem" }}>{snapshot.sleepHours} hours</strong>
                </div>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Study Hours</span>
                  <strong style={{ fontSize: "1.1rem" }}>{snapshot.studyHours} hours</strong>
                </div>
                <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Focus Goal</span>
                  <strong style={{ fontSize: "1rem", color: "hsl(var(--primary))" }}>🎯 {snapshot.focusGoal}</strong>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "var(--radius-sm)", gridColumn: "span 2" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Biggest Concern</span>
                <strong style={{ fontSize: "1rem", color: "hsl(var(--warning))" }}>⚠️ {snapshot.biggestConcern}</strong>
              </div>
            </div>

          </div>

          <div style={{ background: "var(--bg-accent)", borderLeft: "4px solid hsl(var(--primary))", padding: "1.25rem", borderRadius: "var(--radius-sm)" }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "hsl(var(--primary))", marginBottom: "0.25rem" }}>
              💡 Counselor Recommendation:
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              {getScoreMessage(snapshot.wellnessScore).desc}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
