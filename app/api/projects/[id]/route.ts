import { NextResponse, NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

function parseTitleFromFrontmatter(content: string): string | undefined {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return undefined;
  const front = match[1];
  const titleMatch = front.match(/^title:\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

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
    const title = parseTitleFromFrontmatter(content);
    return NextResponse.json({ content, title: title ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}