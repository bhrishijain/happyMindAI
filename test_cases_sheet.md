# MindTrack - Automated Test Cases Sheet

This document registers the comprehensive test coverage sheet for the **MindTrack Wellness Platform**, detailing inputs, expected assertions, and output validation rules.

---

## 🚀 Running the Test Suite

Run the automated test runner locally using npm:
```bash
npm test
```
This executes the self-contained typescript runners:
1. `src/app/utils/wellbeing.test.ts` (Wellness scoring, mock logs, counselor responses)
2. `src/app/utils/goalEngine.test.ts` (Goal recommendations, mapping calculations, parameter normalizations)

---

## 📊 Summary of Test Cases (24 Assertions)

### 1. Wellness Calculation Test Cases (`wellbeing.test.ts`)

| ID | Test Case Name | Input Arguments | Expected Result | Status |
|---|---|---|---|---|
| TC-01 | Optimal Condition Score | `mood: "Great"`, `anxiety: 1`, `confidence: 10`, `sleep: 8` | Wellness Score = `100` | ✅ PASS |
| TC-02 | Low Condition Score | `mood: "Overwhelmed"`, `anxiety: 10`, `confidence: 1`, `sleep: 4` | Wellness Score = `20` | ✅ PASS |
| TC-03 | Edge Cases (Low bounds) | `mood: "Overwhelmed"`, `anxiety: -5`, `confidence: -10`, `sleep: -1` | Sanitized Wellness Score = `43` | ✅ PASS |
| TC-04 | Edge Cases (High bounds) | `mood: "Great"`, `anxiety: 20`, `confidence: 20`, `sleep: 24` | Sanitized Wellness Score = `63` | ✅ PASS |
| TC-05 | Moderate Condition Score | `mood: "Okay"`, `anxiety: 5`, `confidence: 5`, `sleep: 6` | Wellness Score = `63` | ✅ PASS |
| TC-06 | Mock Data Generator count | N/A | Returns exactly 7 days of logs | ✅ PASS |

### 2. ZenBuddy Counselor NLP Parser Test Cases (`wellbeing.test.ts`)

| ID | Test Case Name | Message Input | Expected Response Keywords | Status |
|---|---|---|---|---|
| TC-07 | Mock Exam / Low Marks | `"I got low marks in mock exam today."` | Contains `"diagnostic tool"` | ✅ PASS |
| TC-08 | Burnout / Exhaustion | `"I feel so tired and burned out."` | Contains `"recovery"` | ✅ PASS |
| TC-09 | Parent / Family Expectations | `"My parents have high expectations."` | Contains `"expectations"` or `"parents"` | ✅ PASS |
| TC-10 | Night Sleep Issues | `"I cannot sleep at night due to anxiety."` | Contains `"sleep"` or `"bed"` | ✅ PASS |
| TC-11 | Memory / Syllabus blanking | `"I blank out and forget all chapters."` | Contains `"Active Recall"` or `"forgotten"` | ✅ PASS |
| TC-12 | Greeting replies | `"Hello ZenBuddy!"` | Contains `"wellness counseling guide"` or `"How are you"` | ✅ PASS |
| TC-13 | Fallback / General questions | `"random gibberish question"` | Contains `"Academic prep"` or `"support"` | ✅ PASS |
| TC-14 | Exam Quote selector tests | `"JEE"`, `"NEET"`, `"InvalidExamKey"` | Returns non-empty string quotes | ✅ PASS |

### 3. Goal Recommendation Engine Test Cases (`goalEngine.test.ts`)

| ID | Test Case Name | Focus Goal Input | Expected Engine personalizations | Status |
|---|---|---|---|---|
| TC-15 | Better Focus Personalization | `"Better Focus"` | Renders Focus Score, focus suggestions, timer actions | ✅ PASS |
| TC-16 | Reduce Anxiety Personalization | `"Reduce Anxiety"` | Calmness Index (average), anxiety suggestion points | ✅ PASS |
| TC-17 | Build Confidence Personalization| `"Build Confidence"` | Renders Confidence Level (average), affirmations actions | ✅ PASS |
| TC-18 | Improve Sleep Personalization | `"Improve Sleep"` | Sleep Quality Score (average vs 8hr target), routines | ✅ PASS |
| TC-19 | Stay Motivated Personalization | `"Stay Motivated"` | Drive Index (study average and log streak), motivators | ✅ PASS |
| TC-20 | Maintain Balance Personalization | `"Maintain Balance"` | Renders Life Balance Score, balanced schedule lists | ✅ PASS |

### 4. Input Goal Normalization & Crash Checks (`goalEngine.test.ts`)

| ID | Test Case Name | Input Goal (Non-conforming) | Mapped Destination Goal | Status |
|---|---|---|---|---|
| TC-21 | Normalization: Exam Pressure | `"Exam Pressure"` | `"Reduce Anxiety"` (Calmness Index dashboard) | ✅ PASS |
| TC-22 | Normalization: Focus issues | `"lack of focus"` | `"Better Focus"` (Focus Score dashboard) | ✅ PASS |
| TC-23 | Normalization: Insomnia / fatigue | `"insomnia"` | `"Improve Sleep"` (Sleep Quality dashboard) | ✅ PASS |
| TC-24 | Normalization: Time management | `"time management"` | `"Maintain Balance"` (Life Balance dashboard) | ✅ PASS |
| TC-25 | Normalization: Fallback check | `"random unmapped string"` | `"Better Focus"` (Exhaustive safety fallback) | ✅ PASS |
