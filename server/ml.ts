import { ModelState, PredictorFeatures } from "./db";

// Helper function: Sigmoid function
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

// Generate premium mock dataset of customer behavior for model training
export interface TrainingRow {
  tenure: number;              // 1 to 72 months
  usageFrequency: number;     // 1 to 100 logins/month
  supportTickets: number;     // 0 to 10 tickets/month
  monthlyCharges: number;     // 20 to 300 USD
  contract_month_to_month: number;
  contract_one_year: number;
  contract_two_year: number;
  payment_electronic_check: number;
  payment_mailed_check: number;
  payment_bank_transfer: number;
  payment_credit_card: number;
  churn: number;               // 0 (stayed) or 1 (churned)
}

// Generate synthetically aligned customer data to make predictions realistic and teachable
export function generateSyntheticDataset(size: number = 150): TrainingRow[] {
  const dataset: TrainingRow[] = [];
  
  for (let i = 0; i < size; i++) {
    // Generate features
    const tenure = Math.floor(Math.random() * 60) + 1; // 1 to 60 months
    const usageFrequency = Math.floor(Math.random() * 95) + 5; // 5 to 100
    const supportTickets = Math.floor(Math.random() * 11); // 0 to 10
    const monthlyCharges = parseFloat((Math.random() * 200 + 19).toFixed(2)); // 19 to 219
    
    // Contract type choice
    const contractTypeRand = Math.random();
    let contract_month_to_month = 0;
    let contract_one_year = 0;
    let contract_two_year = 0;
    
    if (contractTypeRand < 0.6) {
      contract_month_to_month = 1;
    } else if (contractTypeRand < 0.85) {
      contract_one_year = 1;
    } else {
      contract_two_year = 1;
    }
    
    // Payment method choice
    const payRand = Math.random();
    let payment_electronic_check = 0;
    let payment_mailed_check = 0;
    let payment_bank_transfer = 0;
    let payment_credit_card = 0;
    
    if (payRand < 0.35) {
      payment_electronic_check = 1;
    } else if (payRand < 0.6) {
      payment_mailed_check = 1;
    } else if (payRand < 0.8) {
      payment_bank_transfer = 1;
    } else {
      payment_credit_card = 1;
    }
    
    // Determine target (churn) based on a realistic prob density logic
    // Tenure lowers churn, tickets increases churn, month_to_month contract increases churn
    let score = -0.6; // bias base
    score += (tenure < 6) ? 0.8 : -0.05 * tenure;
    score += (usageFrequency < 20) ? 0.6 : -0.015 * usageFrequency;
    score += 0.3 * supportTickets;
    score += 0.003 * monthlyCharges;
    score += 0.9 * contract_month_to_month;
    score -= 0.4 * contract_one_year;
    score -= 1.1 * contract_two_year;
    score += 0.5 * payment_electronic_check;
    score -= 0.2 * payment_credit_card;
    
    const churnProb = sigmoid(score);
    const churn = churnProb > 0.52 ? 1 : 0;
    
    dataset.push({
      tenure,
      usageFrequency,
      supportTickets,
      monthlyCharges,
      contract_month_to_month,
      contract_one_year,
      contract_two_year,
      payment_electronic_check,
      payment_mailed_check,
      payment_bank_transfer,
      payment_credit_card,
      churn,
    });
  }
  
  return dataset;
}

// Normalizer class to scale numeric features between (0, 1) using min-max mapping
const FEATURE_LIMITS = {
  tenure: { min: 1, max: 72 },
  usageFrequency: { min: 0, max: 100 },
  supportTickets: { min: 0, max: 15 },
  monthlyCharges: { min: 15, max: 500 },
};

function normalize(val: number, min: number, max: number): number {
  return (val - min) / (max - min || 1);
}

// Predict single customer churn risk from weights saved in current model state
export function runModelInference(features: PredictorFeatures, model: ModelState): {
  churnProbability: number;
  riskCategory: "High" | "Medium" | "Low";
  topDrivers: string[];
} {
  const w = model.weights;
  
  // Normalize and scale inputs exactly as training
  const normTenure = normalize(features.tenure, FEATURE_LIMITS.tenure.min, FEATURE_LIMITS.tenure.max);
  const normUsage = normalize(features.usageFrequency, FEATURE_LIMITS.usageFrequency.min, FEATURE_LIMITS.usageFrequency.max);
  const normTickets = normalize(features.supportTickets, FEATURE_LIMITS.supportTickets.min, FEATURE_LIMITS.supportTickets.max);
  const normCharges = normalize(features.monthlyCharges, FEATURE_LIMITS.monthlyCharges.min, FEATURE_LIMITS.monthlyCharges.max);
  
  let contract_month_to_month = 0;
  let contract_one_year = 0;
  let contract_two_year = 0;
  if (features.contractType === "month_to_month") contract_month_to_month = 1;
  else if (features.contractType === "one_year") contract_one_year = 1;
  else if (features.contractType === "two_year") contract_two_year = 1;
  
  let payment_electronic_check = 0;
  let payment_mailed_check = 0;
  let payment_bank_transfer = 0;
  let payment_credit_card = 0;
  if (features.paymentMethod === "electronic_check") payment_electronic_check = 1;
  else if (features.paymentMethod === "mailed_check") payment_mailed_check = 1;
  else if (features.paymentMethod === "bank_transfer") payment_bank_transfer = 1;
  else if (features.paymentMethod === "credit_card") payment_credit_card = 1;
  
  // Calculate decision boundary input value z
  let z = w.bias;
  z += normTenure * w.tenure;
  z += normUsage * w.usageFrequency;
  z += normTickets * w.supportTickets;
  z += normCharges * w.monthlyCharges;
  
  z += contract_month_to_month * w.contract_month_to_month;
  z += contract_one_year * w.contract_one_year;
  z += contract_two_year * w.contract_two_year;
  
  z += payment_electronic_check * w.payment_electronic_check;
  z += payment_mailed_check * w.payment_mailed_check;
  z += payment_bank_transfer * w.payment_bank_transfer;
  z += payment_credit_card * w.payment_credit_card;
  
  const prob = sigmoid(z);
  const churnProbability = parseFloat((prob * 100).toFixed(1));
  
  // Determine risk category
  let riskCategory: "High" | "Medium" | "Low" = "Low";
  if (churnProbability >= 70) riskCategory = "High";
  else if (churnProbability >= 35) riskCategory = "Medium";
  
  // Identify the top 2 reasons for are driving the decision mathematically
  const drivers: { name: string; score: number }[] = [];
  
  // Log factor strength mapping
  drivers.push({ name: "Short Customer Tenure", score: (1 - normTenure) * Math.abs(w.tenure) });
  drivers.push({ name: "Low Software Usage Frequency", score: (1 - normUsage) * Math.abs(w.usageFrequency) });
  drivers.push({ name: "High Support Tickets Volume", score: normTickets * w.supportTickets });
  drivers.push({ name: "High Monthly Premium Rate", score: normCharges * w.monthlyCharges });
  
  if (features.contractType === "month_to_month") {
    drivers.push({ name: "Flexible Month-to-month Contract Risk", score: 1.0 * w.contract_month_to_month });
  }
  if (features.paymentMethod === "electronic_check") {
    drivers.push({ name: "Uncommitted Payment Method (E-Check)", score: 1.0 * w.payment_electronic_check });
  }
  
  // Take top 2 drivers sorted descending
  const topDrivers = drivers
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(d => d.name);
    
  return {
    churnProbability,
    riskCategory,
    topDrivers,
  };
}

// Training engine executing dynamic Logistic Regression using gradient descent optimization
export function trainMLModel(
  dataset: TrainingRow[],
  learningRate: number = 0.05,
  epochs: number = 100
): {
  metrics: Omit<ModelState, "weights" | "hyperparams" | "isTrained">;
  weights: ModelState["weights"];
  lossHistory: number[];
} {
  // Initialize weights
  const weights = {
    bias: 0.1,
    tenure: -0.2,
    usageFrequency: -0.1,
    supportTickets: 0.3,
    monthlyCharges: 0.05,
    contract_month_to_month: 0.5,
    contract_one_year: -0.1,
    contract_two_year: -0.3,
    payment_electronic_check: 0.2,
    payment_mailed_check: 0.05,
    payment_bank_transfer: -0.1,
    payment_credit_card: -0.2,
  };

  const lossHistory: number[] = [];
  const N = dataset.length;
  
  // Normalize dataset for training stability
  const normalizedDataset = dataset.map(row => ({
    tenure: normalize(row.tenure, FEATURE_LIMITS.tenure.min, FEATURE_LIMITS.tenure.max),
    usageFrequency: normalize(row.usageFrequency, FEATURE_LIMITS.usageFrequency.min, FEATURE_LIMITS.usageFrequency.max),
    supportTickets: normalize(row.supportTickets, FEATURE_LIMITS.supportTickets.min, FEATURE_LIMITS.supportTickets.max),
    monthlyCharges: normalize(row.monthlyCharges, FEATURE_LIMITS.monthlyCharges.min, FEATURE_LIMITS.monthlyCharges.max),
    contract_month_to_month: row.contract_month_to_month,
    contract_one_year: row.contract_one_year,
    contract_two_year: row.contract_two_year,
    payment_electronic_check: row.payment_electronic_check,
    payment_mailed_check: row.payment_mailed_check,
    payment_bank_transfer: row.payment_bank_transfer,
    payment_credit_card: row.payment_credit_card,
    churn: row.churn,
  }));

  // Standard Batch Gradient Descent loop
  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    
    // Gradients
    let gBias = 0;
    let gTenure = 0;
    let gUsage = 0;
    let gTickets = 0;
    let gCharges = 0;
    let gContractMM = 0;
    let gContractOY = 0;
    let gContractTY = 0;
    let gPayEC = 0;
    let gPayMC = 0;
    let gPayBT = 0;
    let gPayCC = 0;

    for (const r of normalizedDataset) {
      // Linear summation
      let z = weights.bias;
      z += r.tenure * weights.tenure;
      z += r.usageFrequency * weights.usageFrequency;
      z += r.supportTickets * weights.supportTickets;
      z += r.monthlyCharges * weights.monthlyCharges;
      z += r.contract_month_to_month * weights.contract_month_to_month;
      z += r.contract_one_year * weights.contract_one_year;
      z += r.contract_two_year * weights.contract_two_year;
      z += r.payment_electronic_check * weights.payment_electronic_check;
      z += r.payment_mailed_check * weights.payment_mailed_check;
      z += r.payment_bank_transfer * weights.payment_bank_transfer;
      z += r.payment_credit_card * weights.payment_credit_card;
      
      const prob = sigmoid(z);
      const err = prob - r.churn; // (prediction - actual)
      
      // Accumulate gradients
      gBias += err;
      gTenure += err * r.tenure;
      gUsage += err * r.usageFrequency;
      gTickets += err * r.supportTickets;
      gCharges += err * r.monthlyCharges;
      gContractMM += err * r.contract_month_to_month;
      gContractOY += err * r.contract_one_year;
      gContractTY += err * r.contract_two_year;
      gPayEC += err * r.payment_electronic_check;
      gPayMC += err * r.payment_mailed_check;
      gPayBT += err * r.payment_bank_transfer;
      gPayCC += err * r.payment_credit_card;

      // Cross-Entropy Loss computation with standard epsilon bounds
      const logProb = Math.log(prob + 1e-15);
      const logOneMinusProb = Math.log(1 - prob + 1e-15);
      totalLoss += -(r.churn * logProb + (1 - r.churn) * logOneMinusProb);
    }

    lossHistory.push(totalLoss / N);

    // Apply Gradient Updates
    weights.bias -= (learningRate / N) * gBias;
    weights.tenure -= (learningRate / N) * gTenure;
    weights.usageFrequency -= (learningRate / N) * gUsage;
    weights.supportTickets -= (learningRate / N) * gTickets;
    weights.monthlyCharges -= (learningRate / N) * gCharges;
    weights.contract_month_to_month -= (learningRate / N) * gContractMM;
    weights.contract_one_year -= (learningRate / N) * gContractOY;
    weights.contract_two_year -= (learningRate / N) * gContractTY;
    weights.payment_electronic_check -= (learningRate / N) * gPayEC;
    weights.payment_mailed_check -= (learningRate / N) * gPayMC;
    weights.payment_bank_transfer -= (learningRate / N) * gPayBT;
    weights.payment_credit_card -= (learningRate / N) * gPayCC;
  }

  // Calculate ML evaluation criteria metrics (Accuracy, Precision, Recall, F1, Confusion Matrix)
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let truePositive = 0;

  for (const r of normalizedDataset) {
    let z = weights.bias;
    z += r.tenure * weights.tenure;
    z += r.usageFrequency * weights.usageFrequency;
    z += r.supportTickets * weights.supportTickets;
    z += r.monthlyCharges * weights.monthlyCharges;
    z += r.contract_month_to_month * weights.contract_month_to_month;
    z += r.contract_one_year * weights.contract_one_year;
    z += r.contract_two_year * weights.contract_two_year;
    z += r.payment_electronic_check * weights.payment_electronic_check;
    z += r.payment_mailed_check * weights.payment_mailed_check;
    z += r.payment_bank_transfer * weights.payment_bank_transfer;
    z += r.payment_credit_card * weights.payment_credit_card;
    
    const prob = sigmoid(z);
    const predIdx = prob >= 0.5 ? 1 : 0;
    
    if (r.churn === 0 && predIdx === 0) trueNegative++;
    else if (r.churn === 0 && predIdx === 1) falsePositive++;
    else if (r.churn === 1 && predIdx === 0) falseNegative++;
    else if (r.churn === 1 && predIdx === 1) truePositive++;
  }

  const accuracy = parseFloat((((trueNegative + truePositive) / N) * 100).toFixed(1));
  const precisionVal = truePositive + falsePositive ? (truePositive / (truePositive + falsePositive)) : 0;
  const precision = parseFloat((precisionVal * 100).toFixed(1));
  const recallVal = truePositive + falseNegative ? (truePositive / (truePositive + falseNegative)) : 0;
  const recall = parseFloat((recallVal * 100).toFixed(1));
  const f1Score = parseFloat((((2 * precision * recall) / (precision + recall || 1))).toFixed(1));

  return {
    metrics: {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: {
        trueNegative,
        falsePositive,
        falseNegative,
        truePositive,
      },
      trainedAt: new Date().toISOString(),
    },
    weights,
    lossHistory,
  };
}
