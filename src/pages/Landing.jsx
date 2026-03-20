import React from 'react';
import Hero from '../components/Hero';

const Landing = () => {
  return (
    <div className="animate-fade-in">
      <Hero />
      
      {/* Featured Charities Preview */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="mb-4">Supported <span className="text-primary">Charities</span></h2>
              <p>We've partnered with world-class organizations making a real impact on the ground. You choose where 10% of your subscription goes.</p>
            </div>
            <button className="btn-ghost px-8">View All Partners</button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card text-left aspect-video flex flex-col justify-end group">
                <div className="w-12 h-12 rounded-lg bg-primary/20 mb-4 group-hover:bg-primary/40 transition-colors" />
                <h4 className="text-xl mb-1">Charity Partner {i}</h4>
                <p className="text-sm">Supporting children's health and education globally through local initiatives.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
