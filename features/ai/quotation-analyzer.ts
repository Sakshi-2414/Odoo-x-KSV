import { ai, MODEL_NAME, withRetry } from '../../lib/gemini';
import { Type, Schema } from '@google/genai';

export interface RFQContext {
  title: string;
  budget: number | null;
  deadline: string;
  items: any[];
}

export interface QuotationData {
  id: string;
  vendor_id: string;
  vendor_name: string;
  trust_score: number;
  total_amount: number;
  unit_price: number | null;
  delivery_days: number | null;
  payment_terms: string | null;
  on_time_history?: number;
  attachments?: boolean;
}

const QuotationAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    best_price: {
      type: Type.OBJECT,
      properties: {
        vendor_id: { type: Type.STRING },
        vendor_name: { type: Type.STRING },
        total: { type: Type.NUMBER },
        savings_vs_budget: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
      },
      required: ['vendor_id', 'vendor_name', 'total', 'reasoning'],
    },
    fastest_delivery: {
      type: Type.OBJECT,
      properties: {
        vendor_id: { type: Type.STRING },
        vendor_name: { type: Type.STRING },
        delivery_days: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
      },
      required: ['vendor_id', 'vendor_name', 'delivery_days', 'reasoning'],
    },
    best_overall: {
      type: Type.OBJECT,
      properties: {
        vendor_id: { type: Type.STRING },
        vendor_name: { type: Type.STRING },
        score: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
      },
      required: ['vendor_id', 'vendor_name', 'score', 'reasoning'],
    },
    risk_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          vendor_id: { type: Type.STRING },
          flag: { type: Type.STRING },
          severity: { type: Type.STRING },
        },
        required: ['vendor_id', 'flag', 'severity'],
      },
    },
    market_context: { type: Type.STRING },
    recommendation: { type: Type.STRING },
  },
  required: ['best_price', 'fastest_delivery', 'best_overall', 'risk_flags', 'market_context', 'recommendation'],
};

export async function analyzeQuotations(rfq: RFQContext, quotations: QuotationData[]) {
  if (!quotations || quotations.length === 0) {
    throw new Error('No quotations provided for analysis');
  }

  const prompt = `
You are the AI Quotation Analyzer for VendorBridge AI.
Analyze the following RFQ and the submitted quotations.

RFQ Details:
${JSON.stringify(rfq, null, 2)}

Quotations:
${JSON.stringify(quotations, null, 2)}

Provide a comprehensive analysis including:
1. The vendor with the best price and their savings vs budget (if budget is available).
2. The vendor with the fastest delivery time.
3. The best overall vendor, considering a balance of price, delivery time, and the vendor's trust_score.
4. Any risk flags associated with these quotes (e.g., unexpectedly low trust_score, missing information, highly deviated prices).
5. A brief market context summary.
6. A final recommendation on who to award the contract to.

Respond strictly in the provided JSON schema format.
`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: QuotationAnalysisSchema,
      },
    }));

    const text = response.text();
    if (!text) {
      throw new Error('No response text from Gemini');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing quotations with Gemini:', error);
    throw error;
  }
}
