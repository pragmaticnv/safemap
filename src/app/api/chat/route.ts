import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function POST(request: Request) {
    try {
        const { message, history = [] } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!ENV.OPENAI_API_KEY) {
            return NextResponse.json({
                response: "I'm sorry, I'm currently in technical mode. My neural bridge isn't connected to the global intelligence network yet. Please provide a valid API key.",
                suggestedQuestions: ["How do I add an API key?", "What models are supported?"]
            });
        }

        // We will try DeepSeek direct first as per the key format, then fallback to OpenRouter logic if preferred.
        // The user specifically asked for "DeepSeek API" and "freemodel".
        // DeepSeek official API (api.deepseek.com) is very standard.

        const isOpenRouter = ENV.OPENAI_API_KEY.startsWith('sk-or-v1-');
        const baseUrl = isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.deepseek.com';
        const model = isOpenRouter ? 'gryphe/mythomax-l2-13b' : 'deepseek-chat';

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`,
                ...(isOpenRouter && {
                    'HTTP-Referer': 'https://safemap.ai',
                    'X-Title': 'SafeMap AI',
                })
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are SafeMap AI, a travel safety expert. Provide concise, data-driven safety advice.'
                    },
                    ...history,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const error = await response.json();
            const errorMsg = error.error?.message || JSON.stringify(error);
            return NextResponse.json({
                error: 'AI Provider Error',
                response: `Intelligence Link Error (${response.status}): ${errorMsg}. Please check if your API key is active and matches the provider.`
            }, { status: response.status });
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        return NextResponse.json({
            response: aiMessage,
            suggestedQuestions: ["Safest countries in Asia?", "Latest travel alerts?", "Weather safety tips"]
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({
            error: 'Failed to process chat message',
            response: "I encountered a slight turbulence in my processing. Please try again."
        }, { status: 500 });
    }
}
