import { NextResponse } from 'next/server';
import { streamAIResponse } from '@/lib/qwen';
import { ChatMessage } from '@/lib/types';

const encoder = new TextEncoder();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }
    const lastFive = messages.slice(-5);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamAIResponse(lastFive)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error('Stream Error:', err);
          controller.enqueue(encoder.encode('Sorry, something went wrong.'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
