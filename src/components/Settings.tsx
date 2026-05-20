import React, { useState, useEffect } from "react";
import { Shield, Key, Database, Cpu, Sparkles, Terminal, CheckCircle, Info, RefreshCw, FileText } from "lucide-react";
import { User, ApiDoc } from "../types";

interface SettingsProps {
  token: string;
  user: User | null;
  onProfileUpdate: (updatedUser: User) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export default function Settings({ token, user, onProfileUpdate, darkMode, onThemeToggle }: SettingsProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState(user?.settings.notificationsEnabled ?? true);
  const [autoInsight, setAutoInsight] = useState(user?.settings.autoInsightGeneration ?? true);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiDocs, setApiDocs] = useState<ApiDoc[]>([]);
  const [docLoading, setDocLoading] = useState(false);

  // Sync state with user prop updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setNotifications(user.settings.notificationsEnabled);
      setAutoInsight(user.settings.autoInsightGeneration);
    }
  }, [user]);

  // Fetch API endpoints documentation
  useEffect(() => {
    const fetchDocs = async () => {
      setDocLoading(true);
      try {
        const response = await fetch("/api/docs");
        const data = await response.json();
        setApiDocs(data.endpoints || []);
      } catch (err) {
        console.error("Failed to load API docs:", err);
      } finally {
        setDocLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Save profile state to server
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          password: password.trim().length > 0 ? password : undefined,
          notificationsEnabled: notifications,
          autoInsightGeneration: autoInsight,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onProfileUpdate(data.user);
      setPassword(""); // clear password field
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
      
      {/* Profile configurations form (Col 5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2 text-indigo-400 mb-0.5">
              <Shield className="w-5 h-5" />
              <h3 className="text-base font-display font-semibold text-white">Profile & Preferences</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-light font-sans">
              Update analyst account settings, alerts and neural models interfaces.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 font-sans">Full Team Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5 font-sans">Change Secret Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            {/* Custom Theme toggle buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              <div className="flex justify-between items-center py-1">
                <div className="space-y-0.5">
                  <span className="block text-slate-300 font-sans font-medium">Platform Dark Mode Theme</span>
                  <span className="block text-[10px] text-slate-500 font-light">Sets high contrast visual slate palettes</span>
                </div>
                <button
                  type="button"
                  onClick={onThemeToggle}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    darkMode ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md transform duration-200" />
                </button>
              </div>

              {/* Email alerts flag */}
              <div className="flex justify-between items-center py-1">
                <div className="space-y-0.5">
                  <span className="block text-slate-300 font-sans font-medium">Automatic Email Alerts Notifications</span>
                  <span className="block text-[10px] text-slate-500 font-light">Dispatches warning packets if high risk is generated</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    notifications ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md transform duration-200" />
                </button>
              </div>

              {/* Gemini Insights Auto toggle */}
              <div className="flex justify-between items-center py-1">
                <div className="space-y-0.5">
                  <span className="block text-slate-300 font-sans font-medium">Gemini AI Auto-Insight Generator</span>
                  <span className="block text-[10px] text-slate-500 font-light">Preprocesses prompts using Gemini-3.5-Flash</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoInsight(!autoInsight)}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    autoInsight ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md transform duration-200" />
                </button>
              </div>
            </div>

            {success && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-medium rounded-xl transition duration-200 shadow-lg cursor-pointer font-sans text-xs uppercase select-none font-bold"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Profile Settings"}
            </button>
          </form>
        </div>

        {/* Deployment guidelines panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-3 font-mono text-[10px] leading-relaxed">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="font-bold uppercase font-sans text-xs text-white">SaaS Deployment Guidelines</span>
          </div>
          <div className="space-y-2 text-slate-400">
            <p>
              This app is containerized. Deploy to Cloud Run or Render in 2 steps:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl text-[9px] text-slate-300 space-y-1">
              <div><strong className="text-indigo-400">1. Server Build compilation:</strong></div>
              <div><code>npm run build</code> (compiles TS backend server to dist/server.cjs)</div>
              <div className="pt-1"><strong className="text-indigo-400">2. Container Launch:</strong></div>
              <div><code>npm run start</code> (runs node dist/server.cjs binding to host 0.0.0.0:3000)</div>
            </div>
            <p className="font-sans">
              Set <code className="text-indigo-300">GEMINI_API_KEY</code> within environmental panels for live account recommendation generation.
            </p>
          </div>
        </div>
      </div>

      {/* REST API SWAGGER PANEL (Col 7) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2 text-indigo-400 mb-0.5">
              <Terminal className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-display font-semibold text-white">REST API Swagger Reference</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-light">
              Interactive structural schemas mapping fully-compliant json endpoints built inside our Express backend.
            </p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {docLoading && (
              <div className="text-center py-6">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                <span className="text-slate-500 text-xs">Loading api catalogs...</span>
              </div>
            )}

            {!docLoading && apiDocs.map((doc, i) => (
              <div key={i} className="p-3 bg-slate-950/70 border border-slate-900 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-[9px] font-bold rounded font-mono uppercase tracking-wider ${
                      doc.method === "POST"
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-505/20"
                        : doc.method === "DELETE"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-emerald-600/10 text-emerald-400 border border-emerald-505/20"
                    }`}
                  >
                    {doc.method}
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{doc.path}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans font-light">
                  {doc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
