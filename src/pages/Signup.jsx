import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

// Mock charities for the assignment scope
const CHARITIES = [
  { id: 1, name: "Global Health Foundation" },
  { id: 2, name: "Youth Education Trust" },
  { id: 3, name: "Clean Oceans Initiative" }
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    charityId: CHARITIES[0].id,
    contributionPercent: 10 // Minimum 10% enforced
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. We'll skip explicitly inserting to 'profiles' here, 
    // Usually handled by a Supabase trigger, or we can insert if session is active.
    // For this simulation phase, we act as if it's successful.
    
    // Simulate passing data to the backend / next step
    console.log("Registered with profile data:", formData);
    navigate('/dashboard');
  };

  return (
    <div className="container max-w-lg py-12 animate-fade-in">
      <div className="glass-card">
        <h2 className="text-center mb-6">Join For <span className="text-primary">Impact</span></h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          {/* User Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-text-muted mb-1">Full Name</label>
              <input type="text" name="fullName" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-text-muted mb-1">Email</label>
              <input type="email" name="email" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-text-muted mb-1">Password</label>
              <input type="password" name="password" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" onChange={handleChange} />
            </div>
          </div>

          <div className="border-t border-white/10 my-2 pt-4">
            <h3 className="text-lg font-bold mb-4">Your Charitable Impact</h3>
            
            {/* Charity Selection */}
            <div className="mb-4">
              <label className="block text-sm text-text-muted mb-2">Select a Charity</label>
              <select name="charityId" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none" onChange={handleChange}>
                {CHARITIES.map(c => (
                  <option key={c.id} value={c.id} className="text-black">{c.name}</option>
                ))}
              </select>
            </div>

            {/* Contribution Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm text-text-muted">Subscription Contribution</label>
                <span className="text-xl font-bold text-primary">{formData.contributionPercent}%</span>
              </div>
              <input 
                type="range" 
                name="contributionPercent"
                min="10" 
                max="100" 
                value={formData.contributionPercent}
                onChange={handleChange}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-text-muted mt-2">Minimum 10% of your subscription goes directly to your selected charity.</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary justify-center mt-4 w-full text-lg py-4">
            {loading ? 'Creating Account...' : 'Continue to Payment'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Already a member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
