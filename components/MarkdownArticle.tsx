import React, { useMemo, useState } from 'react';
import hljs from 'highlight.js';

interface MarkdownArticleProps {
  content: string;
}

const rewriteImageUrls = (md: string) => {
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const normalized = src.startsWith('http') || src.startsWith('/images/') ? src : `/images/${src.replace(/^\/?/, '')}`;
    return `![${alt}](${normalized})`;
  });
};

const markdownToHtml = (md: string) => {
  let s = rewriteImageUrls(md);
  s = s.replace(/^---\n([\s\S]*?)\n---\n/, '');
  s = s.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, raw) => {
    const code = String(raw).replace(/\n+$/, '');
    let html = '';
    try {
      if (lang && hljs.getLanguage(lang)) {
        html = hljs.highlight(code, { language: lang }).value;
      } else {
        html = hljs.highlightAuto(code).value;
      }
    } catch {
      html = code.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    return `<pre class=\"hljs border-2 border-black bg-white p-3 overflow-auto\"><code class=\"hljs\">${html}</code></pre>`;
  });
  s = s.replace(/^###\s?(.*)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
  s = s.replace(/^##\s?(.*)$/gm, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>');
  s = s.replace(/^#\s?(.*)$/gm, '<h1 class="text-3xl font-black mt-6 mb-4">$1</h1>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code class="inline-block font-mono text-xs bg-retro-bg border border-black px-1 py-0.5">${String(code).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="border-2 border-black shadow-retro my-4 max-w-full cursor-zoom-in" />');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="underline">$1</a>');
  const codeBlocks: string[] = [];
  s = s.replace(/<pre[\s\S]*?<\/pre>/g, (m) => {
    const idx = codeBlocks.push(m) - 1;
    return `__CODE_BLOCK_${idx}__`;
  });
  const parts = s.split(/\n{2,}/);
  let html = '';
  for (const part of parts) {
    const p = part.trim();
    if (p === '') continue;
    if (/^<\s*(h\d|pre|img|ul|ol|blockquote|table)/.test(p)) {
      html += p;
    } else if (isListBlock(p)) {
      html += listBlockToHtml(p);
    } else if (isTableBlock(p)) {
      html += tableBlockToHtml(p);
    } else {
      html += `<p class="mb-3">${p.replace(/\n/g, '<br/>')}</p>`;
    }
  }
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_m, i) => codeBlocks[Number(i)]);
  return html;
};

function isListBlock(block: string): boolean {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  return lines.every((line) => /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line));
}

function listBlockToHtml(block: string): string {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const isOrdered = lines.length > 0 && /^\s*\d+\.\s+/.test(lines[0]);
  const tag = isOrdered ? 'ol' : 'ul';
  const items = lines.map((line) => {
    const content = line.replace(/^\s*[-*]\s+/, '').replace(/^\s*\d+\.\s+/, '');
    return `<li class="mb-1">${content}</li>`;
  });
  return `<${tag} class="list-disc list-inside mb-3 ${isOrdered ? 'list-decimal' : ''}">${items.join('')}</${tag}>`;
}

function isTableBlock(block: string): boolean {
  const lines = block.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return false;
  const hasSeparator = lines.some((l) => /^\s*\|([\-:\s]+\|)+\s*$/.test(l.trim()));
  const hasPipes = lines.every((l) => l.includes('|'));
  return hasPipes && hasSeparator;
}

function tableBlockToHtml(block: string): string {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const separatorIndex = lines.findIndex((l) => /^\s*\|([\-:\s]+\|)+\s*$/.test(l));
  if (separatorIndex < 0) return `<p class="mb-3">${block.replace(/\n/g, '<br/>')}</p>`;
  const headerCells = parseTableRow(lines[0]);
  const bodyRows = lines.slice(separatorIndex + 1);
  let out = '<div class="overflow-x-auto mb-4"><table class="border-2 border-black w-full border-collapse">';
  out += '<thead><tr class="bg-retro-bg">';
  for (const cell of headerCells) {
    out += `<th class="border border-black px-3 py-2 text-left font-bold">${cell}</th>`;
  }
  out += '</tr></thead><tbody>';
  for (const row of bodyRows) {
    const cells = parseTableRow(row);
    if (cells.length === 0) continue;
    out += '<tr>';
    for (const cell of cells) {
      out += `<td class="border border-black px-3 py-2">${cell}</td>`;
    }
    out += '</tr>';
  }
  out += '</tbody></table></div>';
  return out;
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return [];
  const parts = trimmed.slice(1).split('|').map((p) => p.trim());
  return parts;
}

const MarkdownArticle: React.FC<MarkdownArticleProps> = ({ content }) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const html = useMemo(() => markdownToHtml(content), [content]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      const src = (target as HTMLImageElement).src;
      setPreviewSrc(src);
    }
  };

  return (
    <>
      <div className="p-6 prose max-w-none" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {previewSrc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewSrc(null)}>
          <img src={previewSrc} className="max-w-[90vw] max-h-[80vh] object-contain border-2 border-black bg-white shadow-[12px_12px_0px_0px_#000]" />
        </div>
      )}
    </>
  );
};

export default MarkdownArticle;