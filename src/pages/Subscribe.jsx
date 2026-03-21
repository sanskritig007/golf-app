import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const Subscribe = () => {
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please log in to seamlessly subscribe.");
      navigate('/login');
      return;
    }

    setLoading(true);

    // Use the SECURITY DEFINER RPC — it bypasses RLS entirely, avoiding
    // the infinite recursion caused by the self-referential profiles policy.
    const { error: rpcError } = await supabase.rpc('activate_subscription');

    if (rpcError) {
      console.error("activate_subscription RPC failed:", rpcError.message);
      alert(`Checkout simulation failed: ${rpcError.message}`);
      setLoading(false);
      return;
    }

    // Simulate network processing delay for UX
    setTimeout(() => {
      setLoading(false);
      alert("Payment Successful! Welcome to the Club.");
      // Hard redirect — guarantees Dashboard fetches a completely fresh profile
      // from the DB (no stale React state from the previous page).
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="container max-w-4xl py-12 animate-fade-in">
      <div className="text-center mb-16">
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Membership</span>
        <h2 className="text-4xl md:text-5xl mb-4">Invest in your game.<br/>Invest in <span className="text-primary">humanity.</span></h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Join the premium golf community. Submit scores, win monthly jackpots, and automatically direct a portion of your fee to a charity of your choice.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-black/40 p-1 rounded-full border border-white/5 inline-flex">
          <button 
            className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${billing === 'monthly' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${billing === 'yearly' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1 border border-primary/20">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Core Plan */}
        <div className="glass-card relative">
          <h3 className="text-2xl mb-2">Club Member</h3>
          <p className="text-text-muted text-sm mb-6">Full access to the platform and monthly prize draws.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-extrabold font-heading">£{billing === 'monthly' ? '19.99' : '190.00'}</span>
            <span className="text-text-muted">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
          </div>

          <ul className="space-y-4 mb-8 text-sm">
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> Submit infinite scores
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> Minimum 10% charity contribution
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> Access to 3/4/5-match prize pools
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> Global leaderboard
            </li>
          </ul>

          <button onClick={handleSubscribe} className="btn-ghost w-full justify-center py-3">
            {loading ? 'Processing...' : 'Secure Checkout'}
          </button>
        </div>

        {/* Founding Member */}
        <div className="glass-card relative border-primary/40 bg-primary/5">
          <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
            MOST POPULAR
          </div>
          <h3 className="text-2xl mb-2 text-primary">Founding Member</h3>
          <p className="text-text-muted text-sm mb-6">Maximize your impact and your winning potential.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-extrabold font-heading">£{billing === 'monthly' ? '34.99' : '335.00'}</span>
            <span className="text-text-muted">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
          </div>

          <ul className="space-y-4 mb-8 text-sm">
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> All Club Member features
            </li>
            <li className="flex items-center gap-3 font-semibold text-white">
              <span className="text-primary">✓</span> Up to 50% charity contribution
            </li>
            <li className="flex items-center gap-3 font-semibold text-white">
              <span className="text-primary">✓</span> 2x Multiplier on Match-3 Prizes
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span> Premium profile badge
            </li>
          </ul>

          <button onClick={handleSubscribe} className="btn-primary w-full justify-center py-3">
            {loading ? 'Processing...' : 'Secure Checkout'}
          </button>
          <div className="text-center mt-3 text-xs text-text-muted flex justify-center items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
