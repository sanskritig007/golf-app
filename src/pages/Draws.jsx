import React from 'react';
import { useAuth } from '../context/AuthContext';

const Draws = () => {
  const { user } = useAuth();

  // Mock data for assignment phase
  const upcomingDraw = {
    date: '2026-04-01',
    estJackpot: 25000,
    entrants: 15420
  };

  const pastDraws = [
    { id: 1, date: '2026-03-01', numbers: [12, 18, 24, 31, 42], userMatched: 2, won: 0 },
    { id: 2, date: '2026-02-01', numbers: [5, 11, 22, 36, 40], userMatched: 3, won: 50.00 },
  ];

  return (
    <div className="container py-12 animate-fade-in">
      <div className="mb-12">
        <h2>The <span className="text-primary">Monthly Draw</span></h2>
        <p className="text-text-muted">Every time you play, you fund charity and enter to win.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Upcoming Draw Card */}
        <div className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Next Draw</span>
              <h3 className="mt-4 text-3xl">{new Date(upcomingDraw.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric'})}</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted uppercase tracking-wider">Est. Jackpot</div>
              <div className="text-3xl font-heading font-extrabold text-white">£{upcomingDraw.estJackpot.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div>
              <div className="text-sm text-text-muted mb-1">Current Entrants</div>
              <div className="text-xl font-mono">{upcomingDraw.entrants.toLocaleString()}</div>
            </div>
            <button className="btn-primary hover:bg-white hover:text-black">Boost Chances</button>
          </div>
        </div>

        {/* How It Works Card */}
        <div className="glass-card flex flex-col justify-center">
          <h3 className="mb-4">How It Works</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</div>
              <p>Submit up to 5 Stableford scores over the month.</p>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</div>
              <p>Match your scores with the 5 randomly drawn numbers.</p>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</div>
              <p>Match 3, 4, or 5 numbers to win a share of the prize pool!</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Past Results */}
      <div>
        <h3 className="mb-6">Past Results</h3>
        <div className="glass overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-sm uppercase tracking-wider text-text-muted">
                <th className="font-medium p-4">Draw Date</th>
                <th className="font-medium p-4">Winning Numbers</th>
                <th className="font-medium p-4 text-center">Your Matches</th>
                <th className="font-medium p-4 text-right">Prize Won</th>
              </tr>
            </thead>
            <tbody>
              {pastDraws.map((draw) => (
                <tr key={draw.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="p-4">{new Date(draw.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {draw.numbers.map((n, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold font-mono">
                          {n}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${draw.userMatched >= 3 ? 'bg-primary text-black' : 'bg-white/10 text-white/50'}`}>
                      {draw.userMatched}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-mono font-bold ${draw.won > 0 ? 'text-primary' : 'text-text-muted'}`}>
                    {draw.won > 0 ? `£${draw.won.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Draws;
