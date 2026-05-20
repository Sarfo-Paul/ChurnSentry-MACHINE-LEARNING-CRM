import { LayoutDashboard, Brain, History, Settings, ShieldCheck, LogOut, Moon, Sun, PanelLeft, Bot } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export default function Navbar({ activeTab, onTabChange, user, onLogout, darkMode, onThemeToggle }: NavbarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "predict", label: "Predict Churn", icon: <Brain className="w-4 h-4" /> },
    { id: "history", label: "Analysis Log", icon: <History className="w-4 h-4" /> },
    { id: "train", label: "Train Pipeline", icon: <Bot className="w-4 h-4" /> },
    { id: "settings", label: "API & Profile", icon: <Settings className="w-4 h-4" /> },
    { id: "admin", label: "Security Log", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-40 px-4 md:px-8 py-3.5 border-b border-slate-800/40 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Emblem */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-500 shadow-inner">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-sm text-white tracking-wide">ChurnSentry</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">MACHINE LEARNING CRM</span>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-sans cursor-pointer focus:outline-none"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/20 text-slate-350 cursor-pointer focus:outline-none"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Tab Routing List */}
        {user && (
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-sans tracking-wide font-medium flex items-center gap-2 transition duration-150 cursor-pointer border focus:outline-none ${
                    active
                      ? "bg-indigo-600 border-indigo-505 text-white shadow-lg shadow-indigo-600/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* User profile dropdown triggers in Desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-705 text-slate-300 shadow-inner hover:bg-slate-700 hover:text-white cursor-pointer focus:outline-none"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="flex flex-col text-right">
                <span className="font-display font-semibold text-xs text-slate-200">{user.fullName}</span>
                <span className="text-[10px] text-slate-500 font-mono capitalize">{user.role} workspace</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/20 text-slate-400 transition hover:text-red-400 border border-transparent hover:border-red-500/10 cursor-pointer focus:outline-none"
                title="Log Out Analyst"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
