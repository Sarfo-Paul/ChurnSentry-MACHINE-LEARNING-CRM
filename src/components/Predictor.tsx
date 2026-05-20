import React, { useState } from "react";
import { Brain, Sparkles, FileText, Download, AlertTriangle, ArrowRight, Loader2, Sparkle } from "lucide-react";
import { PredictorFeatures, PredictionResult } from "../types";

interface PredictorProps {
  token: string;
  onPredictionComplete: () => void;
}

export default function Predictor({ token, onPredictionComplete }: PredictorProps) {
  const [formData, setFormData] = useState<PredictorFeatures>({
    customerName: "",
    email: "",
    tenure: 12,
    usageFrequency: 50,
    supportTickets: 2,
    monthlyCharges: 79.99,
    contractType: "month_to_month",
    paymentMethod: "credit_card",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.email) {
      setError("Please fill out the Customer Name and Email fields.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/predictions/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate machine learning prediction.");
      }

      setResult(data.prediction);
      onPredictionComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form handler
  const handleReset = () => {
    setResult(null);
    setError(null);
    setFormData({
      customerName: "",
      email: "",
      tenure: 12,
      usageFrequency: 50,
      supportTickets: 2,
      monthlyCharges: 79.99,
      contractType: "month_to_month",
      paymentMethod: "credit_card",
    });
  };

  // Export prediction history to text CSV representation directly in client
  const handleDownloadCSV = () => {
    if (!result) return;
    const f = result.features;
    const csvContent = [
      ["Metric", "Value"],
      ["Classification ID", result.id],
      ["Customer Name", result.customerName],
      ["Email Profile", result.email],
      ["Tenure (months)", f.tenure],
      ["Product Usage %", f.usageFrequency],
      ["Support Tickets", f.supportTickets],
      ["Monthly Charges ($)", f.monthlyCharges],
      ["Contract Type", f.contractType],
      ["Payment Method", f.paymentMethod],
      ["Calculated Churn Probability %", result.churnProbability],
      ["Risk Category", result.riskCategory],
      ["Top Drivers", result.topDrivers.join(" | ")],
    ]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `churn_evaluation_${result.customerName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe simple markdown displayer format since rich markdown classes may omit code block text
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-white mt-4 mb-2 font-display">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
        return (
          <div key={idx} className="text-xs text-slate-300 ml-4 mb-1 border-l-2 border-indigo-500/20 pl-3">
            {line}
          </div>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <div key={idx} className="text-xs text-slate-300 ml-6 mb-1 list-disc">
            {line}
          </div>
        );
      }
      if (line.trim().length === 0) return <div key={idx} className="h-2" />;
      
      // Inline highlights formatting for bold tags
      const regex = /\*\*(.*?)\*\*/g;
      let match;
      const parts = [];
      let lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="text-indigo-400 font-semibold">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      return (
        <p key={idx} className="text-xs text-slate-400 leading-relaxed font-sans mb-1 font-light">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Input Features Form Panel (Col 5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Brain className="w-5 h-5 animate-pulse" />
              <h2 className="text-lg font-display font-semibold text-white">Client Metrics Feed</h2>
            </div>
            <p className="text-xs text-slate-400 font-light font-sans">
              Populate active customer billing metrics to run the server-side classification algorithm
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Customer Details section */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Account Name / Contact</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACME Staff (Sarah Jenkins)"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition duration-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition duration-200"
                />
              </div>
            </div>

            {/* Tenure & Charges Numerical Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Relationship Tenure (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={formData.tenure}
                  onChange={(e) => setFormData({ ...formData, tenure: Math.max(1, parseInt(e.target.value, 10)) })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 font-mono transition duration-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Monthly License Bill ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.monthlyCharges}
                  onChange={(e) => setFormData({ ...formData, monthlyCharges: Math.max(0, parseFloat(e.target.value)) })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 font-mono transition duration-200"
                />
              </div>
            </div>

            {/* Interaction Usage slider */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-slate-400 font-medium font-sans">Usage Density Frequency</label>
                <span className="font-mono text-indigo-400 font-medium">{formData.usageFrequency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.usageFrequency}
                onChange={(e) => setFormData({ ...formData, usageFrequency: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Dormant</span>
                <span>Hyperactive</span>
              </div>
            </div>

            {/* Support Tickets Counter */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 font-sans">Recent Support Complaints Opened</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, supportTickets: Math.max(0, formData.supportTickets - 1) })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-slate-300 font-mono font-bold cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 py-1 px-4 bg-slate-950 border border-slate-800 text-center rounded-xl font-mono text-base font-bold text-slate-200">
                  {formData.supportTickets}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, supportTickets: Math.min(15, formData.supportTickets + 1) })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-slate-300 font-mono font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Contract Framing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Agreement Contract framework</label>
                <select
                  value={formData.contractType}
                  onChange={(e: any) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition duration-200"
                >
                  <option value="month_to_month">Month-To-Month</option>
                  <option value="one_year">1-Year Term</option>
                  <option value="two_year">2-Year Term</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-sans">Payment Config</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-600 transition duration-200"
                >
                  <option value="credit_card">Linked Credit Card</option>
                  <option value="electronic_check">Electronic Check</option>
                  <option value="bank_transfer">ACH Bank Wire</option>
                  <option value="mailed_check">Mailed Paper Check</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl font-mono text-[11px] leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-medium rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer text-xs uppercase tracking-wider font-mono"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5.5 h-5.5 animate-spin text-white" />
                  <span>Computing Boundaries...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Process Risk Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Evaluation Result Panel & AI Recomendation Drawer (Col 7) */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        
        {loading && (
          <div className="glass-panel p-10 rounded-2xl flex-1 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
              <Brain className="w-7 h-7 text-indigo-300 absolute top-4.5 left-4.5 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-display font-medium text-white/90">Analyzing Client Portfolio</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-light">
                Running localized logistic classification math... extracting variables coefficients... querying Gemini-3.5-Flash pipeline parameters to formulate retention tactical logs...
              </p>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="glass-panel p-10 rounded-2xl flex-1 flex flex-col items-center justify-center space-y-4 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
              <Brain className="w-8 h-8 text-indigo-400/80" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-display font-medium text-slate-200">Idle CRM Analytics Monitor</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">
                Select features on the left index panel to triggers the risk-checking neural pipeline model.
              </p>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col justify-between space-y-6">
            
            {/* Output Header mapping calculated metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/40">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">Classification Index ID: {result.id}</span>
                <h3 className="text-lg font-display text-white font-bold">{result.customerName}</h3>
                <p className="text-xs text-slate-400 font-light font-mono">{result.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-xs rounded-xl flex items-center transition cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            </div>

            {/* Calculations probability gauge visualization */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Circular Gauge metric (Col 4) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      strokeWidth="10"
                      stroke="rgba(148, 163, 184, 0.05)"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      strokeWidth="10"
                      stroke={
                        result.riskCategory === "High"
                          ? "#ef4444"
                          : result.riskCategory === "Medium"
                          ? "#f59e0b"
                          : "#10b981"
                      }
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - result.churnProbability / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-white">{result.churnProbability}%</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Risk Ratio</span>
                  </div>
                </div>

                <span
                  className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                    result.riskCategory === "High"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : result.riskCategory === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {result.riskCategory} Risk profile
                </span>
              </div>

              {/* Drivers Breakdown and Highlights (Col 8) */}
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-medium text-slate-200">Risk Drivers breakdown:</span>
                </div>

                <div className="space-y-2">
                  {result.topDrivers.map((drv, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-slate-950 border border-slate-900 rounded-xl text-xs">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-slate-300 font-sans">{drv}</span>
                    </div>
                  ))}
                  {result.topDrivers.length === 0 && (
                    <div className="text-slate-500 text-xs font-light">The model mapped no active extreme risk drivers. Account is healthy.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Scrollable recommendations drawer section */}
            <div className="flex-1 flex flex-col rounded-xl border border-indigo-500/10 bg-slate-900/30 overflow-hidden min-h-[220px]">
              
              <div className="px-4 py-3 border-b border-indigo-505/10 bg-indigo-500/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide font-display">Gemini Generative Client Retention Guidelines</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 indicator-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono">Live Insight</span>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[300px] space-y-1 scrollbar-thin">
                {renderMarkdown(result.aiRecommendations)}
              </div>

            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
