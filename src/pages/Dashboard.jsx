import React from 'react';

const Dashboard = () => {
  return (
    <div className="container animate-fade-in">
      <h2>Welcome Back, <span className="text-primary">Golfer</span></h2>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="glass-card">
          <h3>Your Status</h3>
          <p className="mt-2">Active Subscriber</p>
        </div>
        <div className="glass-card">
          <h3>Last 5 Scores</h3>
          <p className="mt-2 italic">Connect your profile to track scores...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
