import OpenAI from 'openai';
import { personalInfo, experiencesZh, projectsZh, skills, educationZh } from './data';
import { ChatMessage } from './types';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

// Helper to extract frontmatter (simplified for this demo)
const parseFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2].trim()
    };
  }
  return { frontmatter: "", body: content };
};

/** 通义千问 OpenAI 兼容接口 Base URL（阿里云 DashScope） */
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const apiKey = await getDashscopeApiKey();
  if (!apiKey) {
    return "Error: DASHSCOPE_API_KEY is not set in the environment.";
  }
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  console.log("chat messages count:", messages.length, "lastUser:", lastUser?.content);

  const client = new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });

  const systemInstruction = await buildSystemInstruction(lastUser?.content || '');
  const functions = [
    {
      name: 'get_project_doc',
      description: 'Get full markdown (frontmatter + body) for a project by id',
      parameters: {
        type: 'object',
        properties: { project_id: { type: 'string' } },
        required: ['project_id'],
      },
    },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: 'qwen-plus',
      messages: buildOpenAIMessages(systemInstruction, messages),
      temperature: 0.7,
      // @ts-ignore
      functions,
      // @ts-ignore
      function_call: 'auto',
    });

    const msg: any = completion.choices[0]?.message;
    if (!msg) return "I couldn't generate a response.";

    const fc = msg.function_call;
    const toolCalls = msg.tool_calls;
    if (fc || (Array.isArray(toolCalls) && toolCalls.length > 0)) {
      const followupMessages: any[] = [
        ...buildOpenAIMessages(systemInstruction, messages),
        msg,
      ];
      if (fc) {
        const result = await runTool(fc.name, fc.arguments);
        followupMessages.push({ role: 'function', name: fc.name, content: result });
      } else {
        for (const tc of toolCalls) {
          const result = await runTool(tc.function?.name, tc.function?.arguments);
          followupMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
      }
      const final = await client.chat.completions.create({
        model: 'qwen-plus',
        messages: followupMessages,
        temperature: 0.7,
      });
      const finalContent = final.choices[0]?.message?.content;
      return finalContent?.trim() || "I couldn't generate a response.";
    }

    return msg.content?.trim() || "I couldn't generate a response.";
  } catch (error) {
    console.error("Qwen API Error:", error);
    return "Sorry, I am having trouble connecting to the AI service right now.";
  }
}

/** 构建与 generateAIResponse 相同的 system prompt，供流式调用复用 */
async function buildSystemInstruction(userMessage: string): Promise<string> {
  const resumeContext = `
    Basic Info: ${JSON.stringify(personalInfo)}
    Experience: ${JSON.stringify(experiencesZh)}
    Projects: ${JSON.stringify(projectsZh)}
    Skills: ${JSON.stringify(skills)}
    Education: ${JSON.stringify(educationZh)}
  `;
  let docContext = "";
  const lowerMsg = userMessage.toLowerCase();
  const docs = await readAllProjectDocs();
  docs.forEach(doc => {
    const { frontmatter, body } = parseFrontmatter(doc.content);
    const keywords = [
      'consistency', 'flink', 'kafka', 'roster', 'refactor', 'esign', 'signature', 'contract', 'java', 'huawei', 'dingtalk'
    ];
    const relevant = keywords.some(k => lowerMsg.includes(k) && (frontmatter.toLowerCase().includes(k) || body.toLowerCase().includes(k)));
    if (relevant) {
      docContext += `\n\n--- Project Basic Info (${doc.filename}) ---\nFrontmatter: ${frontmatter}\n`;
    }
  });
  return `
    You are an AI Assistant for Huiru Wang (Robin), chinese name: 王荟儒. 
    Your goal is to help visitors understand Huiru's professional background, skills, and technical expertise.
    
    RULES:
    1. STRICTLY limit your answers to the provided context (Resume and Project Docs). 
    2. If asked about something unrelated (e.g., "What is the capital of France?", "Write a poem"), politely refuse and steer back to Huiru's profile.
    3. Be professional but slightly conversational.
    4. When discussing projects, you may call the tool "get_project_doc" to retrieve full details by project_id when needed.
    5. Formatting: You can use simple lists or bold text, but keep it concise.

    CONTEXT:
    ${resumeContext}
    
    ${docContext ? `RELEVANT TECHNICAL DOCUMENTATION FOUND:${docContext}` : ""}
  `;
}

/** 流式生成回复，逐个 yield 内容片段 */
export async function* streamAIResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const apiKey = await getDashscopeApiKey();
  if (!apiKey) {
    yield "Error: DASHSCOPE_API_KEY is not set in the environment.";
    return;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });

  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const systemInstruction = await buildSystemInstruction(lastUser?.content || '');

  try {
    const first = await client.chat.completions.create({
      model: 'qwen-plus',
      messages: buildOpenAIMessages(systemInstruction, messages),
      temperature: 0.7,
      // @ts-ignore
      functions: [
        {
          name: 'get_project_doc',
          description: 'Get full markdown (frontmatter + body) for a project by id',
          parameters: {
            type: 'object',
            properties: { project_id: { type: 'string' } },
            required: ['project_id'],
          },
        },
      ],
      // @ts-ignore
      function_call: 'auto',
    });
    const msg: any = first.choices[0]?.message;
    const fc = msg?.function_call;
    const toolCalls = msg?.tool_calls;
    if (fc || (Array.isArray(toolCalls) && toolCalls.length > 0)) {
      const followupMessages: any[] = [
        ...buildOpenAIMessages(systemInstruction, messages),
        msg,
      ];
      if (fc) {
        const result = await runTool(fc.name, fc.arguments);
        followupMessages.push({ role: 'function', name: fc.name, content: result });
      } else {
        for (const tc of toolCalls) {
          const result = await runTool(tc.function?.name, tc.function?.arguments);
          followupMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
      }
      const stream = await client.chat.completions.create({
        model: 'qwen-plus',
        messages: followupMessages,
        temperature: 0.7,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (typeof delta === 'string' && delta) yield delta;
      }
    } else {
      const stream = await client.chat.completions.create({
        model: 'qwen-plus',
        messages: buildOpenAIMessages(systemInstruction, messages),
        temperature: 0.7,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (typeof delta === 'string' && delta) yield delta;
      }
    }
  } catch (error) {
    console.error("Qwen API Error:", error);
    yield "Sorry, I am having trouble connecting to the AI service right now.";
  }
}
let cachedKey: string | null | undefined = undefined;
async function getDashscopeApiKey(): Promise<string | null> {
  if (process.env.DASHSCOPE_API_KEY) return process.env.DASHSCOPE_API_KEY;
  if (cachedKey !== undefined) return cachedKey ?? null;
  try {
    const home = os.homedir();
    const zshrcPath = path.join(home, '.zshrc');
    const content = await fs.readFile(zshrcPath, 'utf8');
    const m = content.match(/(?:export\s+)?DASHSCOPE_API_KEY\s*=\s*['"]?([^'"\n#]+)['"]?/);
    if (m) {
      cachedKey = m[1].trim();
      return cachedKey;
    }
  } catch {}
  cachedKey = null;
  return null;
}

async function readAllProjectDocs(): Promise<{ filename: string; content: string }[]> {
  try {
    const dir = path.join(process.cwd(), 'projects');
    const files = await fs.readdir(dir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const docs = await Promise.all(mdFiles.map(async f => ({ filename: f.replace(/\.md$/, ''), content: await fs.readFile(path.join(dir, f), 'utf8') })));
    return docs;
  } catch {
    return [];
  }
}

async function runTool(name?: string, argsJson?: string): Promise<string> {
  try {
    if (name === 'get_project_doc') {
      const args = JSON.parse(argsJson || '{}');
      const id = String(args.project_id || '').trim();
      if (!id) return JSON.stringify({ error: 'project_id required' });
      const filePath = path.join(process.cwd(), 'projects', `${id}.md`);
      const content = await fs.readFile(filePath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(content);
      return JSON.stringify({ project_id: id, frontmatter, body });
    }
  } catch (e: any) {
    return JSON.stringify({ error: String(e?.message || e) });
  }
  return JSON.stringify({ error: 'unknown tool' });
}

function buildOpenAIMessages(systemInstruction: string, msgs: ChatMessage[]): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const history = msgs.slice(-5).map(m => ({ role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.content }));
  return [{ role: 'system', content: systemInstruction }, ...history];
}
