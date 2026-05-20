import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { Users, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, ArrowRight, Brain } from "lucide-react";
import { DashboardStats } from "../types";

interface DashboardProps {
  token: string;
  onNavigate: (tab: string) => void;
  stats: DashboardStats | null;
  loading: boolean;
  refreshStats: () => void;
}

export default function Dashboard({ stats, loading, onNavigate, refreshStats }: DashboardProps) {
  
  useEffect(() => {
    refreshStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 border border-slate-700/30 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-800/40 border border-slate-700/30 rounded-2xl" />
          <div className="h-80 bg-slate-800/40 border border-slate-700/30 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-800/40 border border-slate-700/30 rounded-2xl" />
      </div>
    );
  }

  // Formatting currency helper
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Pie chart segments data mapping
  const pieData = [
    { name: "High Risk (>=70%)", value: stats.riskSegments.high, color: "#ef4444" },
    { name: "Medium Risk (35%-69%)", value: stats.riskSegments.medium, color: "#f59e0b" },
    { name: "Low Risk (<35%)", value: stats.riskSegments.low, color: "#10b981" },
  ];

  const totalSegments = stats.riskSegments.high + stats.riskSegments.medium + stats.riskSegments.low || 1;
  const highRiskPct = Math.round((stats.riskSegments.high / totalSegments) * 100);

  return (
    <div className="space-y-6">
      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Profiles Evaluated */}
        <div className="glass-panel p-6 rounded-2xl transition-all duration-300 hover:border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 font-sans text-sm font-medium">Customer Evaluations</span>
            <div className="p-2 border border-indigo-500/10 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold font-mono text-white">{stats.totalPredictions}</h3>
            <p className="text-xs text-slate-400 font-light flex items-center gap-1">
              <span className="text-emerald-400 font-medium font-mono">100% Core</span> active index records
            </p>
          </div>
        </div>

        {/* Weighted Churn Rate Mean */}
        <div className="glass-panel p-6 rounded-2xl transition-all duration-300 hover:border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 font-sans text-sm font-medium">Mean Churn Probability</span>
            <div className={`p-2 border rounded-xl ${stats.avgChurnProb > 45 ? 'border-red-500/10 bg-red-500/10 text-red-400' : 'border-amber-500/10 bg-amber-500/10 text-amber-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold font-mono text-white">{stats.avgChurnProb}%</h3>
            <p className="text-xs text-slate-400 font-light">
              Avg boundary risk density per case
            </p>
          </div>
        </div>

        {/* Revenue-at-Risk exposing high-churn profiles subscription volume */}
        <div className="glass-panel p-6 rounded-2xl transition-all duration-300 hover:border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 font-sans text-sm font-medium">Monthly Revenue at Risk</span>
            <div className="p-2 border border-red-500/10 rounded-xl bg-red-500/10 text-red-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold font-mono text-red-400">{formatUSD(stats.revenueAtRisk)}</h3>
            <p className="text-xs text-slate-400 font-light flex items-center gap-1">
              From <span className="text-red-400 font-semibold">{stats.riskSegments.high} High-Risk</span> profiles
            </p>
          </div>
        </div>

        {/* Model Accuracy Tracking Card */}
        <div className="glass-panel p-6 rounded-2xl transition-all duration-300 hover:border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 font-sans text-sm font-medium">Classifier Accuracy</span>
            <div className="p-2 border border-emerald-500/10 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold font-mono text-white">{stats.modelDetails.accuracy}%</h3>
            <p className="text-xs text-slate-400 font-light flex items-center gap-1">
              Active Logistic regression model
            </p>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Churn Probability Timeline Area Graph (Recharts Area Chart) */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-display font-semibold text-white">Aggregated Risk Trend</h3>
              <p className="text-xs text-slate-400 font-light">Evaluated average churn probability curves over historical evaluation dates</p>
            </div>
            <div className="flex gap-4 text-xs font-mono select-none">
              <div className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Avg Churn %</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 pt-2">
            {stats.timelineData && stats.timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="avgRisk" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRisk)" name="Avg Churn Risk %" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No historical timelines generated yet. Submit a customer prediction first.</div>
            )}
          </div>
        </div>

        {/* Churn Risk Categories Segmentation Pie Chart (Recharts) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-display font-semibold text-white">Risk Distributions</h3>
            <p className="text-xs text-slate-400 font-light">Distribution share of current profiles indices</p>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            {stats.totalPredictions > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="5/0%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric displaying High Risk Share ratio */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-white">{highRiskPct}%</span>
                  <span className="text-[10px] text-slate-400 font-mono">High Risk share</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-sm">No segments populated.</div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/40">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Demographic and Model Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Average Tenure comparisons */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-display font-semibold text-white">Tenure Demographics Breakdown</h3>
              <p className="text-xs text-slate-400 font-light">Comparing average relationship duration (months) across risk segments</p>
            </div>
          </div>

          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Active High Risk Cohorts", months: stats.onboardingTenureAvg, color: "#ef4444" },
                  { name: "Loyal Low Risk Cohorts", months: stats.stableTenureAvg, color: "#10b981" }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={50}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                />
                <Bar dataKey="months" radius={[8, 8, 0, 0]} name="Average Retention (Months)">
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Pipeline Health Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Brain className="w-5 h-5" />
              <h3 className="text-base font-display font-semibold text-white">Model Pipeline Settings</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Your localized binary Logistic Regression model computes coefficients recursively on the server-side. Change weights or retrain instantly inside the admin panel.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/40 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Model Pipeline Status</span>
              <span className="font-mono text-emerald-400 font-semibold">● Operational</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Model Tuning</span>
              <span className="font-mono text-slate-300">
                {stats.modelDetails.trainedAt ? new Date(stats.modelDetails.trainedAt).toLocaleDateString() : "Never"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Current Dataset Base</span>
              <span className="font-mono text-indigo-300 font-semibold">{stats.totalPredictions * 4 + 100} Clients</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("train")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition-all duration-200 shadow-lg shadow-indigo-600/10"
          >
            <span>Retrain & Optimize Model</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
