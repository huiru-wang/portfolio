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
  return s;
};

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