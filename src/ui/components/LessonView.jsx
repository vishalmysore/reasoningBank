/**
 * LessonView.jsx — Display newly extracted memory lesson
 */
import React from 'react';

function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const cls = value >= 0.8 ? 'conf-high' : value >= 0.6 ? 'conf-medium' : 'conf-low';
  return (
    <div className={`conf-ring ${cls}`} title={`Confidence: ${pct}%`}>
      {pct}%
    </div>
  );
}

export default function LessonView({ lesson }) {
  if (!lesson) return null;

  return (
    <div className="glass lesson-panel fade-in" style={{ padding: '20px 22px' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(245,158,11,0.15)', fontSize: 20 }}>✨</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: 2 }}>
            New Insight Learned
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
            {lesson.title}
          </div>
        </div>
        <ConfidenceRing value={lesson.confidence} />
      </div>

      {lesson.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
          {lesson.description}
        </p>
      )}

      {lesson.content?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {lesson.content.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }}>→</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      )}

      {lesson.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {lesson.tags.map((tag, i) => (
            <span key={i} className="tag tag-gold">#{tag}</span>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 14, padding: '8px 12px', borderRadius: 6,
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
        fontSize: 11, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        💾 Stored in ReasoningBank — will improve future plans
      </div>
    </div>
  );
}
