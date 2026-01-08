'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LawyerClassification {
  practiceArea: string;
  urgency: 'low' | 'medium' | 'high';
  budgetSensitivity: 'low' | 'medium' | 'high';
  locationHint: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm here to help you find the right lawyer for your legal needs in Lagos. 

Please describe your legal situation in your own words. For example: "I need help with employment law" or "I'm involved in a property dispute."

Note: I'm not a lawyer and cannot provide legal advice. I'm here to match you with appropriate attorneys.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState<LawyerClassification | null>(null);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Call AI classification API
      const response = await fetch('/api/classify-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userMessage, conversationHistory: messages }),
      });

      const data = await response.json();

      if (data.classification) {
        setClassification(data.classification);
      }

      // Add assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-khand)] mb-4">
            Find Your Attorney
          </h1>
          <p className="text-lg text-black/70 font-[family-name:var(--font-inter)] max-w-2xl mx-auto">
            AI-powered recommendations to connect you with the right lawyer for your legal needs in Lagos.
          </p>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="border border-black/20 rounded-lg bg-white shadow-sm">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-6 bg-white">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg font-[family-name:var(--font-inter)] text-sm leading-relaxed font-semibold ${
                      msg.role === 'user'
                        ? 'bg-gray-200 text-black border border-black/20'
                        : 'bg-gray-100 text-black border border-black/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-black border border-black/10 px-4 py-3 rounded-lg">
                    <span className="inline-block animate-pulse">●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-black/10 p-6 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                placeholder="Describe your legal situation..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg font-[family-name:var(--font-inter)] focus:outline-none focus:border-black/50 disabled:bg-gray-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-[family-name:var(--font-inter)] font-bold hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                Send
              </button>
            </div>
          </div>

          {/* Classification Result */}
          {classification && (
            <div className="mt-8 p-6 border-2 border-red-600 rounded-lg bg-red-50">
              <h3 className="text-lg font-bold font-[family-name:var(--font-khand)] mb-4">
                Based on your input:
              </h3>
              <div className="space-y-3 font-[family-name:var(--font-inter)] text-sm">
                <p>
                  <strong>Practice Area:</strong> {classification.practiceArea}
                </p>
                <p>
                  <strong>Urgency:</strong> {classification.urgency.charAt(0).toUpperCase() + classification.urgency.slice(1)}
                </p>
                <p>
                  <strong>Budget Sensitivity:</strong> {classification.budgetSensitivity.charAt(0).toUpperCase() + classification.budgetSensitivity.slice(1)}
                </p>
                <button
                  onClick={() => setShowNewsletter(true)}
                  className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Get Recommendations
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      {!showNewsletter && (
        <section className="px-6 py-20 bg-black/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-khand)] mb-4">
              Stay Updated
            </h2>
            <p className="text-black/70 font-[family-name:var(--font-inter)] mb-8">
              Get updates about new lawyers and features as we grow in Lagos.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowNewsletter(true);
              }}
              className="flex gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-black/20 rounded-lg font-[family-name:var(--font-inter)] focus:outline-none focus:border-black/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-[family-name:var(--font-inter)] font-bold hover:bg-red-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}

      {showNewsletter && (
        <section className="px-6 py-20 bg-black/5">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
              Thank You!
            </h2>
            <p className="text-black/70 font-[family-name:var(--font-inter)]">
              You're subscribed to updates. We'll notify you soon with lawyer recommendations based on your needs.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
