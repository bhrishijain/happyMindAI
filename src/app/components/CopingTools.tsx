"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExamSettings } from "../utils/wellbeing";

interface CopingToolsProps {
  settings: ExamSettings;
}

type AudioType = "none" | "whitenoise" | "brownnoise" | "meditation";

export default function CopingTools({ settings }: CopingToolsProps) {
  // Breathing States
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState<"Inhale" | "Hold (Full)" | "Exhale" | "Hold (Empty)">("Inhale");
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const breatheTimer = useRef<NodeJS.Timeout | null>(null);

  // Focus Timer States
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const focusInterval = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Synth States
  const [activeAudio, setActiveAudio] = useState<AudioType>("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | OscillatorNode[] | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);

  // --- Box Breathing Cycle Engine ---
  useEffect(() => {
    if (isBreathing) {
      setBreatheSeconds(4);
      setBreathePhase("Inhale");

      breatheTimer.current = setInterval(() => {
        setBreatheSeconds((prevSec) => {
          if (prevSec <= 1) {
            setBreathePhase((prevPhase) => {
              switch (prevPhase) {
                case "Inhale": return "Hold (Full)";
                case "Hold (Full)": return "Exhale";
                case "Exhale": return "Hold (Empty)";
                case "Hold (Empty)": return "Inhale";
                default: return "Inhale";
              }
            });
            return 4; // Reset phase clock
          }
          return prevSec - 1;
        });
      }, 1000);
    } else {
      if (breatheTimer.current) clearInterval(breatheTimer.current);
      setBreatheSeconds(4);
      setBreathePhase("Inhale");
    }

    return () => {
      if (breatheTimer.current) clearInterval(breatheTimer.current);
    };
  }, [isBreathing]);

  // --- Focus Timer Engine ---
  useEffect(() => {
    if (isTimerRunning) {
      focusInterval.current = setInterval(() => {
        setFocusTime((prevTime) => {
          if (prevTime <= 1) {
            // Timer finished! Play local audio chime
            playChimeSound();
            setIsTimerRunning(false);
            if (focusInterval.current) clearInterval(focusInterval.current);
            return 25 * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (focusInterval.current) clearInterval(focusInterval.current);
    }

    return () => {
      if (focusInterval.current) clearInterval(focusInterval.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- HTML5 Web Audio API Synthesizer ---
  const startAudioSynth = (type: AudioType) => {
    // Stop any existing sound
    stopAudioSynth();

    if (type === "none") return;

    try {
      // Lazy init AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.connect(ctx.destination);
      audioGainRef.current = gainNode;

      if (type === "whitenoise" || type === "brownnoise") {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === "brownnoise") {
            // Apply lowpass filter to make it brown (1/f^2)
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Compensate volume drop
          } else {
            output[i] = white * 0.35;
          }
        }

        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = noiseBuffer;
        bufferSource.loop = true;
        bufferSource.connect(gainNode);
        bufferSource.start(0);
        audioSourceRef.current = bufferSource;
        
        // Fade in
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
      } 
      else if (type === "meditation") {
        // Synthesize a soothing minor/major ambient chord using multiple sine/triangle oscillators
        const freqs = [196.00, 261.63, 329.63, 392.00, 523.25]; // G3, C4, E4, G4, C5 (C Major 9 chord feel)
        const oscillators: OscillatorNode[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Detune slightly for lush chorus effect
          osc.detune.setValueAtTime(Math.sin(idx) * 6, ctx.currentTime);
          
          osc.connect(gainNode);
          osc.start(0);
          oscillators.push(osc);
        });

        audioSourceRef.current = oscillators;
        // Fade in
        gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.0);
      }

      setActiveAudio(type);
    } catch (err) {
      console.error("Web Audio failed to start:", err);
    }
  };

  const stopAudioSynth = () => {
    if (audioGainRef.current && audioCtxRef.current) {
      const gain = audioGainRef.current;
      const ctx = audioCtxRef.current;
      
      // Fade out to avoid audio click/pop
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        setTimeout(() => {
          if (audioSourceRef.current) {
            if (Array.isArray(audioSourceRef.current)) {
              audioSourceRef.current.forEach(osc => {
                try { osc.stop(); } catch {}
              });
            } else {
              try { audioSourceRef.current.stop(); } catch {}
            }
            audioSourceRef.current = null;
          }
          setActiveAudio("none");
        }, 450);
      } catch (e) {
        // Fallback
        setActiveAudio("none");
      }
    } else {
      setActiveAudio("none");
    }
  };

  // Play a soft notification chime
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // slide down to A4
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Chime failed", e);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up synth when navigating away
      if (audioSourceRef.current) {
        if (Array.isArray(audioSourceRef.current)) {
          audioSourceRef.current.forEach(o => { try { o.stop(); } catch {} });
        } else {
          try { audioSourceRef.current.stop(); } catch {}
        }
      }
    };
  }, []);

  // Get animated breathing description
  const getBreathingActionDescription = (phase: string) => {
    switch (phase) {
      case "Inhale": return "Inhale deeply. Feel your chest expand.";
      case "Hold (Full)": return "Hold your breath. Remain calm.";
      case "Exhale": return "Slowly exhale. Release all tension.";
      case "Hold (Empty)": return "Hold. Wait for the next breath.";
      default: return "";
    }
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        
        {/* Breathing Guide Panel */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", minHeight: "450px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
              🧘 Animated Box Breathing
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", marginBottom: "1.5rem" }}>
              Follow the expanding circle. This triggers your parasympathetic system to reduce panic.
            </p>
          </div>

          {/* Animated Circle Container */}
          <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className={`breathing-ring-outer`}>
              <div 
                className={`breathing-ring-inner ${isBreathing ? "breathing-ring-active" : ""}`}
                style={{
                  transition: isBreathing ? "none" : "transform 0.5s ease",
                  transform: !isBreathing ? "scale(1)" : undefined
                }}
              >
                {isBreathing ? (
                  <>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>{breathePhase}</span>
                    <span style={{ fontSize: "2rem", fontWeight: 800 }}>{breatheSeconds}s</span>
                  </>
                ) : (
                  <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Ready</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", textAlign: "center", marginTop: "1rem" }}>
            {isBreathing && (
              <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "hsl(var(--primary))", minHeight: "24px", marginBottom: "1rem" }}>
                {getBreathingActionDescription(breathePhase)}
              </p>
            )}
            <button 
              className={`btn ${isBreathing ? "btn-secondary" : "btn-primary"}`}
              onClick={() => setIsBreathing(!isBreathing)}
              style={{ width: "80%" }}
            >
              {isBreathing ? "Stop Breathing Exercise" : "Start Box Breathing"}
            </button>
          </div>
        </div>

        {/* Pomodoro Focus & Sounds Panel */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "450px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              ⏱️ Study Focus Timer
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Pacing study sessions avoids cognitive overload. Set a target and study in blocks.
            </p>

            {/* Timer Counter */}
            <div style={{ textAlign: "center", margin: "2rem 0" }}>
              <span style={{ fontSize: "4.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-2px", color: "hsl(var(--primary))" }}>
                {formatTime(focusTime)}
              </span>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  {isTimerRunning ? "Pause" : "Start"}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsTimerRunning(false);
                    setFocusTime(25 * 60);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  Reset
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsTimerRunning(false);
                    setFocusTime(50 * 60);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  50 Min
                </button>
              </div>
            </div>
          </div>

          {/* Sound Synthesizer Controls */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              🔊 Local Focus Sound Synthesizer
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Generates non-looping continuous audio frequencies in your browser for deep isolation.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button 
                className={`btn ${activeAudio === "whitenoise" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => activeAudio === "whitenoise" ? stopAudioSynth() : startAudioSynth("whitenoise")}
                style={{ fontSize: "0.8rem", padding: "0.5rem" }}
              >
                {activeAudio === "whitenoise" ? "🔊 Stop White Noise" : "🔇 White Noise"}
              </button>
              <button 
                className={`btn ${activeAudio === "brownnoise" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => activeAudio === "brownnoise" ? stopAudioSynth() : startAudioSynth("brownnoise")}
                style={{ fontSize: "0.8rem", padding: "0.5rem" }}
              >
                {activeAudio === "brownnoise" ? "🔊 Stop Brown Noise" : "🔇 Brown Noise"}
              </button>
              <button 
                className={`btn ${activeAudio === "meditation" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => activeAudio === "meditation" ? stopAudioSynth() : startAudioSynth("meditation")}
                style={{ fontSize: "0.8rem", padding: "0.5rem", gridColumn: "span 2" }}
              >
                {activeAudio === "meditation" ? "🔊 Stop Comfort Hum" : "🧘 Meditative Soundscape Chord"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Coping Sheets */}
      <div className="glass-panel">
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
          🎓 Coping Strategies for {settings.examName} Candidate
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          
          <div style={{ border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "hsl(var(--primary))", marginBottom: "0.5rem" }}>
              ⚡ Defusing MCQ Exam Panic
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              If you encounter a series of highly difficult questions in JEE/NEET/GATE, immediately drop your pen, close your eyes, and perform one breathing cycle. It takes 12 seconds but prevents cortisol from blocking your logic nodes.
            </p>
          </div>

          <div style={{ border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "hsl(var(--primary))", marginBottom: "0.5rem" }}>
              ⏳ UPSC Essay & Writing Pacing
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              For long-form exams, mental exhaustion peaks at the 2-hour mark. Prevent brain-lock by stretching your neck, rotating your wrists, and drinking two sips of water after every essay block. Do not write continuously without muscle relief.
            </p>
          </div>

          <div style={{ border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "hsl(var(--primary))", marginBottom: "0.5rem" }}>
              📈 Result Day Shielding
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Cutoffs fluctuate based on math variables out of your hands. Commit to not visiting student chat forums or comparison boards for the first 12 hours after results release. Protect your peace first.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
