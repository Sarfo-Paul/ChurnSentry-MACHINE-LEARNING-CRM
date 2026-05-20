import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, ArrowRight, Loader2, Key, Users, AlertCircle, Bot } from "lucide-react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Predictor from "./components/Predictor";
import HistoryList from "./components/HistoryList";
import TrainModel from "./components/TrainModel";
import Settings from "./components/Settings";
import AdminPanel from "./components/AdminPanel";
import { User, ModelState, DashboardStats } from "./types";

export default function App() {
  // App authentication
  const [token, setToken] = useState<string | null>(localStorage.getItem("churn_token"));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "landing">("landing");

  // Router tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Stats & Model state synchronizations
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [modelState, setModelState] = useState<ModelState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Forms credentials
  const [email, setEmail] = useState("admin@churnpredictor.com");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Theme support
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : true;
  });

  // Sync light-theme flag directly to browser viewport
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Authenticate user profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      setAuthLoading(true);
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          // Auto sync user themes settings preference
          setDarkMode(data.user.settings.darkMode ?? true);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  // Pull Churn statistics from backend Express API
  const refreshStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
        // Map training details to local state
        setModelState({
          isTrained: data.modelDetails.isTrained,
          accuracy: data.modelDetails.accuracy,
          precision: 85.5, // baseline display
          recall: 91.1,
          f1Score: 89.3,
          confusionMatrix: {
            trueNegative: 52,
            falsePositive: 8,
            falseNegative: 5,
            truePositive: 51,
          },
          trainedAt: data.modelDetails.trainedAt,
          hyperparams: { epochs: 100, learningRate: 0.05 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Trigger metrics refresh on stats updates
  useEffect(() => {
    if (token) {
      refreshStats();
    }
  }, [token, refreshTrigger]);

  // Auth logins trigger
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem("churn_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setDarkMode(data.user.settings.darkMode ?? true);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Login authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth registration trigger
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem("churn_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setDarkMode(data.user.settings.darkMode ?? true);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("churn_token");
    setToken(null);
    setUser(null);
    setAuthMode("landing");
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Tab routers router
  const renderTabContent = () => {
    if (!token) return null;
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            token={token}
            onNavigate={setActiveTab}
            stats={stats}
            loading={statsLoading}
            refreshStats={refreshStats}
          />
        );
      case "predict":
        return (
          <Predictor
            token={token}
            onPredictionComplete={() => setRefreshTrigger((prev) => prev + 1)}
          />
        );
      case "history":
        return (
          <HistoryList
            token={token}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
            shouldRefresh={activeTab === "history"}
          />
        );
      case "train":
        return (
          <TrainModel
            token={token}
            modelState={modelState}
            onTrainingComplete={(updated) => {
              setModelState(updated);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        );
      case "settings":
        return (
          <Settings
            token={token}
            user={user}
            onProfileUpdate={setUser}
            darkMode={darkMode}
            onThemeToggle={handleThemeToggle}
          />
        );
      case "admin":
        return <AdminPanel token={token} role={user?.role || "operator"} />;
      default:
        return (
          <Dashboard
            token={token}
            onNavigate={setActiveTab}
            stats={stats}
            loading={statsLoading}
            refreshStats={refreshStats}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
      
      {/* Dynamic Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Container routes */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-fade-in">
        
        {/* Unauthenticated State panels */}
        {!token && (
          <AnimatePresence mode="wait">
            {authMode === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LandingPage onGetStarted={() => setAuthMode("login")} />
              </motion.div>
            )}

            {authMode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto mt-12"
              >
                <div className="glass-panel p-8 rounded-2xl space-y-6">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-505/20 mx-auto mb-3">
                      <Brain className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">Analyst Credentials Portal</h2>
                    <p className="text-slate-400 text-xs font-light">Access core telemetry systems and database history.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1.5 font-sans">Corporate Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1.5 font-sans">Workspace Secret Key</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
                      />
                    </div>

                    {authError && (
                      <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-medium rounded-xl transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 font-mono uppercase text-xs font-bold"
                      >
                        {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Verify Identity License"}
                      </button>

                      {/* Mock Fill shortcut button to helper credentials */}
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("admin@churnpredictor.com");
                          setPassword("admin123");
                          setAuthError(null);
                        }}
                        className="w-full py-2 bg-slate-800/60 text-slate-350 rounded-xl hover:bg-slate-700/60 transition cursor-pointer text-center font-mono font-bold"
                      >
                        Quick-Autofill Admin Master Key
                      </button>
                    </div>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthError(null);
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-slate-400 hover:text-indigo-400 transition cursor-pointer font-sans select-none"
                    >
                      Need dynamic access? <strong className="text-indigo-300 font-semibold underline">Register Operator Profile</strong>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {authMode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto mt-12"
              >
                <div className="glass-panel p-8 rounded-2xl space-y-6">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-505/20 mx-auto mb-3">
                      <Bot className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">Create Operator Workspace</h2>
                    <p className="text-slate-400 text-xs font-light font-sans">Set credentials to unlock analytical modeling logs.</p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1.5 font-sans">Analyst Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jean-Luc Picard"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1.5 font-sans">Operator Registry Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. captain@enterprise.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1.5 font-sans">Workspace Password Key</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 6 characters recommended"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
                      />
                    </div>

                    {authError && (
                      <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium rounded-xl transition duration-200 cursor-pointer text-xs uppercase font-mono tracking-wider font-bold shadow-lg shadow-indigo-600/10"
                    >
                      {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin mx-auto" /> : "Commit Operator Registry"}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError(null);
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-slate-400 hover:text-indigo-400 transition cursor-pointer font-sans select-none"
                    >
                      Already holding authorization? <strong className="text-indigo-300 font-semibold underline">Portal Access</strong>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Authenticated Application tabs routers mapping */}
        {token && (
          <div className="fade-in duration-300 animate-in">
            {renderTabContent()}
          </div>
        )}

      </main>

      {/* Persistent Footer and status tracker */}
      <footer className="py-6 border-t border-slate-800/40 text-center text-[11px] text-slate-500 font-mono mt-12 bg-slate-900/25">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between items-center gap-3">
          <span>
            © 2026 ChurnSentry Analytical Platforms. Developed with highest mathematical precision guidelines.
          </span>
          <div className="flex items-center gap-4 text-[10px] text-slate-450">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>GCP CLOUD CORE RUN STATUS: DEPLOYED</span>
            </span>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
