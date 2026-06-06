import { ai, MODEL_NAME, withRetry } from '../../lib/gemini';
import { Type, Schema } from '@google/genai';

export interface CopilotContext {
  orgName: string;
  userName: string;
  userRole: string;
  date: string;
  stats: {
    activeRfqs: number;
    pendingApprovals: number;
    openPos: number;
  };
  dbSummary: any; // Simplified snapshot of current data context
}

const CopilotResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    action: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        data: { type: Type.OBJECT } // allow free-form data depending on action
      },
      nullable: true
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['message', 'suggestions'],
};

export async function processCopilotMessage(userMessage: string, context: CopilotContext, history: any[] = []) {
  const systemInstruction = `
You are VendorBridge AI, the procurement intelligence officer for ${context.orgName}.

Current user: ${context.userName} (${context.userRole})
Today: ${context.date}
Organization context:
- Active RFQs: ${context.stats.activeRfqs}
- Pending approvals: ${context.stats.pendingApprovals}
- Open POs: ${context.stats.openPos}

Database context (live):
${JSON.stringify(context.dbSummary, null, 2)}

You can perform these actions by returning an 'action' object in your JSON response:
- type: 'create_rfq', data: { title, budget, category, deadline }
- type: 'search_vendors', data: { category, min_trust_score }
- type: 'compare_quotes', data: { rfq_id }
- type: 'generate_report', data: { type, month }
- type: 'get_status', data: { entity_type, entity_id }
- type: 'send_alert', data: { message, severity }

Always respond conversationally in the 'message' field, then include 'action' JSON if an action is needed, and provide 2-3 helpful 'suggestions' for follow-up questions.
`;

  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I am VendorBridge AI.' }] },
      ...formattedHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: CopilotResponseSchema,
      }
    }));

    const text = response.text();
    if (!text) throw new Error('No response from Gemini');

    return JSON.parse(text);

  } catch (error) {
    console.error('Error processing Copilot message:', error);
    throw error;
  }
}

