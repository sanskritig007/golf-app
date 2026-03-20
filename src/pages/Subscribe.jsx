import React from 'react';

const Subscribe = () => {
  return (
    <div className="container animate-fade-in">
      <h2>Choose Your <span className="text-primary">Impact</span></h2>
      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div className="glass-card flex flex-col items-center">
          <h3 className="mb-2">Monthly</h3>
          <p className="text-2xl font-bold text-white mb-4">£19.99</p>
          <button className="btn-primary mt-auto">Subscribe Monthly</button>
        </div>
        <div className="glass-card flex flex-col items-center border-primary/30">
          <div className="text-xs text-primary font-bold mb-2">SAVE 20%</div>
          <h3 className="mb-2">Yearly</h3>
          <p className="text-2xl font-bold text-white mb-4">£189.99</p>
          <button className="btn-primary mt-auto">Subscribe Yearly</button>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
