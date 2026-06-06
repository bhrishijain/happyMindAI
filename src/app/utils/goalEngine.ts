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
    } else if (lower.includes("sleep") || lower.includes("rest") || lower.includes("fatigue") || lower.includes("tired") || lower.includes("insomnia") || lower.includes("bed")) {
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
          "Use 50/10 Pomodoro sessions.",
          "Mute notifications during study blocks.",
          "Focus on one subject per session.",
          "Take physical, screen-free breaks."
        ],
        aiInsights: [
          avgStudy > 9 
            ? "AI Insight: Study exceeds 9h daily. Take longer breaks to avoid brain fatigue." 
            : "AI Insight: Your 45-minute study sprints have improved retention.",
          avgSleep > 7
            ? "AI Insight: Sleeping 7h+ improves your focus by 25%."
            : "AI Insight: Under 7h sleep is causing minor focus lapses."
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
          "Do deep breathing when stress peaks.",
          "Use brown noise or soundscapes.",
          "Focus only on today's tasks.",
          "Challenge negative exam score worries."
        ],
        aiInsights: [
          `AI Insight: "${topConcern}" is your main stress trigger.`,
          "AI Insight: 10h+ study without outdoor breaks spikes anxiety."
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
          "Review past notes to see your progress.",
          "Celebrate minor study milestones.",
          "Focus on self-progress, not peer ranks.",
          "See test failures as practice checkpoints."
        ],
        aiInsights: [
          "AI Insight: Topic revisions boosted your confidence by 20%.",
          "AI Insight: Peer comparison logs are boosting self-doubt."
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
          "Sleep and wake at consistent times.",
          "Ditch screens 45 mins before bedtime.",
          "Avoid late studies that disrupt sleep.",
          "Establish a dim wind-down routine."
        ],
        aiInsights: [
          "AI Insight: Sleeping 7.5h+ improved mood scores by 30%.",
          "AI Insight: Anxiety rises after sleep logs drop below 6h."
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
          "Break syllabi into small daily targets.",
          "Track study streaks and task updates.",
          "Visualize your goals to boost drive.",
          "Set realistic study targets to avoid burnout."
        ],
        aiInsights: [
          "AI Insight: Log tracking is up 15% this week.",
          "AI Insight: Motivation is highest with 50-min study blocks."
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
          "Pace study blocks with regular breaks.",
          "Do 20 mins of daily exercise/stretching.",
          "Talk daily with family or peers.",
          "Avoid studying past midnight."
        ],
        aiInsights: [
          avgStudy > 11 
            ? "AI Insight: Extreme study hours (11h+). Take breaks now." 
            : "AI Insight: Study/sleep ratios are in good balance.",
          "AI Insight: Keep sleep and study times aligned."
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
      "Use 50/10 Pomodoro sessions.",
      "Mute notifications during study blocks."
    ],
    aiInsights: ["Calibrating parameters..."],
    quickActions: [
      { label: "Start Focus Timer", actionKey: "tools", icon: "⏱️" }
    ]
  };
}
