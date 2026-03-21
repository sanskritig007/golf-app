import React, { useState } from 'react';
import { generateDraw, calculatePrizePool } from '../utils/drawEngine';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('draws');
  
  // Simulation State
  const [subscribers, setSubscribers] = useState(15000);
  const [simulationResult, setSimulationResult] = useState(null);

  const runSimulation = (type) => {
    const winningNumbers = generateDraw(type);
    const financials = calculatePrizePool(subscribers);
    
    setSimulationResult({
      type,
      numbers: winningNumbers,
      financials
    });
  };

  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Admin <span className="text-primary">Control Center</span></h2>
        <div className="bg-black/40 rounded-full p-1 border border-white/5 inline-flex">
          <button onClick={() => setActiveTab('draws')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'draws' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Draw Engine</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Users</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Reports</button>
          <button onClick={() => setActiveTab('charity')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'charity' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Payouts</button>
        </div>
      </div>

      {activeTab === 'draws' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card">
            <h3 className="mb-4">Draw Configuration & Simulator</h3>
            <p className="text-sm text-text-muted mb-6">Test the Monthly Draw logic before officially publishing results to the user portal.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-text-muted mb-1">Active Subscribers (Simulation)</label>
                <input 
                  type="number" 
                  value={subscribers}
                  onChange={(e) => setSubscribers(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => runSimulation('random')} className="btn-ghost flex-1">Run Random Draw</button>
              <button onClick={() => runSimulation('algorithmic')} className="btn-primary flex-1">Run Algorithmic Draw</button>
            </div>
          </div>

          <div className="glass-card flex flex-col">
            <h3 className="mb-4">Simulation Results</h3>
            
            {!simulationResult ? (
              <div className="flex-1 flex items-center justify-center text-text-muted border border-dashed border-white/10 rounded-xl">
                Run a simulation to view logic output.
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <div className="text-sm text-text-muted uppercase tracking-wider mb-2">Winning Combination ({simulationResult.type})</div>
                  <div className="flex gap-2">
                    {simulationResult.numbers.map((num, i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-xl font-bold">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="text-sm text-text-muted uppercase tracking-wider mb-4">Prize Pool Distribution</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white">Total Pool</span>
                      <span className="font-bold">£{simulationResult.financials.prizePool.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary font-semibold">5-Match Jackpot (40%)</span>
                      <span className="font-mono">£{simulationResult.financials.distributions.match5.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white">4-Match Pool (35%)</span>
                      <span className="font-mono">£{simulationResult.financials.distributions.match4.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white">3-Match Pool (25%)</span>
                      <span className="font-mono">£{simulationResult.financials.distributions.match3.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary w-full bg-red-600 hover:bg-red-700">Official Publish</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 className="mb-4">User Management Prototype</h3>
          <p className="text-sm text-text-muted">In a full production environment, this dashboard would map directly to the Supabase <code>profiles</code> table, allowing admins to edit scores and manage subscriptions.</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card">
            <h3 className="mb-6">Global Financial Overview</h3>
            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-text-muted">Total Revenue (YTD)</div>
                <div className="text-3xl font-bold text-white">£450,210.00</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <div className="text-sm text-primary">Total Charity Distributed</div>
                <div className="text-3xl font-bold text-primary">£120,550.00</div>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-text-muted">Prize Pools Distributed</div>
                <div className="text-3xl font-bold text-white">£135,063.00</div>
              </div>
            </div>
          </div>
          <div className="glass-card">
            <h3 className="mb-6">Active Subscribers</h3>
            <div className="flex items-end gap-4 mb-8">
              <div className="text-5xl font-bold">15,420</div>
              <div className="text-primary font-bold mb-1">+4% this month</div>
            </div>
            
            <h4 className="text-sm uppercase text-text-muted mb-3">Subscription Tiers</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Club Members</span> <span>12,100</span></div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{width: '78%'}}></div></div>
              
              <div className="flex justify-between text-sm mt-4"><span>Founding Members</span> <span>3,320</span></div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: '22%'}}></div></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charity' && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="m-0">Charity & Winners Payout Tracking</h3>
            <button className="btn-primary text-sm py-2">Export CSV</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-sm uppercase tracking-wider text-text-muted">
                  <th className="font-medium p-4">Recipient</th>
                  <th className="font-medium p-4">Type</th>
                  <th className="font-medium p-4">Amount</th>
                  <th className="font-medium p-4 text-center">Status</th>
                  <th className="font-medium p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">Global Health Foundation</td>
                  <td className="p-4"><span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">CHARITY</span></td>
                  <td className="p-4 font-mono">£12,450.00</td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">● Pending</span></td>
                  <td className="p-4"><button className="text-primary hover:underline text-sm">Process Payout</button></td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">Alex Golfer</td>
                  <td className="p-4"><span className="bg-white/10 text-white px-2 py-1 rounded text-xs">WINNER (Match 4)</span></td>
                  <td className="p-4 font-mono">£1,250.00</td>
                  <td className="p-4 text-center"><span className="text-primary text-sm">● Paid</span></td>
                  <td className="p-4"><button className="text-text-muted hover:text-white text-sm">View Receipt</button></td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">Youth Education Trust</td>
                  <td className="p-4"><span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">CHARITY</span></td>
                  <td className="p-4 font-mono">£8,100.00</td>
                  <td className="p-4 text-center"><span className="text-primary text-sm">● Paid</span></td>
                  <td className="p-4"><button className="text-text-muted hover:text-white text-sm">View Receipt</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
