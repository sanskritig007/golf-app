import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Mock data for the assignment scope
  const [scores, setScores] = useState([
    { id: 1, date: '2026-03-10', value: 36 },
    { id: 2, date: '2026-03-12', value: 42 },
    { id: 3, date: '2026-03-15', value: 31 },
  ]);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddScore = (e) => {
    e.preventDefault();
    const scoreVal = parseInt(newScore);
    
    // Validation: 1-45 Stableford
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      alert("Invalid score. Must be between 1 and 45 Stableford points.");
      return;
    }

    const newScoreEntry = {
      id: Date.now(),
      date: newDate,
      value: scoreVal
    };

    // Rolling logic: Keep latest 5, reverse chronological
    const updatedScores = [newScoreEntry, ...scores]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
      
    setScores(updatedScores);
    setNewScore('');
  };

  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div>
          <h2>Welcome Back, <span className="text-primary">{user?.user_metadata?.fullName || 'Golfer'}</span></h2>
          <p className="text-text-muted">Manage your performance and track your charitable impact.</p>
        </div>
        <div className="md:ml-auto glass px-6 py-4 rounded-2xl border-primary/20 flex flex-col items-end">
          <div className="text-sm text-text-muted">Subscription Status</div>
          <div className="text-primary font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Active • Yearly
          </div>
          <div className="text-xs text-text-muted mt-1">Renews 2027-03-20</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Score Entry & History (2 Cols) */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass-card">
            <h3 className="mb-4">Submit a Round</h3>
            <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm text-text-muted mb-1">Date Played</label>
                <input 
                  type="date" 
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm text-text-muted mb-1">Stableford Score (1-45)</label>
                <input 
                  type="number" 
                  min="1"
                  max="45"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="e.g. 36"
                />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto h-[50px]">Submit</button>
            </form>
          </div>

          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="m-0">Your Active Scores</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">LAST 5 ROUNDS</span>
            </div>
            
            {scores.length === 0 ? (
              <div className="text-center py-8 text-text-muted italic bg-black/20 rounded-xl border border-white/5">
                No scores submitted yet. Play a round to enter the next draw!
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((score, idx) => (
                  <div key={score.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-mono font-bold text-white w-8">{score.value}</div>
                      <div className="text-sm text-text-muted">pts</div>
                    </div>
                    <div className="text-sm text-text-muted">{new Date(score.date).toLocaleDateString()}</div>
                    {idx === 0 && <div className="text-xs text-primary font-bold">LATEST</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info (1 Col) */}
        <div className="space-y-8">
          <div className="glass-card flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="mb-2">Your Impact</h3>
            <p className="text-sm mb-4">You are directing <strong className="text-white">10%</strong> of your subscription to the <strong>Global Health Foundation</strong>.</p>
            <button className="text-primary text-sm font-semibold hover:underline">Change Charity</button>
          </div>

          <div className="glass-card">
            <h3 className="mb-4">Participation Summary</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-text-muted">Draws Entered:</span>
                <span className="text-white font-bold">12</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-muted">Total Won:</span>
                <span className="text-primary font-bold">£150.00</span>
              </li>
              <li className="flex justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-text-muted">Next Draw:</span>
                <span className="text-white font-bold">April 1st</span>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;

