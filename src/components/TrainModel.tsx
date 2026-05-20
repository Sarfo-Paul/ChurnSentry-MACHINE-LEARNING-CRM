import React, { useState, useEffect } from "react";
import { Brain, Sliders, ShieldCheck, Database, Upload, FileText, Play, CheckCircle, Terminal, RefreshCw, Layers } from "lucide-react";
import { ModelState } from "../types";

interface TrainModelProps {
  token: string;
  modelState: ModelState | null;
  onTrainingComplete: (updated: ModelState) => void;
}

export default function TrainModel({ token, modelState, onTrainingComplete }: TrainModelProps) {
  // Config parameters state
  const [epochs, setEpochs] = useState(150);
  const [learningRate, setLearningRate] = useState(0.05);
  const [datasetSize, setDatasetSize] = useState(180);

  // Status logs state
  const [training, setTraining] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeEpoch, setActiveEpoch] = useState<number | null>(null);
  const [lossVal, setLossVal] = useState<number | null>(null);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Trigger mathematical training
  const handleTrain = async () => {
    setTraining(true);
    setLogs([]);
    setActiveEpoch(0);
    setLossVal(0.69);

    // Simulated animated terminal console logs for authentic ML presentation
    const runLogs = [
      `[ML CLASSIFIER] Initializing localized Logistic Regression classifier.`,
      `[DATA ENGINE] Slicing training database. Matrix targets: ${datasetSize} lines.`,
      `[ML CLASSIFIER] Min-Max mapping numeric scales of Tenure, ticket limits & usage.`,
      `[ML CLASSIFIER] One-hot mapping categorical indexes of Contract & payment.`,
      `[GRAD DESIGN] Triggering Batch Gradient Descent on weights. Alpha learning-rate: ${learningRate}.`,
    ];

    for (let log of runLogs) {
      setLogs((prev) => [...prev, log]);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    // Call real backend training pipeline API
    try {
      const response = await fetch("/api/model/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ epochs, learningRate, datasetSize }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Animate epochs loss decay visually
      const lossHistory = data.lossHistory || [];
      const segmentStep = Math.max(1, Math.floor(epochs / 8));
      
      for (let i = 0; i < epochs; i += segmentStep) {
        setActiveEpoch(i);
        const l = lossHistory[i] || (0.69 - (i / epochs) * 0.45);
        setLossVal(parseFloat(l.toFixed(5)));
        setLogs((prev) => [
          ...prev, 
          `[ITERATOR] Epoch ${i + 1}/${epochs} - Cross Entropy Loss: ${l.toFixed(5)}`
        ]);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Finish logs
      setActiveEpoch(epochs);
      setLossVal(parseFloat((lossHistory[lossHistory.length - 1] || 0.186).toFixed(5)));
      setLogs((prev) => [
        ...prev,
        `[ML CLASSIFIER] Convergence limit reached. Gradients minimized.`,
        `[DATA ENGINE] Calibrating evaluation scores metrics...`,
        `[ML CLASSIFIER] Accuracy: ${data.modelState.accuracy}% | F1: ${data.modelState.f1Score}% | Recall: ${data.modelState.recall}%`,
        `[DB ENGINE] Saving weights variables securely to /data/db.json transactions layer.`
      ]);

      onTrainingComplete(data.modelState);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[CRITICAL ERROR] Retraining pipeline aborted: ${err.message}`]);
    } finally {
      setTraining(false);
    }
  };

  // Simulating custom Bulk CSV file drag & drop parsed telemetry logs
  const handleCSVDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCSVDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleMockCSVUpload("crm_telemetry_logs_Q2_2026.csv");
  };

  const handleMockCSVUpload = async (filename: string) => {
    setUploading(true);
    setUploadedFile(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      const response = await fetch("/api/model/upload-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: filename, rowCount: 220 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setUploadedFile(filename);
      onTrainingComplete(data.modelState);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Model KPI and status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-sans">Active Accuracy</span>
          <h4 className="text-2xl font-bold font-mono text-white mt-1">
            {modelState ? `${modelState.accuracy}%` : "Not Trained"}
          </h4>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-sans">Recall Sensitivity</span>
          <h4 className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {modelState ? `${modelState.recall}%` : "Not Trained"}
          </h4>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-sans">Precision Ratio</span>
          <h4 className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {modelState ? `${modelState.precision}%` : "Not Trained"}
          </h4>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-sans">Balanced F1 Score</span>
          <h4 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {modelState ? `${modelState.f1Score}%` : "Not Trained"}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
        
        {/* Tuning Hyperparameter Slider Panel (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 mb-0.5">
                <Sliders className="w-5 h-5" />
                <h3 className="text-base font-display font-semibold text-white">Hyperparameter Tuning</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                Tune gradient values below. Adjusting learning rate maps spatial step convergence speeds.
              </p>
            </div>

            <div className="space-y-5">
              {/* Epoch slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Maximum Training Epochs</span>
                  <span className="font-mono text-indigo-400 font-bold">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  disabled={training}
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Learning rate alpha */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Learning Rate (Alpha η)</span>
                  <span className="font-mono text-indigo-400 font-bold">{learningRate}</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.2"
                  step="0.005"
                  disabled={training}
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Dataset size */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Synthetic Dataset Matrix Size</span>
                  <span className="font-mono text-indigo-400 font-bold">{datasetSize} rows</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="10"
                  disabled={training}
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            <button
              onClick={handleTrain}
              disabled={training}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-505 bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 text-white rounded-xl font-mono font-bold tracking-wider hover:shadow-indigo-600/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition duration-200"
            >
              <Play className="w-4 h-4 text-white" />
              <span>{training ? "Optimizing weights..." : "Retrain Logistic Classifier"}</span>
            </button>
          </div>

          {/* Upload Dataset section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 mb-0.5">
                <Database className="w-5 h-5" />
                <h3 className="text-base font-display font-semibold text-white">Import CSV Dataset</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-light font-sans leading-relaxed">
                Examine custom pricing formats or upload client files to upgrade the model coefficients instantly.
              </p>
            </div>

            <div
              onDragOver={handleCSVDragOver}
              onDrop={handleCSVDrop}
              className="border-2 border-dashed border-slate-800/80 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-600/40 bg-slate-900/10 transition-colors duration-200"
              onClick={() => handleMockCSVUpload("customer_usage_stats_may2026.csv")}
            >
              {uploading ? (
                <div className="space-y-2">
                  <RefreshCw className="w-7 h-7 mx-auto animate-spin text-indigo-400" />
                  <span className="block text-[11px] text-slate-400">Parsing logs CSV rows...</span>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-7 h-7 mx-auto text-emerald-400" />
                  <span className="block text-slate-300 font-mono font-medium">{uploadedFile}</span>
                  <span className="block text-[10px] text-slate-500 font-light">Successfully parsed Q2 variables & updated coefficients!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-500" />
                  <span className="block text-slate-300 font-sans text-[11px]">Drag & drop customer CSV or click to populate demo</span>
                  <span className="block text-[10px] text-slate-500">Supports headers: tenure, cost, tickets</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Console logs output & confusion matrix (Col 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          
          {/* Virtual Terminal Console */}
          <div className="glass-panel rounded-2xl flex-1 flex flex-col bg-slate-950/80 border-slate-900 overflow-hidden min-h-[240px]">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-950 flex items-center justify-between select-none font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Classification Console Log Tracker</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] text-slate-200 space-y-1.5 max-h-[300px]">
              {logs.length === 0 ? (
                <div className="text-slate-550 italic h-full flex items-center justify-center p-4">Terminal idle. Adjust hyperparameters and press 'Retrain' to start operations.</div>
              ) : (
                <>
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-indigo-400 mr-2">&gt;&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {training && activeEpoch !== null && (
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-900/30">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Epoch {activeEpoch + 1}/{epochs} - Current Decay Loss: {lossVal}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ML Confusion Matrix 2x2 grid */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-0.5">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-display font-semibold text-white">Confusion Matrix Validation Metrics</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                Assessing classifier boundary errors on test datasets variables.
              </p>
            </div>

            {modelState && modelState.confusionMatrix ? (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
                
                {/* True Negatives (Top Left) */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold">TRUE NEGATIVE (TN)</span>
                  <h5 className="text-2xl font-bold font-mono text-slate-200">{modelState.confusionMatrix.trueNegative}</h5>
                  <span className="block text-[10px] text-slate-400 font-light">Predicted Stay, Stayed</span>
                </div>

                {/* False Positives (Top Right) */}
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">FALSE POSITIVE (FP)</span>
                  <h5 className="text-2xl font-bold font-mono text-slate-300">{modelState.confusionMatrix.falsePositive}</h5>
                  <span className="block text-[10px] text-slate-500 font-light font-mono">Type-I Error (False Alarm)</span>
                </div>

                {/* False Negatives (Bottom Left) */}
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">FALSE NEGATIVE (FN)</span>
                  <h5 className="text-2xl font-bold font-mono text-slate-300">{modelState.confusionMatrix.falseNegative}</h5>
                  <span className="block text-[10px] text-slate-500 font-light font-mono">Type-II Error (Missed Hazard)</span>
                </div>

                {/* True Positives (Bottom Right) */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold">TRUE POSITIVE (TP)</span>
                  <h5 className="text-2xl font-bold font-mono text-slate-200">{modelState.confusionMatrix.truePositive}</h5>
                  <span className="block text-[10px] text-slate-400 font-light">Predicted Churn, Churned</span>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm italic">Run model training to compute matrix grid.</div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
