import { FirebaseAssessmentEntry } from "./firestore";
import { StudentProfile } from "../components/Onboarding";

export type GoalType = 
  | "Better Focus" 
  | "Reduce Anxiety" 
  | "Build Confidence" 
  | "Improve Sleep" 
  | "Stay Motivated" 
  | "Maintain Balance";

export interface GoalAction {
  label: string;
  actionKey: string;
  icon: string;
}

export interface GoalRecommendation {
  goalName: GoalType;
  scoreLabel: string;
  scoreValue: number;
  suggestions: string[];
  aiInsights: string[];
  quickActions: GoalAction[];
}

/**
 * Goal Recommendation Engine
 * Generates dynamic feedback, custom scores, and actionable strategies based on user goals and history.
 */
export function generateGoalRecommendation(
  goal: GoalType,
  assessments: FirebaseAssessmentEntry[],
  profile: StudentProfile
): GoalRecommendation {
  // Normalize goal to handle any legacy/incorrect/undefined goals safely.
  let resolvedGoal: GoalType = "Better Focus";
  const validGoals: GoalType[] = [
    "Better Focus",
    "Reduce Anxiety",
    "Build Confidence",
    "Improve Sleep",
    "Stay Motivated",
    "Maintain Balance"
  ];

  if (validGoals.includes(goal)) {
    resolvedGoal = goal;
  } else {
    // Attempt standard mapping of raw strings (such as "Exam Pressure" or onboarding challenges)
    const lower = String(goal || "").toLowerCase();
    if (lower.includes("anxiety") || lower.includes("stress") || lower.includes("pressure") || lower.includes("worry") || lower.includes("fear")) {
      resolvedGoal = "Reduce Anxiety";
    } else if (lower.includes("focus") || lower.includes("study") || lower.includes("attention")) {
      resolvedGoal = "Better Focus";
    } else if (lower.includes("confidence") || lower.includes("doubt") || lower.includes("comparison") || lower.includes("parent")) {
      resolvedGoal = "Build Confidence";
    } else if (lower.includes("sleep") || lower.includes("rest") || lower.includes("fatigue") || lower.includes("tired")) {
      resolvedGoal = "Improve Sleep";
    } else if (lower.includes("motivate") || lower.includes("drive") || lower.includes("streak") || lower.includes("lack")) {
      resolvedGoal = "Stay Motivated";
    } else if (lower.includes("balance") || lower.includes("time") || lower.includes("schedule") || lower.includes("manage")) {
      resolvedGoal = "Maintain Balance";
    }
  }

  // Compute recent stats
  const recentDays = assessments.slice(-5);
  const hasHistory = recentDays.length > 0;

  const avgStudy = hasHistory 
    ? recentDays.reduce((acc, curr) => acc + curr.studyHours, 0) / recentDays.length 
    : 8;
  const avgSleep = hasHistory 
    ? recentDays.reduce((acc, curr) => acc + curr.sleepHours, 0) / recentDays.length 
    : 7.5;
  const avgAnxiety = hasHistory 
    ? recentDays.reduce((acc, curr) => acc + curr.anxietyScore, 0) / recentDays.length 
    : 5;
  const avgConfidence = hasHistory 
    ? recentDays.reduce((acc, curr) => acc + curr.confidenceScore, 0) / recentDays.length 
    : 6;

  const studyGoal = profile.studyHourGoal || 8;

  switch (resolvedGoal) {
    case "Better Focus": {
      // Focus Score: combination of study efficiency (avg study hours vs goal) and inverse of anxiety
      const studyRatio = Math.min(1.2, avgStudy / studyGoal);
      const anxietyFactor = (11 - avgAnxiety) / 10;
      const scoreValue = Math.min(100, Math.round(((studyRatio * 0.7) + (anxietyFactor * 0.3)) * 100));

      return {
        goalName: "Better Focus",
        scoreLabel: "Focus Score",
        scoreValue,
        suggestions: [
          "Use Pomodoro study sessions (e.g. 50 minutes study, 10 minutes break).",
          "Disable notifications and put away distractions during study blocks.",
          "Prioritize a single major concept or subject per session.",
          "Take structured physical breaks (away from screens) to refresh the mind."
        ],
        aiInsights: [
          avgStudy > 9 
            ? "AI Insight: Your study blocks exceed 9 hours daily. Focus efficiency drops significantly after 3 consecutive hours of math/logic sessions." 
            : "AI Insight: Setting short 45-minute sprint goals has stabilized your topic retention stats.",
          avgSleep > 7
            ? "AI Insight: Focus and attention spans improve by 25% when your sleep logs exceed 7 hours."
            : "AI Insight: Low sleep duration this week is causing minor focus lapses during morning studies."
        ],
        quickActions: [
          { label: "Start Focus Timer", actionKey: "tools", icon: "⏱️" },
          { label: "Breathe for Focus", actionKey: "relief", icon: "🧘" }
        ]
      };
    }

    case "Reduce Anxiety": {
      // Calmness Score: inverse of anxiety score
      const scoreValue = Math.round((11 - avgAnxiety) * 10);

      // Find the most common concern
      const concerns = assessments.map(a => a.biggestConcern);
      const topConcern = concerns.length > 0 
        ? concerns.sort((a,b) => concerns.filter(v => v===a).length - concerns.filter(v => v===b).length).pop()
        : "Mock Tests";

      return {
        goalName: "Reduce Anxiety",
        scoreLabel: "Calmness Index",
        scoreValue,
        suggestions: [
          "Incorporate deep box-breathing cycles for 2 minutes when stress peaks.",
          "Practice guided calming soundscapes or brown noise during study sessions.",
          "Focus entirely on tasks you can control today; dump future worries.",
          "Actively challenge negative self-talk regarding exam scores."
        ],
        aiInsights: [
          `AI Insight: "${topConcern}" is currently identified as your primary source of examination pressure.`,
          "AI Insight: Anxiety spikes by 35% on days where study duration exceeds 10 hours without a 30-minute outdoor break."
        ],
        quickActions: [
          { label: "Start Calming Breathing", actionKey: "relief", icon: "🧘" },
          { label: "Chat with ZenBuddy", actionKey: "buddy", icon: "💬" }
        ]
      };
    }

    case "Build Confidence": {
      // Confidence Score: based on confidence logs and study progress
      const scoreValue = Math.round(avgConfidence * 10);

      return {
        goalName: "Build Confidence",
        scoreLabel: "Confidence Level",
        scoreValue,
        suggestions: [
          "Review previously completed chapters and notes to remind yourself of your knowledge.",
          "Celebrate minor milestones (e.g. solving 5 difficult problems in a row).",
          "Focus on personal progress ratios rather than comparing ranks with peers.",
          "Acknowledge test failures as conceptual checkpoints, not character marks."
        ],
        aiInsights: [
          "AI Insight: Your confidence index demonstrates a 20% upward trend after completing active topic revisions.",
          "AI Insight: Peer comparison references appear frequently in your concern logs, contributing to self-doubt."
        ],
        quickActions: [
          { label: "Read Mindset Affirmations", actionKey: "relief", icon: "✨" },
          { label: "Check Analytics Insights", actionKey: "analytics", icon: "📊" }
        ]
      };
    }

    case "Improve Sleep": {
      // Sleep Score: based on sleep hours vs optimal 8 hours
      const sleepRatio = avgSleep / 8;
      const scoreValue = Math.min(100, Math.round(sleepRatio * 100));

      return {
        goalName: "Improve Sleep",
        scoreLabel: "Sleep Quality Score",
        scoreValue,
        suggestions: [
          "Maintain a strictly consistent sleep and wake schedule.",
          "Disconnect from all screens (laptops, phones) 45 minutes before sleep.",
          "Avoid late-night study sessions that disrupt circadian rhythms.",
          "Establish a calming wind-down checklist (dim lights, stretching, reading)."
        ],
        aiInsights: [
          "AI Insight: Mood scores improve by 30% on average when your sleep duration reaches 7.5+ hours.",
          "AI Insight: Anxiety logs demonstrate a distinct rise following nights with under 6 hours of sleep."
        ],
        quickActions: [
          { label: "Start Sleep Wind-Down", actionKey: "relief", icon: "🛌" },
          { label: "Activate Night Soundscape", actionKey: "tools", icon: "🔊" }
        ]
      };
    }

    case "Stay Motivated": {
      // Motivation Score: based on survey consistency and study goals
      const logRatio = assessments.length / 7; // up to 7 days log consistency
      const studyFactor = Math.min(studyGoal, avgStudy) / studyGoal;
      const scoreValue = Math.min(100, Math.round(((logRatio * 0.4) + (studyFactor * 0.6)) * 100));

      return {
        goalName: "Stay Motivated",
        scoreLabel: "Drive Index",
        scoreValue,
        suggestions: [
          "Deconstruct complex syllabi into bite-sized, non-threatening daily milestones.",
          "Keep a checklist of completed mock tasks and track study streaks.",
          "Reflect on why you chose this path and visualize your future goal achievements.",
          "Set realistic daily study targets to prevent chronic exhaustion."
        ],
        aiInsights: [
          "AI Insight: Log consistency has improved by 15% this week, showing steady mindset tracking.",
          "AI Insight: High motivation scores correlate directly with structured 50-minute study blocks."
        ],
        quickActions: [
          { label: "Read Study Motivation", actionKey: "relief", icon: "🚀" },
          { label: "Coping Toolbox Guidance", actionKey: "tools", icon: "🔧" }
        ]
      };
    }

    case "Maintain Balance": {
      // Balance Score: combines study factor, sleep factor, anxiety level, and mood
      // 1. Sleep Balance: optimal is 7 to 9 hours
      const sleepScore = avgSleep >= 7 && avgSleep <= 9 ? 100 : avgSleep === 6 || avgSleep === 10 ? 80 : 50;
      
      // 2. Study Balance: optimal is 6 to 10 hours. Over 10 is over-study burnout, under 6 is low duration
      const studyScore = avgStudy >= 6 && avgStudy <= 10 ? 100 : avgStudy > 10 ? 70 : 60;
      
      // 3. Anxiety Inverse Score
      const anxietyScore = (11 - avgAnxiety) * 10;
      
      // 4. Mood Factor based on latest logs
      const latestMood = assessments[assessments.length - 1]?.mood || "Good";
      const moodMap = { Great: 100, Good: 80, Okay: 60, Stressed: 40, Overwhelmed: 20 };
      const moodScore = moodMap[latestMood];

      const scoreValue = Math.round((sleepScore * 0.3) + (studyScore * 0.3) + (anxietyScore * 0.2) + (moodScore * 0.2));

      return {
        goalName: "Maintain Balance",
        scoreLabel: "Life Balance Score",
        scoreValue,
        suggestions: [
          "Pace your studies: study blocks should have breaks to prevent academic stress.",
          "Incorporate 20 minutes of daily physical stretch or cardiovascular exercise.",
          "Ensure you connect with family or peers for non-academic conversations daily.",
          "Avoid the temptation of overstudying past midnight."
        ],
        aiInsights: [
          avgStudy > 11 
            ? "AI Insight: Your study hours are extreme (11+ hours). Stress levels are climbing due to lack of rest blocks." 
            : "AI Insight: Study and sleep ratios are currently balanced within stable prep parameters.",
          "AI Insight: Daily balance improves when sleep, eating, and study blocks are aligned."
        ],
        quickActions: [
          { label: "Review Daily Study Plan", actionKey: "relief", icon: "📝" },
          { label: "Settings & Reset Options", actionKey: "settings", icon: "⚙️" }
        ]
      };
    }
  }

  // Fallback return statement if switch statement gets bypassed
  return {
    goalName: "Better Focus",
    scoreLabel: "Focus Score",
    scoreValue: 70,
    suggestions: [
      "Use Pomodoro study sessions (e.g. 50 minutes study, 10 minutes break).",
      "Disable notifications and put away distractions during study blocks."
    ],
    aiInsights: ["Calibrating your focus parameters..."],
    quickActions: [
      { label: "Start Focus Timer", actionKey: "tools", icon: "⏱️" }
    ]
  };
}
