import React, { useState } from 'react';
import './styles.css';

type InsightType = 'ownership' | 'decision' | 'followup';

interface InsightData {
  title: string;
  category: string;
  desc: string;
  action: string;
  icon: React.ReactNode;
  actionIcon: React.ReactNode;
}

const dataMap: Record<InsightType, InsightData> = {
  ownership: {
    category: 'Ownership Clarification',
    title: "It's not clear who will take the next step.",
    desc: "Assign an owner to keep this moving.",
    action: "Assign owner",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    actionIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    ),
  },
  decision: {
    category: 'Decision Drift Detection',
    title: "Discussion is active, but no decision detected.",
    desc: "Summarize options or confirm the direction.",
    action: "Summarize",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    category: 'Predictive Follow-up',
    title: "This thread may benefit from a follow-up.",
    desc: "No reply in 2 days. A quick check-in can keep momentum.",
    action: "Draft follow-up",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    ),
    actionIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  }
};

export const InsightCard: React.FC<{ type: InsightType }> = ({ type }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const data = dataMap[type];

  return (
    <div className={`aira-insight-card ${type}`}>
      <div className="insight-card-left">
        <div className="insight-card-icon-container">
          <div className="insight-card-icon">{data.icon}</div>
        </div>
        <div className="insight-card-content">
          <div className="insight-card-header">
            <span className="insight-card-header-brand">AIRA Insight</span>
            <span className="insight-card-header-dot">·</span>
            <span className="insight-card-header-category">{data.category}</span>
          </div>
          <div className="insight-card-text">
            <span className="insight-card-title">{data.title}</span>
            <span className="insight-card-desc">{data.desc}</span>
          </div>
        </div>
      </div>
      
      <div className="insight-card-actions">
        <button className="btn-action">
          <span className="btn-action-icon">{data.actionIcon}</span> {data.action}
        </button>
        <button className="btn-dismiss" onClick={(e) => { e.stopPropagation(); setVisible(false); }}>
          Dismiss
        </button>
      </div>
      
      <button className="btn-close" onClick={(e) => { e.stopPropagation(); setVisible(false); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};
