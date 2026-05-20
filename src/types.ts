export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "operator";
  settings: {
    notificationsEnabled: boolean;
    darkMode: boolean;
    autoInsightGeneration: boolean;
  };
}

export interface PredictorFeatures {
  customerName: string;
  email: string;
  tenure: number;
  usageFrequency: number;
  supportTickets: number;
  monthlyCharges: number;
  contractType: "month_to_month" | "one_year" | "two_year";
  paymentMethod: "electronic_check" | "mailed_check" | "bank_transfer" | "credit_card";
}

export interface PredictionResult {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  features: PredictorFeatures;
  churnProbability: number;
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
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  trainedAt: string | null;
  hyperparams: {
    epochs: number;
    learningRate: number;
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

export interface DashboardStats {
  totalPredictions: number;
  avgChurnProb: number;
  riskSegments: {
    high: number;
    medium: number;
    low: number;
  };
  revenueAtRisk: number;
  activeMonthlyRevenue: number;
  onboardingTenureAvg: number;
  stableTenureAvg: number;
  timelineData: {
    date: string;
    predictionsCount: number;
    avgRisk: number;
    highRiskCount: number;
  }[];
  modelDetails: {
    isTrained: boolean;
    accuracy: number;
    trainedAt: string | null;
  };
}

export interface ApiDoc {
  method: string;
  path: string;
  desc: string;
}
