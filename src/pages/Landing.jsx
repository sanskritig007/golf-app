import React from 'react';

const Landing = () => {
  return (
    <div className="container animate-fade-in">
      <h1 className="mb-6">Change Lives, <span className="text-primary">One Round</span> at a Time.</h1>
      <p className="max-w-2xl mx-auto mb-10 text-xl">The premium platform combining golf performance tracking with meaningful charitable impact. Play your best, win big, and give back.</p>
      <div className="flex gap-4 justify-center">
        <button className="btn-primary">Get Started</button>
        <button className="btn-ghost">Learn More</button>
      </div>
    </div>
  );
};

export default Landing;
