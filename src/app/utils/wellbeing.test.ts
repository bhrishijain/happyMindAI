/* MindTrack Test Suite - Self-Executing Test Runner */

import { 
  calculateWellnessScore, 
  getMockAssessments, 
  getZenBuddyReply,
  getQuoteForExam
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
      name: "calculateWellnessScore - Edge cases (negative / out of bounds bounds)",
      fn: () => {
        const scoreLowBound = calculateWellnessScore("Overwhelmed", -5, -10, -1);
        const scoreHighBound = calculateWellnessScore("Great", 20, 20, 24);
        assert(scoreLowBound === 43, `Expected low boundary sanitize score of 43, got ${scoreLowBound}`);
        assert(scoreHighBound === 63, `Expected high boundary sanitize score of 63, got ${scoreHighBound}`);
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
    },
    {
      name: "getZenBuddyReply - Counselor addresses parent expectations",
      fn: () => {
        const response = getZenBuddyReply("My parents have high expectations.", "UPSC");
        assert(response.includes("expectations") || response.includes("parents"), `Expected reply about parents, got: ${response}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor addresses sleep difficulties",
      fn: () => {
        const response = getZenBuddyReply("I cannot sleep at night due to anxiety.", "CAT");
        assert(response.includes("sleep") || response.includes("bed"), `Expected sleep tips, got: ${response}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor addresses memory issues and blanking out",
      fn: () => {
        const response = getZenBuddyReply("I blank out and forget all the syllabus chapters.", "GATE");
        assert(response.includes("Active Recall") || response.includes("forgotten"), `Expected recall suggestions, got: ${response}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor greets student",
      fn: () => {
        const response = getZenBuddyReply("Hello ZenBuddy!", "CUET");
        assert(response.includes("wellness counseling guide") || response.includes("How are you"), `Expected greeting, got: ${response}`);
      }
    },
    {
      name: "getZenBuddyReply - Counselor fallback response",
      fn: () => {
        const response = getZenBuddyReply("random gibberish question", "JEE");
        assert(response.includes("Academic prep") || response.includes("support"), `Expected generic counseling feedback, got: ${response}`);
      }
    },
    {
      name: "getQuoteForExam - Selects a valid exam-themed quote",
      fn: () => {
        const quoteJee = getQuoteForExam("JEE");
        const quoteNeet = getQuoteForExam("NEET");
        const quoteGeneral = getQuoteForExam("InvalidExamKey");
        assert(quoteJee.length > 5, "Expected valid JEE quote");
        assert(quoteNeet.length > 5, "Expected valid NEET quote");
        assert(quoteGeneral.length > 5, "Expected valid General fallback quote");
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

