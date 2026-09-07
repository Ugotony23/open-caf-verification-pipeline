import { GoogleGenAI, Type } from '@google/genai';

export interface EvidenceAssessment {
  status: 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
  confidence: number;
  reasoning: string;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ['ACHIEVED', 'PARTIALLY_ACHIEVED', 'NOT_ACHIEVED'],
    },
    confidence: { type: Type.NUMBER },
    reasoning: { type: Type.STRING },
  },
  required: ['status', 'confidence', 'reasoning'],
};

function isTransientError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /"code":\s*503|"status":\s*"UNAVAILABLE"|"code":\s*429|"status":\s*"RESOURCE_EXHAUSTED"/.test(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function assessEvidenceAgainstIgp(
  evidenceContent: string,
  igpStatement: string,
  outcomeName: string,
): Promise<EvidenceAssessment> {
  const ai = getClient();

  const prompt = `You are a cyber security compliance auditor assessing organizational evidence
against the NCSC Cyber Assessment Framework (CAF).

Contributing Outcome: ${outcomeName}
Indicator of Good Practice: ${igpStatement}

Evidence submitted by the organization:
"""
${evidenceContent}
"""

Assess whether the evidence demonstrates that the Indicator of Good Practice is met.
Return a status of ACHIEVED, PARTIALLY_ACHIEVED, or NOT_ACHIEVED, a confidence score
between 0 and 1, and a short reasoning explaining the assessment.`;

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini API returned an empty response.');
      }

      const parsed = JSON.parse(text);
      return {
        status: parsed.status,
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence))),
        reasoning: parsed.reasoning,
      };
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isTransientError(err)) {
        await sleep(attempt * 1500); // 1.5s, then 3s
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
