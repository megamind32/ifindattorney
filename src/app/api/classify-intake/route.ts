import { NextRequest, NextResponse } from 'next/server';

// Check for required environment variables
function validateEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
}

interface ClassificationResult {
  practiceArea: string;
  urgency: 'low' | 'medium' | 'high';
  budgetSensitivity: 'low' | 'medium' | 'high';
  locationHint: string;
}

interface LLMResponse {
  response: string;
  classification?: ClassificationResult;
}

function fallbackClassification(userInput: string): LLMResponse {
  // Heuristic-based classification for when LLM is unavailable
  const lower = userInput.toLowerCase();

  // Determine practice area
  let practiceArea = 'General Legal Matter';
  if (lower.includes('employ') || lower.includes('fired') || lower.includes('laid off') || lower.includes('severance')) {
    practiceArea = 'Employment Law';
  } else if (lower.includes('divorce') || lower.includes('custody') || lower.includes('marriage') || lower.includes('child support')) {
    practiceArea = 'Family Law';
  } else if (lower.includes('property') || lower.includes('land') || lower.includes('house') || lower.includes('real estate') || lower.includes('lease')) {
    practiceArea = 'Property Law';
  } else if (lower.includes('company') || lower.includes('business') || lower.includes('corp') || lower.includes('formation')) {
    practiceArea = 'Corporate Law';
  } else if (lower.includes('contract') || lower.includes('commercial') || lower.includes('sale') || lower.includes('purchase')) {
    practiceArea = 'Commercial Law';
  } else if (lower.includes('dispute') || lower.includes('lawsuit') || lower.includes('court') || lower.includes('arbitration') || lower.includes('sue')) {
    practiceArea = 'Dispute Resolution';
  } else if (lower.includes('visa') || lower.includes('immigration') || lower.includes('residency') || lower.includes('green card')) {
    practiceArea = 'Immigration Law';
  } else if (lower.includes('trademark') || lower.includes('copyright') || lower.includes('patent') || lower.includes('intellectual')) {
    practiceArea = 'Intellectual Property';
  }

  // Determine urgency
  const isUrgent = lower.includes('urgent') || lower.includes('emergency') || lower.includes('immediate') || lower.includes('asap') || lower.includes('quickly');
  const urgency = isUrgent ? 'high' : 'medium';

  // Determine budget sensitivity
  const isBudgetSensitive = lower.includes('afford') || lower.includes('cheap') || lower.includes('free') || lower.includes('expensive') || lower.includes('budget');
  const budgetSensitivity = isBudgetSensitive ? 'high' : 'medium';

  // Extract location hint (basic parsing)
  const locationKeywords = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin', 'Ilorin', 'Jos', 'Calabar', 'Owerri'];
  let locationHint = 'Not specified';
  for (const location of locationKeywords) {
    if (lower.includes(location.toLowerCase())) {
      locationHint = location;
      break;
    }
  }

  return {
    response: `I understand you have a ${practiceArea.toLowerCase()} issue. Thank you for sharing the details. To help match you with the right lawyer, could you tell me your location or which state you're in?`,
    classification: {
      practiceArea,
      urgency,
      budgetSensitivity,
      locationHint,
    },
  };
}

async function callOpenAI(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an intake assistant for a lawyer recommendation platform in Nigeria. Your role is to:

1. Understand the user's legal problem through conversation
2. Ask clarifying questions if needed
3. Classify their problem into one of these practice areas: Employment Law, Family Law, Corporate Law, Property Law, Commercial Law, Dispute Resolution, Immigration Law, or Intellectual Property
4. Assess: Urgency (low/medium/high), Budget Sensitivity (low/medium/high), and their location

Guidelines:
- Be conversational, warm, and professional
- Never provide legal advice
- Clearly state you are not a lawyer and cannot provide legal counsel
- Ask ONE focused question at a time
- After 2-3 user messages, you should have enough info to classify
- When you have enough info, include a JSON block in your response

When ready to classify, end your response with this JSON block on its own line:

---CLASSIFICATION_START---
{
  "practiceArea": "one of: Employment Law, Family Law, Corporate Law, Property Law, Commercial Law, Dispute Resolution, Immigration Law, Intellectual Property",
  "urgency": "low or medium or high",
  "budgetSensitivity": "low or medium or high",
  "locationHint": "user's state or region if mentioned"
}
---CLASSIFICATION_END---

If not ready to classify, just respond with your question naturally. ALWAYS respond in English.`,
        },
        ...messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    // Return a fallback response instead of throwing
    console.warn('Falling back to heuristic classification due to API error');
    return fallbackClassification(messages[messages.length - 1]?.content || '');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Parse classification if present
  let classification: ClassificationResult | undefined;
  const classificationMatch = content.match(/---CLASSIFICATION_START---\n([\s\S]*?)\n---CLASSIFICATION_END---/);
  
  if (classificationMatch) {
    try {
      classification = JSON.parse(classificationMatch[1]);
    } catch (parseError) {
      console.error('Failed to parse classification JSON:', parseError);
    }
  }

  // Remove classification block from response
  const responseText = content
    .replace(/---CLASSIFICATION_START---[\s\S]*?---CLASSIFICATION_END---/g, '')
    .trim();

  return {
    response: responseText,
    classification,
  };
}

export async function POST(req: NextRequest) {
  try {
    validateEnv();

    const { userInput, conversationHistory } = await req.json();

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'userInput is required and must be a string' },
        { status: 400 }
      );
    }

    // Build conversation messages
    const messages = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userInput },
    ];

    // Call OpenAI API
    const result = await callOpenAI(messages);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Classification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('OPENAI_API_KEY') ? 500 : 500 }
    );
  }
}
