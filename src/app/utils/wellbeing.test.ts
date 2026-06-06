/* MindTrack Test Suite - Self-Executing Test Runner */

import { 
  calculateWellnessScore, 
  getMockAssessments, 
  getZenBuddyReply 
} from "./wellbeing";

// Assertion Helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTests() {
  console.log("🚀 Starting MindTrack Daily Wellness Engine Test Suite...");
  let passedCount = 0;
  let failedCount = 0;

  const testCases = [
    {
      name: "calculateWellnessScore - Optimal conditions should return a perfect 100",
      fn: () => {
        const score = calculateWellnessScore("Great", 1, 10, 8);
        assert(score === 100, `Expected 100 for ideal mental parameters, got ${score}`);
      }
    },
    {
      name: "calculateWellnessScore - Low mood, high anxiety, low confidence and sleep should yield a minimum score",
      fn: () => {
        const score = calculateWellnessScore("Overwhelmed", 10, 1, 4);
        assert(score === 20, `Expected 20 for minimal conditions, got ${score}`);
      }
    },
    {
      name: "calculateWellnessScore - Moderate conditions should return a balanced score",
      fn: () => {
        // Mood Okay (60), Anxiety 5 ((11-5)*10 = 60), Confidence 5 (50), Sleep 6 (80). Average = 250 / 4 = 62.5 => 63
        const score = calculateWellnessScore("Okay", 5, 5, 6);
        assert(score === 63, `Expected 63 for moderate levels, got ${score}`);
      }
    },
    {
      name: "getMockAssessments - Generates exactly 7 days of historical logs",
      fn: () => {
        const mockData = getMockAssessments();
        assert(mockData.length === 7, `Expected exactly 7 mock assessments, got ${mockData.length}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor addresses academic mock test failures",
      fn: () => {
        const response = getZenBuddyReply("I got low marks in mock exam today.", "NEET");
        assert(response.includes("diagnostic tool"), `Expected response to address mock diagnostic role, got: ${response}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor addresses burnout",
      fn: () => {
        const response = getZenBuddyReply("I feel so tired and burned out.", "JEE");
        assert(response.includes("recovery"), `Expected response to address active recovery, got: ${response}`);
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

  console.log(`\n📊 Test Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log("🌟 All daily wellness tests passed successfully!");
    process.exit(0);
  }
}

// Execute tests directly if run from CLI
if (require.main === module) {
  runTests();
}
