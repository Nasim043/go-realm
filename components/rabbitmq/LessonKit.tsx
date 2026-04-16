"use client";

import { useState, type ReactNode } from "react";

type QuizOption = {
  label: string;
  detail: string;
  correct?: boolean;
};

type RevealBlockProps = {
  title: string;
  children: ReactNode;
  tone?: "info" | "warning" | "success";
};

type FlowStep = {
  title: string;
  body: string;
};

type FlowStepsProps = {
  title: string;
  intro?: string;
  steps: FlowStep[];
};

type CheckpointCardProps = {
  title?: string;
  prompt: string;
  points: string[];
};

type ScenarioCardProps = {
  title: string;
  situation: string;
  goal: string;
  considerations?: string[];
  answer?: string;
};

type LessonHeroProps = {
  day: string;
  title: string;
  subtitle: string;
  accent?: string;
};

const palette = {
  ink: "#112031",
  slate: "#274c77",
  blue: "#3a86ff",
  sky: "#d8ecff",
  mint: "#d8f3dc",
  green: "#2a9d8f",
  sand: "#fff4d6",
  gold: "#e9a820",
  rose: "#ffe3e3",
  coral: "#d9485f",
  white: "#ffffff",
  border: "rgba(17, 32, 49, 0.12)",
};

function cardStyle(background: string) {
  return {
    background,
    border: `1px solid ${palette.border}`,
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 18px 40px rgba(17, 32, 49, 0.08)",
    margin: "20px 0",
  } as const;
}

export function LessonHero({
  day,
  title,
  subtitle,
  accent = palette.sky,
}: LessonHeroProps) {
  return (
    <div
      style={{
        ...cardStyle(
          `linear-gradient(135deg, ${accent} 0%, ${palette.white} 65%)`,
        ),
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          insetInlineEnd: -30,
          insetBlockStart: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(58, 134, 255, 0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          insetInlineEnd: 40,
          insetBlockEnd: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(42, 157, 143, 0.10)",
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: palette.slate,
          fontWeight: 700,
        }}
      >
        {day}
      </p>
      <h1 style={{ margin: "8px 0 10px", color: palette.ink }}>{title}</h1>
      <p
        style={{
          margin: 0,
          maxWidth: 760,
          fontSize: 17,
          lineHeight: 1.7,
          color: "rgba(17, 32, 49, 0.86)",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export function RevealBlock({
  title,
  children,
  tone = "info",
}: RevealBlockProps) {
  const [open, setOpen] = useState(false);

  const tones = {
    info: { bg: palette.sky, button: palette.blue },
    warning: { bg: palette.rose, button: palette.coral },
    success: { bg: palette.mint, button: palette.green },
  } as const;

  const current = tones[tone];

  return (
    <div style={cardStyle(current.bg)}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <strong>{title}</strong>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            border: "none",
            borderRadius: 999,
            background: current.button,
            color: palette.white,
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {open ? "লুকান" : "খুলুন"}
        </button>
      </div>
      {open ? (
        <div style={{ marginTop: 14, color: "rgba(17, 32, 49, 0.86)" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function FlowSteps({ title, intro, steps }: FlowStepsProps) {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <div style={cardStyle("linear-gradient(180deg, #f7fbff 0%, #ffffff 100%)")}>
      <strong style={{ display: "block", marginBottom: 6 }}>{title}</strong>
      {intro ? (
        <p style={{ marginTop: 0, color: "rgba(17, 32, 49, 0.78)" }}>{intro}</p>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {steps.map((step, index) => (
          <button
            key={`${step.title}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            style={{
              borderRadius: 16,
              border: `1px solid ${active === index ? palette.blue : palette.border}`,
              background: active === index ? palette.sky : palette.white,
              padding: "12px 10px",
              cursor: "pointer",
              minHeight: 72,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: palette.slate,
                marginBottom: 6,
              }}
            >
              ধাপ {index + 1}
            </span>
            <span style={{ fontWeight: 700, color: palette.ink }}>
              {step.title}
            </span>
          </button>
        ))}
      </div>
      <div
        style={{
          borderRadius: 18,
          padding: 18,
          background: "rgba(58, 134, 255, 0.06)",
          border: `1px solid ${palette.border}`,
        }}
      >
        <strong style={{ display: "block", marginBottom: 8 }}>
          {current.title}
        </strong>
        <p style={{ margin: 0, color: "rgba(17, 32, 49, 0.84)" }}>
          {current.body}
        </p>
      </div>
    </div>
  );
}

export function CheckpointCard({
  title = "Checkpoint",
  prompt,
  points,
}: CheckpointCardProps) {
  return (
    <div style={cardStyle("#f8fafc")}>
      <p
        style={{
          marginTop: 0,
          marginBottom: 8,
          fontWeight: 700,
          color: palette.slate,
        }}
      >
        {title}
      </p>
      <p style={{ marginTop: 0, color: palette.ink }}>{prompt}</p>
      <ul style={{ marginBottom: 0 }}>
        {points.map((point) => (
          <li key={point} style={{ marginBottom: 8 }}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScenarioCard({
  title,
  situation,
  goal,
  considerations = [],
  answer,
}: ScenarioCardProps) {
  return (
    <div style={cardStyle("linear-gradient(180deg, #fff8eb 0%, #ffffff 100%)")}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p>
        <strong>Situation:</strong> {situation}
      </p>
      <p>
        <strong>Goal:</strong> {goal}
      </p>
      {considerations.length > 0 ? (
        <>
          <p style={{ marginBottom: 8 }}>
            <strong>What to think about:</strong>
          </p>
          <ul>
            {considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      {answer ? (
        <details>
          <summary>সম্ভাব্য সমাধান দেখুন</summary>
          <p style={{ marginTop: 12 }}>{answer}</p>
        </details>
      ) : null}
    </div>
  );
}
