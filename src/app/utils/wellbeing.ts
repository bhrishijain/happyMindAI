/* MindTrack Student Mental Well-being Utility Engine */

import { FirebaseAssessmentEntry } from "./firestore";

export interface ExamSettings {
  studentName: string;
  examName: string;
  examDate: string; // YYYY-MM-DD
  studyHourGoal: number;
}

/**
 * Calculates a Wellness Score (0-100) based on mood, anxiety, confidence, and sleep.
 */
export function calculateWellnessScore(
  mood: "Great" | "Good" | "Okay" | "Stressed" | "Overwhelmed",
  anxiety: number, // 1-10
  confidence: number, // 1-10
  sleep: number
): number {
  const moodScores = { Great: 100, Good: 80, Okay: 60, Stressed: 40, Overwhelmed: 20 };
  const moodScore = moodScores[mood] || 60;

  // Anxiety: 1 is low (best), 10 is high (worst). So score is (11 - anxiety) * 10
  const anxietyScore = (11 - Math.max(1, Math.min(10, anxiety))) * 10;

  // Confidence: 10 is high (best), 1 is low (worst). So score is confidence * 10
  const confidenceScore = Math.max(1, Math.min(10, confidence)) * 10;

  // Sleep: 7-9 hours is ideal (100). Mild sleep issues (80). Heavy issues (60/40).
  let sleepScore = 40;
  if (sleep >= 7 && sleep <= 9) {
    sleepScore = 100;
  } else if (sleep === 6 || sleep === 10) {
    sleepScore = 80;
  } else if (sleep === 5 || sleep === 11) {
    sleepScore = 60;
  }

  const average = (moodScore + anxietyScore + confidenceScore + sleepScore) / 4;
  return Math.round(average);
}

/**
 * Generates mock wellness assessment logs for the last 7 days.
 */
export function getMockAssessments(): FirebaseAssessmentEntry[] {
  const today = new Date();
  const mockEntries: FirebaseAssessmentEntry[] = [];
  
  const moods: Array<"Great" | "Good" | "Okay" | "Stressed" | "Overwhelmed"> = [
    "Stressed", "Okay", "Good", "Overwhelmed", "Okay", "Good", "Great"
  ];
  const anxieties = [8, 7, 4, 9, 5, 3, 2];
  const confidences = [4, 5, 7, 2, 6, 8, 9];
  const sleepHoursList = [5, 6, 8, 4.5, 7, 8, 8.5];
  const studyHoursList = [11, 10, 8, 12, 6, 7.5, 7];
  
  const concerns = [
    "Syllabus Load", "Lack of Preparation", "Mock Tests", 
    "Exam Pressure", "Future Uncertainty", "Parents Expectations", 
    "Time Management"
  ];
  const focusGoals = [
    "Reduce Anxiety", "Better Focus", "Build Confidence", 
    "Improve Sleep", "Stay Motivated", "Maintain Balance", "Maintain Balance"
  ];

  for (let i = 0; i < 7; i++) {
    const logDate = new Date();
    logDate.setDate(today.getDate() - (6 - i));
    const dateString = logDate.toISOString().split("T")[0];
    
    const mood = moods[i];
    const anxiety = anxieties[i];
    const confidence = confidences[i];
    const sleep = sleepHoursList[i];
    
    mockEntries.push({
      timestamp: logDate.toISOString(),
      date: dateString,
      mood,
      anxietyScore: anxiety,
      confidenceScore: confidence,
      sleepHours: sleep,
      studyHours: studyHoursList[i],
      biggestConcern: concerns[i],
      focusGoal: focusGoals[i],
      wellnessScore: calculateWellnessScore(mood, anxiety, confidence, sleep)
    });
  }

  return mockEntries;
}

/**
 * Renders counseling replies.
 */
export function getZenBuddyReply(message: string, examName: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("fail") || msg.includes("mock") || msg.includes("score") || msg.includes("marks")) {
    return `I hear how disappointing that score is. Preparing for ${examName} is a massive task. A single mock test score is a learning diagnostic tool, not a final verdict. 

Look at what you missed. Did you run out of time, or was it a conceptual error? Pick just one topic to improve tomorrow. You have time to adjust, and this doesn't define your intelligence.`;
  }

  if (msg.includes("parent") || msg.includes("expect") || msg.includes("family") || msg.includes("pressure")) {
    return `Managing parental expectations can feel heavier than the syllabus. Often, their concern is driven by wanting you to be secure, but it can turn into intense pressure.

Try to say: *"I am doing my best. When I feel constant pressure, it increases my anxiety and makes it harder to focus. I need some calm time."* 
Your value as their child exists completely outside of rank lists. Focus on your effort today.`;
  }

  if (msg.includes("tired") || msg.includes("burnout") || msg.includes("give up") || msg.includes("stop")) {
    return `Burnout means your mind and body are exhausted. ${examName} is a marathon, not a sprint. If you sprint every single day, you will run out of energy.

Please take the rest of today off. Sleep early, drink some water, and take a brief walk outside. Rest is not wasted time; it is active recovery. Your brain needs rest to absorb information.`;
  }

  if (msg.includes("sleep") || msg.includes("night") || msg.includes("insomnia")) {
    return `Anxiety keeps your nervous system in high-alert mode, making it hard to fall asleep. 

Try this:
1. **Brain Dump:** Write down all your worries on paper before bed to clear your mind.
2. **Curfew:** Stop looking at questions or forums 1.5 hours before sleeping.
3. **Breathing:** Try the box breathing guide. It lowers cortisol and signals your body that it is safe to sleep.`;
  }

  if (msg.includes("forget") || msg.includes("blank") || msg.includes("remember") || msg.includes("syllabus")) {
    return `Feeling like you've forgotten everything is incredibly common when studying large syllabi. This is usually cognitive overload, not actual memory loss.

Use **Active Recall** (write down what you remember on a blank page) rather than just re-reading. When you feel a blank during a mock test, pause, take 3 deep breaths, and let your heart rate settle. The memory will return.`;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `Hello! I'm ZenBuddy, your wellness counseling guide. I know preparing for ${examName} is a challenging journey.

How are you feeling today? Tell me about your studies, stress, sleep, or expectations. I'm here to listen.`;
  }

  return `Thank you for sharing that. Academic prep for ${examName} carries a lot of emotional weight. It is valid to feel stressed or overwhelmed.

Take it one day, one page, one breath at a time. What is one small thing you can do right now to support yourself? A glass of water, a quick stretch, or 5 minutes of breathing? I'm here to support you.`;
}

export const EXAM_QUOTES: Record<string, string[]> = {
  JEE: [
    "Your worth is not determined by a percentile ranking. Focus on learning, not just solving.",
    "Errors in mock tests are your friends today so they won't be your enemies on the JEE exam day."
  ],
  NEET: [
    "To heal others, you must first take care of your own heart and mind. Rest is active preparation.",
    "Remember why you started this journey: to bring health and care to the world. Start with yourself."
  ],
  UPSC: [
    "UPSC is a test of endurance and character, not just memory. Pace yourself for the marathon.",
    "In the grand scheme of your life, you are far larger than any civil services merit list."
  ],
  "Board Exams": [
    "Boards are a checkpoint, not a destination. They will soon be a minor dot in your rearview mirror.",
    "Your grade sheet is a measure of a specific test performance, not your intelligence or potential."
  ],
  General: [
    "Exams are tests of what you can reproduce on paper, not of your value as a human being.",
    "Take a deep breath. You have survived all of your hardest days so far."
  ]
};

export function getQuoteForExam(examName: string): string {
  const quotes = EXAM_QUOTES[examName] || EXAM_QUOTES.General;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
