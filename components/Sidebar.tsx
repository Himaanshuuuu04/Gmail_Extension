import React, { useState } from 'react';
import './styles.css';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`aira-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="aira-sidebar-toggle" 
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand AIRA Insights" : "Collapse AIRA Insights"}
      >
        {collapsed ? '◀' : '▶'}
      </button>
      
      <div className="aira-sidebar-content">
        <div className="sidebar-header-card">
          <div className="aira-sidebar-title">AIRA insights</div>
          <div className="aira-sidebar-subtitle">Three types. Each with a unique cue.</div>
        </div>

        <div className="sidebar-card ownership">
          <div className="sidebar-card-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="sidebar-card-body">
            <div className="sidebar-card-title">Ownership Clarification</div>
            <div className="sidebar-card-desc">No clear owner for the next step.</div>
            <div className="sidebar-card-cues">
              <span><strong>Where:</strong> Near latest message</span>
              <span><strong>Why:</strong> Action needs ownership</span>
            </div>
          </div>
        </div>

        <div className="sidebar-card decision">
          <div className="sidebar-card-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
          </div>
          <div className="sidebar-card-body">
            <div className="sidebar-card-title">Decision Drift Detection</div>
            <div className="sidebar-card-desc">Discussion active, but no decision detected.</div>
            <div className="sidebar-card-cues">
              <span><strong>Where:</strong> Between messages</span>
              <span><strong>Why:</strong> Clarity needed</span>
            </div>
          </div>
        </div>

        <div className="sidebar-card followup">
          <div className="sidebar-card-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <div className="sidebar-card-body">
            <div className="sidebar-card-title">Predictive Follow-up</div>
            <div className="sidebar-card-desc">Good time to follow up to maintain momentum.</div>
            <div className="sidebar-card-cues">
              <span><strong>Where:</strong> Near reply box</span>
              <span><strong>Why:</strong> Timely follow-up helps</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 7 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5z" />
              <line x1="9" y1="18" x2="15" y2="18" />
              <line x1="10" y1="22" x2="14" y2="22" />
            </svg>
          </div>
          <div className="sidebar-footer-content">
            <div className="sidebar-footer-title">Why subtle?</div>
            <div className="sidebar-footer-desc">Subtle colors reduce alert fatigue and build long-term trust.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

