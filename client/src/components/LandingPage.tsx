import React from 'react';

interface LandingPageProps {
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo }) => {
  return (
    <div className="landing-root" id="landing-root">
      {/* Background Image Layer (Part 11) */}
      <div className="hero-background" aria-hidden="true">
        <img
          src="/healthagram-hero.webp"
          alt=""
          className="hero-background-image"
        />
        <div className="hero-gradient" />
      </div>

      {/* Clean JSX Structure (Part 8) */}
      <div className="landing-container">
        <header className="landing-header">
          <h2 className="landing-brand-title">Healthagram</h2>

          <button
            id="btn-open-demo"
            className="landing-btn-glass"
            onClick={onEnterDemo}
            aria-label="Open Demo"
          >
            Open Demo →
          </button>
        </header>

        <section className="landing-hero-section">
          <div className="hero-content">
            <h1 className="landing-hero-h1">
              One patient.
              <br />
              One connected clinical record.
            </h1>

            <p className="landing-hero-p">
              Connect patient history, clinical decisions, and care teams in one shared record.
            </p>

            <button
              id="btn-enter-demo"
              className="landing-btn-primary"
              onClick={onEnterDemo}
              aria-label="Enter Demo"
            >
              Enter Demo →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
