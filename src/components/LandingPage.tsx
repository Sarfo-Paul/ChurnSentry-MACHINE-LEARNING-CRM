import { motion } from "motion/react";
import { ShieldCheck, Brain, TrendingUp, Cpu, Terminal, Users, Database } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      title: "Self-Training ML Engine",
      description: "Directly adjust hyperparameters, epochs, and learning rates to retrain your localized classification algorithms on-the-fly and deploy weights instantly.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: "Gemini Retention Advisor",
      description: "Deep client-telemetry prompts feed directly into Gemini Flash on our secure backend, formulating custom action items to preserve high-risk contracts.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Revenue At Risk Analytics",
      description: "Immediate granular KPI calculators map your exact subscription dollars exposed to churn probability bounds, split by high/medium/low cohorts.",
    },
    {
      icon: <Database className="w-6 h-6 text-blue-400" />,
      title: "Bulk CSV Integration",
      description: "Bulk upload telemetry logs CSV to analyze or retrain. Evaluates hundreds of subscriber seats instantly, generating downloadable audit reports.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-sky-400" />,
      title: "Secure Enterprise Controls",
      description: "Full audit tracking log trails and JWT SHA256-signed session managers protect account adjustments, ensuring full user action transparency.",
    },
    {
      icon: <Terminal className="w-6 h-6 text-amber-400" />,
      title: "Swagger-Style Rest APIs",
      description: "Full-stack developer-first design with a self-documenting JSON schemas layer, ready for automated external workflow integrations.",
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-10 px-4 md:px-8">
      {/* Hero Section */}
      <div className="max-w-5xl text-center space-y-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono select-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 indicator-pulse" />
          ENTERPRISE Churn Engine • VERSION 1.0.0 MVP
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold md:tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-100 to-indigo-300 leading-tight"
        >
          Predict Churn. <br />
          <span className="text-indigo-400">Preserve Revenue.</span> <br className="hidden md:block"/>
          Powered by Native Machine Learning.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto font-sans font-light"
        >
          SaaS Churn Predictor is a fully functional ML application. It runs statistical logistic boundary classifiers in real-time to locate accounts at risk, triggering Gemini-driven tactical intervention playbooks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-4 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 font-sans cursor-pointer text-center"
          >
            Launch Analyst Console
          </button>
          
          <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-300 font-mono text-sm max-w-xs mx-auto sm:mx-0">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Pass: <strong className="text-indigo-300 font-semibold">admin123</strong></span>
          </div>
        </motion.div>
      </div>

      {/* Grid Features */}
      <div className="max-w-6xl w-full pt-20 pb-10">
        <div className="text-center pb-12">
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white mb-2">
            Engineered with Startup-Quality Standard
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Our platform does not use mock visuals. It performs true gradient iterations and handles database persistence recursively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-panel p-6 rounded-2xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-505/5 hover:translate-y-[-2px]"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/40 mb-4 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-lg font-display font-medium text-slate-200 mb-2">
                {feat.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans font-light">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Portfolio Showcase Section */}
      <div className="w-full max-w-4xl py-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-950/20 via-indigo-900/10 to-transparent border border-indigo-950/40 text-center md:text-left md:flex md:items-center md:justify-between gap-6">
        <div>
          <h4 className="text-lg font-display font-medium text-indigo-300 mb-1">Portfolio & Recruiting Note</h4>
          <p className="text-slate-400 text-sm max-w-xl font-sans font-light">
            This workspace includes fully-documented models in TypeScript. Press the button above to log in automatically using the preloaded Administrator profile credentials.
          </p>
        </div>
        <button
          onClick={onGetStarted}
          className="mt-6 md:mt-0 px-6 py-3 bg-slate-800 hover:bg-slate-700/80 text-white rounded-lg border border-slate-700 font-sans text-sm font-medium whitespace-nowrap cursor-pointer"
        >
          Log in with Master Key
        </button>
      </div>

      {/* Developer Credit */}
      <div className="w-full text-center pt-12 pb-4">
        <p className="text-slate-600 text-xs font-mono tracking-wide">
          Built & designed with ❤️ by <span className="text-slate-400 font-medium">Paul Sarfo</span>
        </p>
      </div>
    </div>
  );
}
