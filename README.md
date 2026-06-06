# MindTrack - Student Exam Well-being Companion

MindTrack is a secure, privacy-first, fully client-side mental well-being dashboard designed for students preparing for high-pressure competitive exams (like JEE, NEET, UPSC, CAT, GATE, CUET) and board exams. It helps students track their daily emotional state, identify recurring stress triggers, participate in breathing exercises, run focused study timers with synthesized audio blockout, access dynamic wellness goal recommendations, and receive virtual coaching support.

---

## 🎯 Chosen Vertical & Purpose

High-stakes exams expose students to intense burnout, family expectations, peer comparisons, and sleep deprivation. MindTrack addresses this vertical by providing a calm, private sanctuary on their devices.
1. **Self-Monitoring:** Tracks mood fluctuations and assigns a "Wellness Score" showing mental fatigue levels.
2. **Stress Diagnosis:** Cross-references logs to isolate exactly what (e.g., mock tests, study goals, lack of sleep) drives their anxiety.
3. **Active Intervention:** Offers animated box breathing to calm panic, a Pomodoro study focus clock, and interactive wind-down checklists.
4. **Dynamic Goal Tracking**: Allows selecting a primary daily focus (Better Focus, Reduce Anxiety, Build Confidence, Improve Sleep, Stay Motivated, Maintain Balance) and adapts the user experience accordingly.
5. **Empathetic Counseling:** A local virtual counselor ("ZenBuddy") trained to answer typical exam worries with structural, reassuring advice.

---

## 🧠 Approach and Logic

### 1. Goal Recommendation Engine (`goalEngine.ts`)
Instead of simply saving a selected goal, MindTrack uses a custom **Recommendation Engine** that dynamically personalizes the dashboard and recommendations based on the active goal:
- **Calibrated Scores**: Calculates specific scores based on historical assessments (e.g., *Focus Score*, *Calmness Index*, *Confidence Level*, *Sleep Quality*, *Drive Index*, *Life Balance Score*).
- **Contextual AI Insights**: Uses study ratios, sleep averages, and top anxiety concerns to yield tailormade diagnostic comments.
- **Robust Normalization**: To prevent crashes from legacy database records or mismatching strings (e.g., onboarding challenges like "Exam Pressure"), the engine implements a string distance parser to map inputs dynamically to one of the six core goals:
  - *Anxiety / Stress / Pressure / Worry / Fear* $\rightarrow$ **Reduce Anxiety**
  - *Focus / Study / Attention* $\rightarrow$ **Better Focus**
  - *Confidence / Doubt / Comparison / Parent* $\rightarrow$ **Build Confidence**
  - *Sleep / Rest / Fatigue / Tired* $\rightarrow$ **Improve Sleep**
  - *Motivate / Drive / Streak / Lack* $\rightarrow$ **Stay Motivated**
  - *Balance / Time / Schedule / Manage* $\rightarrow$ **Maintain Balance**

### 2. Instant Relief Coaching Center (`InstantRelief.tsx`)
A dedicated dashboard workspace offering targeted, interactive relief exercises:
- **Interactive Breathing Ring**: Animated pulsing visualizers supporting Box Breathing (4-4-4-4), 4-7-8 Relax, Equal Breathing (4-4), and Deep Calm (5-2-5).
- **Affirmation Shufflers & Motivation Boosters**: Draws context-targeted cognitive exercises to build confidence and defeat self-doubt.
- **Self-Care & Sleep Checklists**: Interactive stateful checklists helping students build bedtime boundaries or study pacing limits.

---

## 🛠️ How the Solution Works

MindTrack operates as a Single Page Application (SPA) dashboard inside Next.js (App Router) + React:
- **Zero Hydration Mismatches:** Next.js client-side components query `localStorage` only *after* mounting (`useEffect` hydration gate), ensuring zero SSR/CSR HTML mismatches.
- **State Flow:** The central state container `src/app/page.tsx` syncs a list of `LogEntry` records, `StudentProfile`, and `Theme` selections to `localStorage`.
- **Tabbed Sub-systems:**
  - **Zen Center (Dashboard):** Computes countdown offsets to the student's exam date, tracks goals, and displays the dynamic Recommendation Engine panel.
  - **Mood Log (Tracker):** Captures current mood, stress levels (1-10 slider), study/sleep hours, multi-select triggers, today's focus, and text journals.
  - **Insights (Analytics):** Renders custom bar-charts detailing stress trends and trigger contributions.
  - **Coping Toolbox:** Focus clock synced to a local HTML5 Web Audio API synthesizer. It builds continuous White Noise, Brown Noise, and Meditative chords in real-time.
  - **Counselor Chat (ZenBuddy):** Uses a local regex-based NLP parser in `src/app/utils/wellbeing.ts` that matches student concerns and provides deep counseling replies.
  - **Instant Relief**: Interactive coach dashboard with interactive micro-sessions.
  - **Settings:** Allows profile changes, custom countdown updates, mock database population (for instant evaluation), and system resets.

---

## 💡 Evaluation Focus Areas

### 1. Code Quality & Maintainability
- Written in TypeScript with strict typing interfaces.
- Business calculations are decoupled into pure functions inside `src/app/utils/wellbeing.ts` and `src/app/utils/goalEngine.ts` for clean testability.

### 2. Security & Data Privacy
- **100% Offline & Private:** Academic anxiety data is highly sensitive. No databases, external servers, tracking scripts, or analytics APIs are used. Everything is contained within the user's browser `localStorage`.
- **Sanitized States:** Inputs are trimmed, sanitized, and keyboard inputs on target dates are controlled to block invalid entry.

### 3. Resource Efficiency & Styling
- **No Heavy Libraries:** Visual dashboards are constructed using pure HTML and Vanilla CSS grids/bars rather than heavy charting bundles.
- **Audio Synthesis:** Meditative audio is generated dynamically via code using the browser's native `AudioContext` nodes.
- **Full Dark Mode**: Handled client-side using a `.dark` style class, supporting persistent states and dark fallback overrides.

---

## 🚀 Running the Project

### 1. Run Dev Server
Launch the local Next.js dev server:
```bash
npm run dev
```

### 2. Run Automated Tests
Execute the self-running unit tests:
```bash
npx tsx src/app/utils/wellbeing.test.ts
```

### 3. Production Build
Verify code compilation and bundling:
```bash
npm run build
```

---

## 🔮 Core Assumptions Made
1. **Private Device Sandbox:** We assume the student uses a personal browser workspace where local storage persists and is not auto-cleared daily.
2. **Web Audio Support:** We assume standard modern browser support (Chrome, Safari, Firefox, Edge) for the HTML5 Web Audio API to play real-time soundscapes.
3. **Legacy Data Migration:** The recommendation engine assumes that previous data entries that contain non-conforming challenge/goal strings should be mapped gracefully to the closest matching category using keyword searches, defaulting to "Better Focus" in case of no match.
