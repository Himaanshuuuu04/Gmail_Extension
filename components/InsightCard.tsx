import React, { useState } from "react";
import "./styles.css";

export type InsightType = "ownership" | "decision" | "followup";
export type CardVariant = "full" | "compact";
type Surface = "gmail" | "chat";

interface InsightData {
  title: string;
  category: string;
  desc: string;
  action: string;
  timeTag?: string;
  icon: React.ReactNode;
  actionIcon: React.ReactNode;
}

const dataMap: Record<InsightType, InsightData> = {
  ownership: {
    category: "Ownership Clarification",
    title: "It's not clear who will take the next step.",
    desc: "Assign an owner to keep this moving.",
    action: "Assign owner",
    timeTag: "1d",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    actionIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    ),
  },
  decision: {
    category: "Decision Drift Detection",
    title: "Discussion is active, but no decision detected.",
    desc: "Summarize options or confirm the direction.",
    action: "Summarize",
    timeTag: "3h",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 22 12 12 22 2 12 12 2"></polygon>
      </svg>
    ),
    actionIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2Q12 12 22 12Q12 12 12 22Q12 12 2 12Q12 12 12 2Z"></path>
      </svg>
    ),
  },
  followup: {
    category: "Predictive Follow-up",
    title: "This thread may benefit from a follow-up.",
    desc: "No reply in 2 days. A quick check-in can keep momentum.",
    action: "Send follow-up",
    timeTag: "2d",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    ),
    actionIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  },
};

export const InsightCard: React.FC<{
  type: InsightType;
  variant?: CardVariant;
  surface?: Surface;
}> = ({ type, variant = "full", surface = "gmail" }) => {
  const [dismissed, setDismissed] = useState(false);
  const data = dataMap[type];

  if (dismissed) return null;

  if (variant === "compact") {
    return (
      <div className={`aira-compact-card ${type} ${surface}`}>
        <div className="compact-sparkle-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f95738">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
        <div className="compact-icon-item">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a73e8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="compact-time-item">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5f6368"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{data.timeTag || "2d"}</span>
        </div>
        <button className="compact-action-btn">{data.action}</button>
        <button
          className="compact-dismiss-btn"
          onClick={() => setDismissed(true)}
          title="Dismiss"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`aira-insight-card ${type} ${surface}`}>
      <div className="insight-card-left">
        <div className="insight-card-icon-container">
          <div className="insight-card-icon">{data.icon}</div>
        </div>
        <div className="insight-card-content">
          <div className="insight-card-header">
            <span className="insight-card-header-brand">AIRA Insight</span>
            <span className="insight-card-header-dot">·</span>
            <span className="insight-card-header-category">
              {data.category}
            </span>
          </div>
          <div className="insight-card-text">
            <span className="insight-card-title">{data.title}</span>
            <span className="insight-card-desc">{data.desc}</span>
          </div>
        </div>
      </div>

      <div className="insight-card-actions">
        <button className="btn-action">
          <span className="btn-action-icon">{data.actionIcon}</span>{" "}
          {data.action}
        </button>
        <button className="btn-dismiss" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    </div>
  );
};
