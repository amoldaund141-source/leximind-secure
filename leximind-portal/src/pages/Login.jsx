import React, { useRef, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldHalf, User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldCheck,
  Fingerprint, Scale, FlaskConical, Eye as EyeIcon, FileText, ScrollText, KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GlobalStyles, Field, cx } from "../components/ui";
import { ROLE_PREFIX, MOCK_USERS } from "../data/mockData";
import LoginStyles from "../components/experience/LoginStyles";
import ParticleField from "../components/experience/ParticleField";
import CursorGlow from "../components/experience/CursorGlow";
import SecurityPulseBadge from "../components/experience/SecurityPulseBadge";
import WelcomeOverlay from "../components/experience/WelcomeOverlay";

const ROLE_DEMO = [
  { role: "Investigation Officer", icon: Fingerprint, u: "io.mehra" },
  { role: "Forensic Analyst", icon: FlaskConical, u: "fa.nandini" },
  { role: "Legal Officer", icon: Scale, u: "lo.kapoor" },
  { role: "Supervisory Officer", icon: EyeIcon, u: "so.verma" },
  { role: "System Administrator", icon: ShieldHalf, u: "admin.iyer" },
];

export default function LoginPage() {
  const { user, role, login, register, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [regRole, setRegRole] = useState("IO");
  const [department, setDepartment] = useState("");
  const [badge, setBadge] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successUser, setSuccessUser] = useState(null); // holds the authed user while the welcome transition plays
  const cardRef = useRef(null);

  // Subtle cursor-parallax tilt on the card — CSS-var free, direct style write,
  // so it never forces a React re-render on mousemove.
  const handleTilt = (e) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${px * 3.5}deg) rotateX(${-py * 3.5}deg) translateZ(0)`;
  };
  const resetTilt = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  };

  // Already signed in? Go straight to the dashboard — unless we're mid-way
  // through the welcome transition we just triggered below, in which case
  // let that finish and navigate on its own terms.
  if (user && !successUser) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from && from !== "/login" ? from : `/${ROLE_PREFIX[role]}/dashboard`} replace />;
  }

  
  const submit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!username.trim() || !password) { setLocalError("Enter both username and password."); return; }
    if (isSignup && (!fullName.trim() || !department.trim() || !badge.trim())) {
      setLocalError("Please fill out all fields."); return;
    }
    
    try {
      let authedUser;
      if (isSignup) {
        authedUser = await register({
          username, password, full_name: fullName, role: regRole, department, badge_number: badge
        });
      } else {
        authedUser = await login(username, password);
      }
      setSuccessUser(authedUser); 
    } catch {
      // authError from context surfaces the message
    }
  };

  const fillDemo = (u) => {
    setUsername(u);
    setPassword(MOCK_USERS[u].password);
    setLocalError("");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <GlobalStyles />
      <LoginStyles />
      <CursorGlow />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[26rem] h-[26rem] bg-cyan-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 75%)",
          }}
        />
        <ParticleField count={16} />

        {/* faint floating document/ledger glyphs — decorative, desktop-only */}
        <FileText className="hidden lg:block login-ambient-icon absolute top-[16%] left-[12%] w-8 h-8 text-cyan-400/[0.12]" style={{ animationDelay: "0s" }} />
        <ScrollText className="hidden lg:block login-ambient-icon absolute bottom-[20%] right-[13%] w-9 h-9 text-cyan-400/[0.12]" style={{ animationDelay: "2.2s" }} />
        <KeyRound className="hidden lg:block login-ambient-icon absolute top-[24%] right-[10%] w-7 h-7 text-cyan-400/[0.12]" style={{ animationDelay: "4.4s" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-4 login-in" style={{ animationDelay: "0.02s" }}>
            <span className="absolute inset-[-10px] rounded-[1.4rem] border border-cyan-400/20 login-ring-spin" />
            <span className="absolute inset-[-4px] rounded-[1.15rem] bg-cyan-500/20 blur-lg login-ring-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(6,182,212,0.6)]">
              <ShieldHalf className="w-8 h-8 text-slate-950" strokeWidth={1.75} />
            </div>
          </div>
          <span className="login-in inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-3" style={{ animationDelay: "0.08s" }}>
            <Fingerprint className="w-3 h-3" /> AI-Powered Secure Legal & Investigation Intelligence Platform
          </span>
          <h1 className="login-in text-3xl font-bold text-white tracking-tight text-center" style={{ animationDelay: "0.14s" }}>LexiMind Secure</h1>
          <p className="login-in text-sm text-slate-400 mt-2 tracking-wide" style={{ animationDelay: "0.2s" }}>Secure · Verify · Trace · Investigate</p>
        </div>

        <div
          ref={cardRef}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
          className="login-card-in relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl shadow-black/50 p-6 sm:p-8 transition-transform duration-200 ease-out"
          style={{ animationDelay: "0.26s" }}
        >
          {/* inner sheen + scanline, purely decorative */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent login-scan" />
          </div>

          <SecurityPulseBadge className="relative mb-5" />

          <form onSubmit={submit} className="relative space-y-4">
            <Field label="Username" dark>
              <div className="login-field-group group/field relative">
                <User className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. io.mehra"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                />
                <span className="login-underline" />
              </div>
            </Field>
            {isSignup && (
              <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <Field label="Full Name" dark error={localError && !fullName}>
                  <div className="login-field-group group/field relative">
                    <User className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Insp. Rohan Mehra"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                    <span className="login-underline" />
                  </div>
                </Field>
                <Field label="Role" dark>
                  <div className="login-field-group group/field relative">
                    <ShieldHalf className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all [&>option]:bg-slate-900 [&>option]:text-slate-100"
                    >
                      <option value="IO">Investigation Officer</option>
                      <option value="FA">Forensic Analyst</option>
                      <option value="LO">Legal Officer</option>
                      <option value="SO">Supervisory Officer</option>
                      <option value="SA">System Administrator</option>
                    </select>
                    <span className="login-underline" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Department" dark>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Cyber Crime"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                  </Field>
                  <Field label="Badge Number" dark>
                    <input
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. IO-4471"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                  </Field>
                </div>
              </div>
            )}

            <Field label="Password" dark>
              <div className="login-field-group group/field relative">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 hover:scale-110 active:scale-95 transition-all"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <span className="login-underline" />
              </div>
            </Field>
            {isSignup && (
              <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <Field label="Full Name" dark error={localError && !fullName}>
                  <div className="login-field-group group/field relative">
                    <User className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Insp. Rohan Mehra"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                    <span className="login-underline" />
                  </div>
                </Field>
                <Field label="Role" dark>
                  <div className="login-field-group group/field relative">
                    <ShieldHalf className="w-4 h-4 text-slate-500 group-focus-within/field:text-cyan-300 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all [&>option]:bg-slate-900 [&>option]:text-slate-100"
                    >
                      <option value="IO">Investigation Officer</option>
                      <option value="FA">Forensic Analyst</option>
                      <option value="LO">Legal Officer</option>
                      <option value="SO">Supervisory Officer</option>
                      <option value="SA">System Administrator</option>
                    </select>
                    <span className="login-underline" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Department" dark>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Cyber Crime"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                  </Field>
                  <Field label="Badge Number" dark>
                    <input
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. IO-4471"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                    />
                  </Field>
                </div>
              </div>
            )}


            {(localError || authError) && (
              <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2 animate-popin">
                <AlertCircle className="w-4 h-4 shrink-0" /> {localError || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="login-shimmer w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-all duration-200 hover:shadow-[0_0_28px_-6px_rgba(34,211,238,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:translate-y-0 disabled:hover:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {isSignup ? 'Creating Account…' : 'Authenticating…'}</> : <>{isSignup ? 'Create Account' : 'Secure Sign In'} <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsSignup(!isSignup)} 
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>

          <div className="relative mt-6 pt-5 border-t border-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2.5">Demo role login</div>
            <div className="grid grid-cols-1 gap-1.5">
              {ROLE_DEMO.map((d, idx) => (
                <button
                  key={d.u}
                  type="button"
                  onClick={() => fillDemo(d.u)}
                  className={cx(
                    "login-in w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-cyan-400/30 hover:translate-x-0.5 px-3 py-2 text-left transition-all",
                    username === d.u && "border-cyan-400/50 bg-white/[0.08]"
                  )}
                  style={{ animationDelay: `${0.35 + idx * 0.06}s` }}
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-200"><d.icon className="w-3.5 h-3.5 text-cyan-300" /> {d.role}</span>
                  <span className="text-[11px] text-cyan-300/70 font-mono-data">{d.u}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="login-in flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-500" style={{ animationDelay: "0.66s" }}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 encrypted · Blockchain-verified · Access is logged
        </div>
      </div>

      {successUser && (
        <WelcomeOverlay
          name={successUser.name}
          role={successUser.role}
          onDone={() => navigate(`/${ROLE_PREFIX[successUser.role]}/dashboard`, { replace: true })}
        />
      )}
    </div>
  );
}
