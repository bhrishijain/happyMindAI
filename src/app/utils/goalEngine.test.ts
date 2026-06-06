/* MindTrack Goal Recommendation Engine Test Suite - Self-Executing Runner */

import { generateGoalRecommendation, GoalType } from "./goalEngine";
import { FirebaseAssessmentEntry } from "./firestore";
import { StudentProfile } from "../components/Onboarding";

// Assertion Helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runGoalEngineTests() {
  console.log("🚀 Starting MindTrack Goal Recommendation Engine Test Suite...");
  let passedCount = 0;
  let failedCount = 0;

  const mockProfile: StudentProfile = {
    name: "Alex Test",
    examName: "JEE",
    examDate: "2026-12-15",
    studyHourGoal: 8,
    targetScore: "99",
    studyDurationMonths: 6,
    currentPreparationLevel: "Intermediate",
    coachingType: "Self Study",
    mainChallenge: "Exam Pressure",
    preferredStudyTime: "Morning"
  };

  // Mock assessments
  const mockAssessments: FirebaseAssessmentEntry[] = [
    {
      timestamp: new Date().toISOString(),
      date: "2026-06-01",
      mood: "Okay",
      anxietyScore: 6,
      confidenceScore: 5,
      sleepHours: 5.5,
      studyHours: 10,
      biggestConcern: "Mock Tests",
      focusGoal: "Better Focus",
      wellnessScore: 60
    },
    {
      timestamp: new Date().toISOString(),
      date: "2026-06-02",
      mood: "Good",
      anxietyScore: 4,
      confidenceScore: 7,
      sleepHours: 7.5,
      studyHours: 8,
      biggestConcern: "Exam Pressure",
      focusGoal: "Reduce Anxiety",
      wellnessScore: 80
    }
  ];

  const testCases = [
    {
      name: "generateGoalRecommendation - Better Focus yields correct structures and values",
      fn: () => {
        const rec = generateGoalRecommendation("Better Focus", mockAssessments, mockProfile);
        assert(rec.goalName === "Better Focus", `Expected goalName Better Focus, got ${rec.goalName}`);
        assert(rec.scoreLabel === "Focus Score", `Expected Focus Score label, got ${rec.scoreLabel}`);
        assert(rec.scoreValue > 0 && rec.scoreValue <= 100, `Expected scoreValue between 1-100, got ${rec.scoreValue}`);
        assert(rec.suggestions.length > 0, "Expected actionable suggestions list");
        assert(rec.aiInsights.length > 0, "Expected AI Insights list");
        assert(rec.quickActions.length > 0, "Expected quick action triggers");
      }
    },
    {
      name: "generateGoalRecommendation - Reduce Anxiety calculates anxiety-calmness metrics correctly",
      fn: () => {
        const rec = generateGoalRecommendation("Reduce Anxiety", mockAssessments, mockProfile);
        assert(rec.goalName === "Reduce Anxiety", "Expected Reduce Anxiety name");
        assert(rec.scoreLabel === "Calmness Index", "Expected Calmness Index label");
        // Average anxiety is (6+4)/2 = 5. Calmness score is (11-5)*10 = 60
        assert(rec.scoreValue === 60, `Expected Calmness Index 60, got ${rec.scoreValue}`);
      }
    },
    {
      name: "generateGoalRecommendation - Build Confidence maps average confidence score",
      fn: () => {
        const rec = generateGoalRecommendation("Build Confidence", mockAssessments, mockProfile);
        assert(rec.goalName === "Build Confidence", "Expected Build Confidence name");
        // Average confidence is (5+7)/2 = 6. Confidence Score is 6 * 10 = 60
        assert(rec.scoreValue === 60, `Expected Confidence Score 60, got ${rec.scoreValue}`);
      }
    },
    {
      name: "generateGoalRecommendation - Improve Sleep outputs correct sleep recovery quality score",
      fn: () => {
        const rec = generateGoalRecommendation("Improve Sleep", mockAssessments, mockProfile);
        assert(rec.goalName === "Improve Sleep", "Expected Improve Sleep name");
        assert(rec.scoreLabel === "Sleep Quality Score", "Expected Sleep Quality Score label");
        // Average sleep is (5.5+7.5)/2 = 6.5. Sleep ratio is 6.5 / 8 = 0.8125. Score is 81.
        assert(rec.scoreValue === 81, `Expected Sleep Quality Score 81, got ${rec.scoreValue}`);
      }
    },
    {
      name: "generateGoalRecommendation - Stay Motivated outputs motivation metric structures",
      fn: () => {
        const rec = generateGoalRecommendation("Stay Motivated", mockAssessments, mockProfile);
        assert(rec.goalName === "Stay Motivated", "Expected Stay Motivated name");
        assert(rec.scoreLabel === "Drive Index", "Expected Drive Index label");
      }
    },
    {
      name: "generateGoalRecommendation - Maintain Balance computes balanced life metrics",
      fn: () => {
        const rec = generateGoalRecommendation("Maintain Balance", mockAssessments, mockProfile);
        assert(rec.goalName === "Maintain Balance", "Expected Maintain Balance name");
        assert(rec.scoreLabel === "Life Balance Score", "Expected Life Balance Score label");
      }
    },
    {
      name: "GoalEngine Normalization - Maps non-standard 'Exam Pressure' string to Reduce Anxiety",
      fn: () => {
        const rec = generateGoalRecommendation("Exam Pressure" as GoalType, mockAssessments, mockProfile);
        assert(rec.goalName === "Reduce Anxiety", `Expected mapped goalName Reduce Anxiety, got ${rec.goalName}`);
      }
    },
    {
      name: "GoalEngine Normalization - Maps non-standard 'lack of focus' string to Better Focus",
      fn: () => {
        const rec = generateGoalRecommendation("lack of focus" as GoalType, mockAssessments, mockProfile);
        assert(rec.goalName === "Better Focus", `Expected mapped goalName Better Focus, got ${rec.goalName}`);
      }
    },
    {
      name: "GoalEngine Normalization - Maps non-standard 'insomnia' string to Improve Sleep",
      fn: () => {
        const rec = generateGoalRecommendation("insomnia" as GoalType, mockAssessments, mockProfile);
        assert(rec.goalName === "Improve Sleep", `Expected mapped goalName Improve Sleep, got ${rec.goalName}`);
      }
    },
    {
      name: "GoalEngine Normalization - Maps non-standard 'time management' string to Maintain Balance",
      fn: () => {
        const rec = generateGoalRecommendation("time management" as GoalType, mockAssessments, mockProfile);
        assert(rec.goalName === "Maintain Balance", `Expected mapped goalName Maintain Balance, got ${rec.goalName}`);
      }
    },
    {
      name: "GoalEngine Normalization - Falls back to Better Focus for unknown random strings",
      fn: () => {
        const rec = generateGoalRecommendation("UnrelatedGibberishGoal" as GoalType, mockAssessments, mockProfile);
        assert(rec.goalName === "Better Focus", `Expected fallback goalName Better Focus, got ${rec.goalName}`);
      }
    }
  ];

  testCases.forEach(tc => {
    try {
      tc.fn();
      console.log(`✅ PASS: ${tc.name}`);
      passedCount++;
    } catch (e: unknown) {
      const error = e as Error;
      console.error(`❌ FAIL: ${tc.name}`);
      console.error(`   ${error.message}`);
      failedCount++;
    }
  });

  console.log(`\n📊 Goal Engine Test Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log("🌟 All goal engine tests passed successfully!");
    process.exit(0);
  }
}

// Execute tests directly if run from CLI
if (require.main === module) {
  runGoalEngineTests();
}
