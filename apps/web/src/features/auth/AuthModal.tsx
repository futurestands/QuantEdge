import React, { useState } from "react";
import { X, Github, Target, Brain, Award, ChevronRight, Check } from "lucide-react";
import { signInWithProvider } from "../../lib/dashboard";

export const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onSignIn, onSignUp, email, setEmail, password, setPassword }: any) => {
  const [socialError, setSocialError] = useState("");
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState("Intermediate");
  const [style, setStyle] = useState("Swing");
  const [assets, setAssets] = useState("");

  const handleSocial = async (provider: string) => {
    try {
      await signInWithProvider(provider as any);
    } catch (e: any) {
      setSocialError(`${provider} login is not configured in Supabase dashboard.`);
    }
  };

  const handleSignUpClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2 && mode === "signup") {
      setStep(2);
    } else {
      onSignUp({ experience, style, assets: assets.split(",").map((a: string) => a.trim()) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/95 backdrop-blur-md p-4 transition-colors duration-300 text-main">
      <div className="w-full max-w-md panel p-8 relative shadow-2xl border-line/50 overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-main"><X size={20} /></button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-mint/10 text-mint px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            {mode === "signin" ? "Institutional Access" : "Join the Research Lab"}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{mode === "signin" ? "Welcome Back" : "Establish Identity"}</h2>
          <p className="text-muted text-sm mt-2">{mode === "signin" ? "Terminal ready for deployment." : "Define your trading parameters."}</p>
        </div>

        {mode === "signin" ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="secondary-button h-11" onClick={() => handleSocial("google")}>Google</button>
              <button className="secondary-button h-11" onClick={() => handleSocial("github")}><Github size={16} /> GitHub</button>
            </div>
            {socialError && <p className="text-[10px] text-center text-danger font-mono uppercase mb-4">{socialError}</p>}

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-panel px-2 text-muted">Verification required</span></div>
            </div>

            <form onSubmit={onSignIn} className="tool-form">
              <label><span>Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="trader@quantedge.com" /></label>
              <label><span>Password</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" /></label>
              <button className="primary-button full-button h-12 mt-4" type="submit">Unlock Terminal</button>
            </form>
          </>
        ) : (
          <div className="relative">
            {step === 1 ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleSignUpClick} className="tool-form">
                  <label><span>Email Address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter professional email" /></label>
                  <label><span>Secure Password</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 8 characters" /></label>
                  <button className="primary-button full-button h-12 mt-4" type="submit">Continue to Profile <ChevronRight size={16} /></button>
                </form>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                <div className="space-y-4">
                  <label className="tool-form">
                    <span className="flex items-center gap-2"><Award size={14} className="text-mint" /> Trading Experience</span>
                    <select value={experience} onChange={e => setExperience(e.target.value)} className="h-11">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Professional</option>
                      <option>Institutional</option>
                    </select>
                  </label>

                  <label className="tool-form">
                    <span className="flex items-center gap-2"><Brain size={14} className="text-mint" /> Primary Strategy Style</span>
                    <select value={style} onChange={e => setStyle(e.target.value)} className="h-11">
                      <option>Scalping</option>
                      <option>Day Trading</option>
                      <option>Swing</option>
                      <option>Algorithmic</option>
                    </select>
                  </label>

                  <label className="tool-form">
                    <span className="flex items-center gap-2"><Target size={14} className="text-mint" /> Primary Assets (Symbols)</span>
                    <input value={assets} onChange={e => setAssets(e.target.value)} placeholder="e.g. EURUSD, XAUUSD, BTC" className="h-11" />
                    <p className="text-[9px] text-muted uppercase mt-1">Separated by commas</p>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="secondary-button flex-1 h-12">Back</button>
                  <button onClick={handleSignUpClick} className="primary-button flex-[2] h-12">Initialize Lab <Check size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-line mt-8 pt-6">
          <p className="text-center text-xs text-muted">
            {mode === "signin" ? "New to QuantEdge?" : "Already have an account?"}
            <button
              onClick={() => {
                onSwitchMode(mode === "signin" ? "signup" : "signin");
                setStep(1);
              }}
              className="text-mint font-bold ml-2 hover:underline"
            >
              {mode === "signin" ? "Initialize Lab" : "Sign into Terminal"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
