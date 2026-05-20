import React, { useState, useEffect } from "react";
import { Search, Loader2, Sparkles, Trash2, Calendar, FileText, ChevronLeft, ChevronRight, X, AlertTriangle, Eye, Download } from "lucide-react";
import { PredictionResult } from "../types";

interface HistoryListProps {
  token: string;
  onRefresh: () => void;
  shouldRefresh: boolean;
}

export default function HistoryList({ token, onRefresh, shouldRefresh }: HistoryListProps) {
  // Queries
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<PredictionResult | null>(null);

  // Load predictions
  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/predictions?search=${encodeURIComponent(search)}&risk=${risk}&page=${page}&limit=8`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setPredictions(data.predictions);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [search, risk, page, shouldRefresh]);

  // Handle Search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page index
  };

  // Handle Risk select change
  const handleRiskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRisk(e.target.value);
    setPage(1); // Reset page index
  };

  // Remove precise history log from backend
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this customer evaluation record from database?")) return;

    try {
      const response = await fetch(`/api/predictions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error);
      }

      if (selectedItem?.id === id) setSelectedItem(null);
      fetchPredictions();
      onRefresh(); // refresh stats in parent
    } catch (err: any) {
      alert(err.message || "Failed to purge record.");
    }
  };

  // Export full prediction list as CSV dynamically on client
  const handleExportCSV = () => {
    if (predictions.length === 0) return;
    const headers = ["Index ID", "Customer Name", "Contact Email", "Tenure (months)", "Usage Frequency", "Support Tickets", "Monthly Charges", "Contract Type", "Payment Method", "Calculated Risk %", "Risk Category", "Evaluated Date"];
    const csvContent = [
      headers,
      ...predictions.map((p) => [
        p.id,
        p.customerName,
        p.email,
        p.features.tenure,
        p.features.usageFrequency,
        p.features.supportTickets,
        p.features.monthlyCharges,
        p.features.contractType,
        p.features.paymentMethod,
        p.churnProbability,
        p.riskCategory,
        new Date(p.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "churn_predictor_evaluation_dump.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render markdown inline helper
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-semibold text-white mt-3 mb-1.5 font-display">{line.substring(4)}</h4>;
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
        return <div key={idx} className="text-[11px] text-slate-300 ml-3 mb-1 border-l-2 border-indigo-500/20 pl-2">{line}</div>;
      }
      if (line.startsWith("- ")) {
        return <div key={idx} className="text-[11px] text-slate-300 ml-4 mb-0.5 list-disc">{line}</div>;
      }
      if (line.trim().length === 0) return <div key={idx} className="h-1.5" />;
      
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
        <p key={idx} className="text-[11px] text-slate-400 leading-relaxed mb-0.5 font-light">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Search and Filters and Actions panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          {/* Search bar inputs */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search account name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-slate-900/50 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 focus:outline-none focus:border-indigo-600 transition duration-200"
            />
          </div>

          {/* Risk Dropdown */}
          <select
            value={risk}
            onChange={handleRiskChange}
            className="bg-slate-900/50 text-slate-300 px-4 py-2 rounded-xl border border-slate-800/80 focus:outline-none focus:border-indigo-600 transition duration-200"
          >
            <option value="all">All Risk Classes</option>
            <option value="High">High Churn Risks</option>
            <option value="Medium">Medium Churn Risks</option>
            <option value="Low">Low Churn Risks</option>
          </select>

        </div>

        <button
          onClick={handleExportCSV}
          disabled={predictions.length === 0}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 text-slate-200 flex items-center justify-center gap-1.5 transition duration-200 border border-slate-700 font-mono font-medium cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table Datatable listings (Col 7 or width adjustment) */}
        <div className={`${selectedItem ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/60 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-sans tracking-wide">
                  <th className="p-4 font-semibold">Account / Client</th>
                  <th className="p-4 font-semibold">Risk Probability</th>
                  <th className="p-4 font-semibold">Tenure</th>
                  <th className="p-4 font-semibold">Usage</th>
                  <th className="p-4 font-semibold text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                      <span className="text-slate-400 text-xs">Pulling index rows...</span>
                    </td>
                  </tr>
                )}

                {!loading && predictions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                      No customer evaluation entries found match your filter.
                    </td>
                  </tr>
                )}

                {!loading &&
                  predictions.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedItem(p)}
                      className={`hover:bg-slate-800/15 cursor-pointer transition duration-150 ${selectedItem?.id === p.id ? "bg-indigo-500/5" : ""}`}
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-display font-semibold text-slate-200 max-w-[170px] truncate">{p.customerName}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]">{p.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              p.riskCategory === "High"
                                ? "bg-red-500"
                                : p.riskCategory === "Medium"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="font-mono font-semibold text-slate-200">{p.churnProbability}%</span>
                          <span className="text-[10px] text-slate-400 font-sans">({p.riskCategory})</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{p.features.tenure} mo</td>
                      <td className="p-4 font-mono text-slate-300">{p.features.usageFrequency}%</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedItem(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition text-slate-400 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(p.id, e)}
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-750 hover:bg-red-950/20 hover:text-red-400 transition text-slate-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
              <span className="text-slate-400 text-xs font-mono">
                Page <strong className="text-indigo-400 font-bold">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 bg-slate-800 border border-slate-700/80 rounded-lg hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 bg-slate-800 border border-slate-700/80 rounded-lg hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed flyout folder section (Col 5) */}
        {selectedItem && (
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5 relative max-h-[640px] overflow-y-auto scrollbar-thin">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 cursor-pointer text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-550 font-mono tracking-wider">INDEX ID: {selectedItem.id}</span>
              <h3 className="text-base font-display font-semibold text-white truncate max-w-[220px]">{selectedItem.customerName}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{selectedItem.email}</p>
            </div>

            {/* Basic Stats row */}
            <div className="grid grid-cols-2 gap-4 border-y border-slate-800/40 py-4 font-mono text-[11px]">
              <div className="space-y-1.5">
                <div className="text-slate-500">Tenure Duration</div>
                <div className="font-semibold text-slate-200">{selectedItem.features.tenure} Months</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-slate-500">Monthly Billing</div>
                <div className="font-semibold text-slate-200">${selectedItem.features.monthlyCharges} /mo</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-slate-500">Complaints Tickets</div>
                <div className="font-semibold text-slate-200">{selectedItem.features.supportTickets} Opened</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-slate-500">Monthly Usage</div>
                <div className="font-semibold text-indigo-400">{selectedItem.features.usageFrequency}% Density</div>
              </div>
            </div>

            {/* Risk indicators */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans font-medium">Model Risk Assessment</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider font-mono ${
                    selectedItem.riskCategory === "High"
                      ? "bg-red-500/10 text-red-400"
                      : selectedItem.riskCategory === "Medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {selectedItem.riskCategory} ({selectedItem.churnProbability}%)
                </span>
              </div>

              {/* Drivers tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedItem.topDrivers.map((drv, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-950/80 border border-slate-900 rounded-lg text-[10px] text-slate-300 font-sans flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{drv}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* CRM Tactics */}
            <div className="rounded-xl border border-indigo-500/10 bg-slate-900/20 overflow-hidden">
              <div className="bg-indigo-500/5 px-4 py-2 border-b border-indigo-500/10 text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-semibold text-[10px] uppercase tracking-wide">AI Recommendation Insights Plan</span>
              </div>
              <div className="p-4 max-h-[220px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-indigo">
                {renderMarkdown(selectedItem.aiRecommendations)}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
