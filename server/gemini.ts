import { GoogleGenAI } from "@google/genai";
import { PredictorFeatures } from "./db";

let aiInstance: GoogleGenAI | null = null;

// Lazy initialization of the Gemini client to prevent server crash on starting if API key is not yet set
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 0) {
      try {
        aiInstance = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Gemini SDK initialization failed:", err);
      }
    }
  }
  return aiInstance;
}

// Fallback recommendations if Gemini is not configured or fails
function getStaticRetentionRecommendations(
  features: PredictorFeatures,
  churnProbability: number,
  riskCategory: "High" | "Medium" | "Low",
  topDrivers: string[]
): string {
  const customer = features.customerName;
  const tenure = features.tenure;
  const support = features.supportTickets;
  const usage = features.usageFrequency;

  if (riskCategory === "High") {
    return `Based on our machine learning algorithm, **${customer}** is at high risk (${churnProbability}%) of churning. The top risk parameters are: **${topDrivers.join(", ")}**.

### Recommended Action Items:
1. **Urgent Account Review:** Reach out to the client within 24 hours. Given they have logged **${support} support tickets** this month, there's likely a technical block or training frustration in progress.
2. **Onboarding / Coaching Reboot:** Offer a complimentary 1-on-1 account health review with a Customer Success Manager.
3. **Incentivize Term Commitment:** Transitioning the client from their current **${features.contractType.replace(/_/g, " ")}** plan to a term contract with financial incentive (e.g., 2 months free) will improve brand security.
4. **Engineering Escalation:** Verify if there are currently any unresolved bugs associated with their email profile (**${features.email}**).`;
  } else if (riskCategory === "Medium") {
    return `**${customer}** shows moderate risk (${churnProbability}%) of churning. The main parameters of warning are: **${topDrivers.join(", ")}**.

### Proactive Retention Plan:
1. **Regular Pulse Call:** Check in with their lead contact in the upcoming week.
2. **Feature Walkthrough:** Use support history to schedule a feature enablement demo. Usage is at **${usage}% density**, which indicates steady but incomplete engagement.
3. **Annual Plan Upgrade:** Propose an annual payment program to offset the monthly contract risk.`;
  } else {
    return `**${customer}** shows excellent account health. Current churn probability is very low (${churnProbability}%). Top factors keeping them stable are: **${topDrivers.join(", ")}**.

### Account Growth Recommendations:
1. **Advocacy Loop:** Invite their admin contact to the Product Beta Advisory Council.
2. **Case Study:** Request a standard customer testimonial highlighting their success.
3. **Review Seat Expansion:** With high tenure (**${tenure} months**), they are a prime candidate for seat upsells or premium modules expansions.`;
  }
}

// Main entrypoint to generate AI recommendations for retaining customers based on churn probabilities
export async function generateRetentionInsights(
  features: PredictorFeatures,
  churnProbability: number,
  riskCategory: "High" | "Medium" | "Low",
  topDrivers: string[]
): Promise<string> {
  const client = getGeminiClient();
  
  if (!client) {
    console.log("Gemini API key not configured. Using rule-based fallback retaining strategies.");
    return getStaticRetentionRecommendations(features, churnProbability, riskCategory, topDrivers);
  }

  const prompt = `
    You are an expert Chief Customer Officer and Senior Enterprise CRM Account Manager.
    A machine learning model has evaluated a client for churn risk.
    Analyze the customer details below and write a highly professional, actionable, structured list of retention and protective customer success strategies to save this customer.
    
    Customer Profile:
    - Customer Name: ${features.customerName}
    - Email Profile: ${features.email}
    - Customer Tenure: ${features.tenure} months
    - Monthly Product Usage Frequency: ${features.usageFrequency}%
    - Support Tickets Opened This Month: ${features.supportTickets}
    - Monthly Subscription License Cost: $${features.monthlyCharges}
    - Contract Framework: ${features.contractType}
    - Payment Setting: ${features.paymentMethod}
    
    Machine Learning Classification Score:
    - Calculated Churn Probability: ${churnProbability}%
    - Assigned Risk Segment: ${riskCategory}
    - Determined Key Drivers of Risk: ${topDrivers.join(", ")}
    
    Structure your response with clear headings (Markdown):
    1. Executive Summary of Risk Factors
    2. Tactical Intervention Checklist (Immediate actions within 48h)
    3. Structural Contract & Pricing Recommendations (Incentives, packages)
    4. Product Engagement & Success Playbook
    
    Keep the advice highly practical, actionable, specific to this customer's numbers, and beautifully formatted in markdown.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    if (response.text) {
      return response.text.trim();
    }
    return getStaticRetentionRecommendations(features, churnProbability, riskCategory, topDrivers);
  } catch (error) {
    console.error("Gemini AI API call failed. Falling back to rule-based recommendations:", error);
    return getStaticRetentionRecommendations(features, churnProbability, riskCategory, topDrivers);
  }
}
