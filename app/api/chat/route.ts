import { NextResponse } from 'next/server';
import { streamAIResponse } from '@/lib/qwen';

const encoder = new TextEncoder();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamAIResponse(message)) {
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
