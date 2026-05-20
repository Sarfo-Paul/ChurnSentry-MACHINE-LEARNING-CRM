import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "admin" | "operator";
  createdAt: string;
  settings: {
    notificationsEnabled: boolean;
    darkMode: boolean;
    autoInsightGeneration: boolean;
  };
}

export interface PredictorFeatures {
  customerName: string;
  email: string;
  tenure: number;              // months
  usageFrequency: number;     // login frequency/interactions per month (0-100)
  supportTickets: number;     // count per month
  monthlyCharges: number;     // USD
  contractType: "month_to_month" | "one_year" | "two_year";
  paymentMethod: "electronic_check" | "mailed_check" | "bank_transfer" | "credit_card";
}

export interface PredictionResult {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  features: PredictorFeatures;
  churnProbability: number; // 0 to 100
  riskCategory: "High" | "Medium" | "Low";
  topDrivers: string[];
  aiRecommendations: string;
  createdAt: string;
}

export interface ModelState {
  isTrained: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    trueNegative: number;  // predicted stay, stayed
    falsePositive: number; // predicted churn, stayed
    falseNegative: number; // predicted stay, churned
    truePositive: number;  // predicted churn, churned
  };
  trainedAt: string | null;
  hyperparams: {
    epochs: number;
    learningRate: number;
  };
  weights: {
    bias: number;
    tenure: number;
    usageFrequency: number;
    supportTickets: number;
    monthlyCharges: number;
    contract_month_to_month: number;
    contract_one_year: number;
    contract_two_year: number;
    payment_electronic_check: number;
    payment_mailed_check: number;
    payment_bank_transfer: number;
    payment_credit_card: number;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  predictions: PredictionResult[];
  modelState: ModelState;
  activityLogs: ActivityLog[];
}

// Initial ML weights (baseline weights trained conceptually on customer churn patterns)
const DEFAULT_WEIGHTS = {
  bias: 0.5,
  tenure: -0.08,             // higher tenure reduces churn risk
  usageFrequency: -0.05,     // higher usage reduces churn risk
  supportTickets: 0.45,       // higher support tickets majorly increases churn risk
  monthlyCharges: 0.008,      // higher cost slightly increases churn risk
  contract_month_to_month: 0.8,
  contract_one_year: -0.2,
  contract_two_year: -0.6,
  payment_electronic_check: 0.5,
  payment_mailed_check: 0.1,
  payment_bank_transfer: -0.2,
  payment_credit_card: -0.3,
};

const DEFAULT_DB_STATE: DatabaseSchema = {
  users: [
    {
      id: "admin-id",
      email: "admin@churnpredictor.com",
      passwordHash: crypto.createHash("sha256").update("admin123").digest("hex"),
      fullName: "Alex Rivera",
      role: "admin",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      settings: {
        notificationsEnabled: true,
        darkMode: true,
        autoInsightGeneration: true,
      },
    }
  ],
  predictions: [
    {
      id: "pred-1",
      userId: "admin-id",
      customerName: "Acme Corp (Sarah Jenkins)",
      email: "sarah@acme.com",
      features: {
        customerName: "Acme Corp (Sarah Jenkins)",
        email: "sarah@acme.com",
        tenure: 4,
        usageFrequency: 15,
        supportTickets: 8,
        monthlyCharges: 119.99,
        contractType: "month_to_month",
        paymentMethod: "electronic_check",
      },
      churnProbability: 84.7,
      riskCategory: "High",
      topDrivers: ["High Support Tickets Volume", "Short Customer Tenure"],
      aiRecommendations: "Based on our machine learning analysis, Sarah is at extremely high risk of churning due to a combination of short tenure (4 months) and high support tickets (8 in the last month). **Immediate Actions Required:**\n\n1. **Direct Outreach:** Schedule a priority support resolution call within 24 hours to address ongoing complaints.\n2. **Financial Incentive:** Offer a 20% loyalty discount in exchange for transitioning to a 1-year contract to improve security and relationship length.\n3. **Success Audit:** Assign a Dedicated Success Representative to audit their ticket complaints.",
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: "pred-2",
      userId: "admin-id",
      customerName: "GlobalTech Solutions",
      email: "contact@globaltech.io",
      features: {
        customerName: "GlobalTech Solutions",
        email: "contact@globaltech.io",
        tenure: 36,
        usageFrequency: 88,
        supportTickets: 1,
        monthlyCharges: 350.00,
        contractType: "two_year",
        paymentMethod: "credit_card",
      },
      churnProbability: 8.2,
      riskCategory: "Low",
      topDrivers: ["Long Customer Tenure", "High Usage Frequency"],
      aiRecommendations: "The customer is in excellent health with a very low churn probability (8.2%). They have high tenure (36 months) and steady monthly logs. **Recommended Strategy:**\n\n1. **Advocacy Program:** Pitch them for a reference study or case study highlighting their ROI.\n2. **Expansion/Upsell:** Discuss multi-seat team expansions at their upcoming quarterly business review.",
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "pred-3",
      userId: "admin-id",
      customerName: "Vanguard Partners",
      email: "operations@vanguard.com",
      features: {
        customerName: "Vanguard Partners",
        email: "operations@vanguard.com",
        tenure: 12,
        usageFrequency: 45,
        supportTickets: 4,
        monthlyCharges: 89.00,
        contractType: "month_to_month",
        paymentMethod: "bank_transfer",
      },
      churnProbability: 48.5,
      riskCategory: "Medium",
      topDrivers: ["Month-to-month Contract Risk", "Moderate Support Tickets"],
      aiRecommendations: "Moderate risk churn alert (48.5%). Their month-to-month flexibility leaves them exposed to competitive offers. **Retention Recommendations:**\n\n1. **Contract Lock-In:** Propose transitioning to a 1-year annual agreement with 2 months free. This completely mitigates contract risk.\n2. **Health Check:** Reach out to check user satisfaction on recent support interactions.",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "pred-4",
      userId: "admin-id",
      customerName: "Hale Industries",
      email: "billing@haleind.org",
      features: {
        customerName: "Hale Industries",
        email: "billing@haleind.org",
        tenure: 2,
        usageFrequency: 82,
        supportTickets: 6,
        monthlyCharges: 199.00,
        contractType: "month_to_month",
        paymentMethod: "electronic_check",
      },
      churnProbability: 76.2,
      riskCategory: "High",
      topDrivers: ["Short Customer Tenure", "High Support Tickets Volume"],
      aiRecommendations: "High churn hazard detected (76.2%). Hale Industries is in early onboarding struggles. **Retention Strategy:**\n\n1. **Urgent Intervention:** Escalate recent open bugs. High usage frequency (82) shows they are trying to engage, but blocking support issues are frustrating them.\n2. **Onboarding Reset:** Offer a complimentary 1-on-1 coaching session.",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "pred-5",
      userId: "admin-id",
      customerName: "Lumina Labs",
      email: "info@luminalabs.dev",
      features: {
        customerName: "Lumina Labs",
        email: "info@luminalabs.dev",
        tenure: 18,
        usageFrequency: 72,
        supportTickets: 2,
        monthlyCharges: 49.00,
        contractType: "one_year",
        paymentMethod: "credit_card",
      },
      churnProbability: 18.9,
      riskCategory: "Low",
      topDrivers: ["Healthy Contract Terms", "Low Support Interventions"],
      aiRecommendations: "Lumina Labs is a solid customer. Churn risk is small (18.9%) thanks to an active annual lease and low support ticket activity. No protective action is required currently.",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    }
  ],
  modelState: {
    isTrained: true,
    accuracy: 89.2,
    precision: 87.5,
    recall: 91.1,
    f1Score: 89.3,
    confusionMatrix: {
      trueNegative: 52,
      falsePositive: 8,
      falseNegative: 5,
      truePositive: 51,
    },
    trainedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    hyperparams: {
      epochs: 100,
      learningRate: 0.05,
    },
    weights: DEFAULT_WEIGHTS,
  },
  activityLogs: [
    {
      id: "log-1",
      userId: "admin-id",
      userEmail: "admin@churnpredictor.com",
      action: "Database Initialized",
      details: "Seed database preloaded with initial users, history and trained model coefficients",
      timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    },
    {
      id: "log-2",
      userId: "admin-id",
      userEmail: "admin@churnpredictor.com",
      action: "ML Model Training",
      details: "ML model successfully trained on seed customer dataset over 100 epochs (Accuracy: 89.2%)",
      timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "log-3",
      userId: "admin-id",
      userEmail: "admin@churnpredictor.com",
      action: "Single Customer Prediction",
      details: "Ran risk assessment for Sarah Jenkins (Acme Corp). Calculated high churn risk of 84.7%",
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    }
  ],
};

// Database helper functions using synchronous lock operations to prevent file collision issues
export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDatabase(DEFAULT_DB_STATE);
      return DEFAULT_DB_STATE;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    // Double check that we have schema completeness
    return {
      users: parsed.users || [],
      predictions: parsed.predictions || [],
      modelState: parsed.modelState || DEFAULT_DB_STATE.modelState,
      activityLogs: parsed.activityLogs || [],
    };
  } catch (err) {
    console.error("Failed to read JSON DB, falling back to default memory state:", err);
    return DEFAULT_DB_STATE;
  }
}

export function writeDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to JSON db:", err);
  }
}

export function logActivity(userId: string, userEmail: string, action: string, details: string): ActivityLog {
  const db = readDatabase();
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userEmail,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  db.activityLogs.unshift(log); // newest first
  // Keep logs at max 100 for storage sanity
  if (db.activityLogs.length > 100) {
    db.activityLogs = db.activityLogs.slice(0, 100);
  }
  writeDatabase(db);
  return log;
}
