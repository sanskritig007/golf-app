import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />
      
      <div className="container text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next Draw: April 1st • £25,000 Jackpot
        </div>
        
        <h1 className="max-w-4xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Change Lives With <span className="text-primary italic">Every Round</span> You Play.
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-text-muted mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Join the premium golf community where performance tracking meets purpose. Your subscription powers life-changing charities while you compete for monthly prize draws.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/subscribe" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">
            Get Started Now
          </Link>
          <Link to="/draws" className="btn-ghost text-lg px-10 py-4 w-full sm:w-auto">
            View Past Winners
          </Link>
        </div>
        
        {/* Social Proof / Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card p-6">
            <div className="text-3xl font-bold text-white mb-1">£1.2M+</div>
            <div className="text-sm text-text-muted uppercase tracking-wider">Donated</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-3xl font-bold text-white mb-1">15k+</div>
            <div className="text-sm text-text-muted uppercase tracking-wider">Members</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-3xl font-bold text-white mb-1">450+</div>
            <div className="text-sm text-text-muted uppercase tracking-wider">Charities</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-3xl font-bold text-white mb-1">£500k</div>
            <div className="text-sm text-text-muted uppercase tracking-wider">Monthly Pool</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
