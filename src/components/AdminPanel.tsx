import { useState, useEffect } from "react";
import { Terminal, Shield, Trash2, Calendar, ClipboardList, Loader2, UserX, AlertCircle } from "lucide-react";
import { ActivityLog } from "../types";

interface AdminPanelProps {
  token: string;
  role: "admin" | "operator";
}

export default function AdminPanel({ token, role }: AdminPanelProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull logs from backend
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audit trails.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchLogs();
    }
  }, [role]);

  // Purge entire audit trail from DB
  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to completely purge the historical audit log trail? This action is irreversible.")) return;

    try {
      const response = await fetch("/api/admin/logs/clear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error);
      }

      setLogs([]);
    } catch (err: any) {
      alert(err.message || "Failed to clear logs.");
    }
  };

  if (role !== "admin") {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-10">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-display font-semibold text-slate-200">Security Access Restriction</h3>
          <p className="text-xs text-slate-400 font-light font-sans max-w-xs mx-auto">
            Your profile role is set to **Operator**. Operator accounts can run evaluations, export records, and tune model matrices, but audit logs are protected under Admin clearance levels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      
      {/* List logs header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-indigo-400">
          <Terminal className="w-5 h-5 animate-pulse" />
          <div className="space-y-0.5">
            <h3 className="text-base font-display font-semibold text-white">Security Auditing Trail</h3>
            <p className="text-[11px] text-slate-400 font-sans font-light">System records tracking admin retrains, logins and settings adjustments</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition cursor-pointer"
          >
            Refresh Timeline
          </button>
          
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="px-4 py-2 bg-red-950/10 hover:bg-red-950/20 text-red-400 border border-red-900/20 rounded-xl transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Logs</span>
          </button>
        </div>
      </div>

      {/* Logs stack display */}
      <div className="glass-panel rounded-2xl border border-slate-880/60 overflow-hidden divide-y divide-slate-800/40">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
            <span className="text-slate-400">Collecting log metrics...</span>
          </div>
        )}

        {!loading && logs.length === 0 && !error && (
          <div className="text-center py-12 text-slate-550 italic">
            Audit logging trail is completely empty. Action items will show up as operator tasks execute.
          </div>
        )}

        {error && (
          <div className="p-4 text-center bg-red-950/20 text-red-400 border-b border-red-500/25 font-mono">
            {error}
          </div>
        )}

        {!loading &&
          logs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-800/10 transition">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-505/10 bg-slate-800/85 border border-slate-700/60 font-mono font-semibold text-slate-100 text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">User: {log.userEmail}</span>
                </div>
                <p className="text-slate-300 font-sans text-xs font-light">{log.details}</p>
              </div>

              <div className="text-slate-500 font-mono text-[10px] flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}
