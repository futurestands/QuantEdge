import React from "react";
import { X, Github } from "lucide-react";
import { signInWithProvider } from "../../lib/dashboard";

export const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onSignIn, onSignUp, email, setEmail, password, setPassword }: any) => (
  isOpen ? (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#07090d]/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md panel p-8 relative shadow-2xl border-line/50">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20} /></button>
        <div className="text-center mb-8"><h2 className="text-2xl font-bold">Create your free workspace</h2><p className="text-slate-400 text-sm mt-2">Your backtests are saved securely.</p></div>
        <div className="grid grid-cols-2 gap-3 mb-6"><button className="secondary-button" onClick={() => signInWithProvider("google")}>Google</button><button className="secondary-button" onClick={() => signInWithProvider("github")}><Github size={16} /> GitHub</button></div>
        <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-[#10141d] px-2 text-slate-500">Or continue with email</span></div></div>
        <form onSubmit={mode === "signin" ? onSignIn : onSignUp} className="tool-form">
          <label><span>Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label><span>Password</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <button className="primary-button full-button h-12 mt-4" type="submit">{mode === "signin" ? "Sign In" : "Create Account"}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-8">{mode === "signin" ? "New to QuantEdge?" : "Already have an account?"}<button onClick={() => onSwitchMode(mode === "signin" ? "signup" : "signin")} className="text-mint font-bold ml-2 underline underline-offset-4">{mode === "signin" ? "Create account" : "Sign in"} </button></p>
      </div>
    </div>
  ) : null
);
