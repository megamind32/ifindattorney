import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userInput, conversationHistory } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: 'userInput is required' },
        { status: 400 }
      );
    }

    // Build conversation context for the LLM
    const systemPrompt = `You are an intake assistant for a lawyer recommendation platform in Lagos, Nigeria. Your role is to:

1. Understand the user's legal problem
2. Ask clarifying questions if needed
3. Classify their problem into:
   - Practice area (e.g., "Employment Law", "Family Law", "Corporate Law", "Property Law", "Dispute Resolution", "Immigration")
   - Urgency (low / medium / high)
   - Budget sensitivity (low / medium / high)
   - Location hints (which part of Lagos)

Guidelines:
- Be conversational and friendly
- Never provide legal advice
- Always clarify that you are not a lawyer
- Ask ONE question at a time
- After 2-3 exchanges, output a JSON classification when you have enough info

When you are ready to classify, output this JSON on a new line:
{
  "classification": {
    "practiceArea": "string",
    "urgency": "low|medium|high",
    "budgetSensitivity": "low|medium|high",
    "locationHint": "string"
  },
  "response": "string (your conversational response)"
}

Otherwise, just respond naturally with a follow-up question. ALWAYS respond in English.`;

    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userInput },
    ];

    // TODO: Replace with actual LLM call (OpenAI, Anthropic, or Gemini)
    // For now, return a mock classification after 1 user message
    let mockResponse = '';
    let mockClassification = null;

    if (messages.length <= 3) {
      // First or second user message
      if (userInput.toLowerCase().includes('employ')) {
        mockResponse =
          'I see you have an employment-related issue. Can you tell me if this is urgent? For example, are you currently being terminated, or is this a longer-term concern?';
      } else if (userInput.toLowerCase().includes('property') || userInput.toLowerCase().includes('land')) {
        mockResponse =
          'Property matters can be complex. Is this related to a purchase, dispute with a neighbor, or a lease issue? And how soon do you need resolution?';
      } else {
        mockResponse =
          'Thank you for sharing that. To better match you with the right lawyer, can you tell me roughly where in Lagos you are located?';
      }
    } else {
      // Third or later message - provide classification
      mockClassification = {
        practiceArea: userInput.toLowerCase().includes('employ')
          ? 'Employment Law'
          : userInput.toLowerCase().includes('property') || userInput.toLowerCase().includes('land')
            ? 'Property Law'
            : 'General Civil Law',
        urgency: userInput.toLowerCase().includes('urgent') ? 'high' : 'medium',
        budgetSensitivity: userInput.toLowerCase().includes('afford') ? 'high' : 'medium',
        locationHint: 'Lagos Island',
      };
      mockResponse = 'Based on what you\'ve shared, I can now recommend suitable lawyers. Let me connect you with attorneys who specialize in your area.';
    }

    return NextResponse.json({
      response: mockResponse,
      classification: mockClassification,
    });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
