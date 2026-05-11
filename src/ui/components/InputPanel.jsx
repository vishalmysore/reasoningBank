/**
 * InputPanel.jsx — User request form
 */
import React, { useState } from 'react';

const SAMPLE_REQUESTS = [
  { destination: 'Tokyo, Japan', days: '7', budget: '$2500', preferences: 'culture, food, minimal transit changes' },
  { destination: 'Paris, France', days: '5', budget: '$3000', preferences: 'art, history, fine dining' },
  { destination: 'Bali, Indonesia', days: '10', budget: '$1500', preferences: 'beaches, wellness, local cuisine' },
  { destination: 'New York, USA', days: '4', budget: '$2000', preferences: 'museums, Broadway, food scene' },
];

export default function InputPanel({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    destination: '',
    days: '',
    budget: '',
    preferences: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.destination.trim() || !form.days) return;
    onSubmit(form);
  };

  const loadSample = (sample) => setForm(sample);

  const isValid = form.destination.trim() && form.days;

  return (
    <div className="glass input-panel fade-in">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(96,165,250,0.15)' }}>✈️</div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Plan a Trip</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>
            Agent will retrieve memories &amp; learn from every trip
          </p>
        </div>
      </div>

      <div className="divider" />

      {/* Quick samples */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginBottom: 10 }}>Quick Start</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SAMPLE_REQUESTS.map((s, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => loadSample(s)} type="button">
              {s.destination.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label htmlFor="destination">Destination *</label>
          <input
            id="destination"
            type="text"
            placeholder="e.g. Tokyo, Japan"
            value={form.destination}
            onChange={set('destination')}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label htmlFor="days">Duration (days) *</label>
            <input
              id="days"
              type="number"
              min="1"
              max="90"
              placeholder="7"
              value={form.days}
              onChange={set('days')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="budget">Budget</label>
            <input
              id="budget"
              type="text"
              placeholder="e.g. $2000"
              value={form.budget}
              onChange={set('budget')}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="preferences">Preferences &amp; Notes</label>
          <textarea
            id="preferences"
            rows={3}
            placeholder="e.g. prefer trains, avoid crowds, love street food…"
            value={form.preferences}
            onChange={set('preferences')}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>

        <button
          id="plan-trip-btn"
          className="btn btn-primary"
          type="submit"
          disabled={!isValid || isLoading}
          style={{ marginTop: 4, height: 46 }}
        >
          {isLoading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18 }} />
              Planning…
            </>
          ) : (
            <>🚀 Generate Itinerary</>
          )}
        </button>
      </form>
    </div>
  );
}
