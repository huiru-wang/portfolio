import { NextResponse, NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'projects', `${id}.md`);
    const content = await fs.readFile(filePath, 'utf8');
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}