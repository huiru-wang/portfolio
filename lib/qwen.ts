import OpenAI from 'openai';
import { personalInfo, experiences, projects, skills, education, projectDocs } from './data';

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

export async function generateAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return "Error: DASHSCOPE_API_KEY is not set in the environment.";
  }

  const client = new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });

  const systemInstruction = buildSystemInstruction(userMessage);

  try {
    const completion = await client.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    return content?.trim() || "I couldn't generate a response.";
  } catch (error) {
    console.error("Qwen API Error:", error);
    return "Sorry, I am having trouble connecting to the AI service right now.";
  }
}

/** 构建与 generateAIResponse 相同的 system prompt，供流式调用复用 */
function buildSystemInstruction(userMessage: string): string {
  const resumeContext = `
    Basic Info: ${JSON.stringify(personalInfo)}
    Experience: ${JSON.stringify(experiences)}
    Projects: ${JSON.stringify(projects)}
    Skills: ${JSON.stringify(skills)}
    Education: ${JSON.stringify(education)}
  `;
  let docContext = "";
  const lowerMsg = userMessage.toLowerCase();
  projectDocs.forEach(doc => {
    const { frontmatter, body } = parseFrontmatter(doc.content);
    const keywords = [
      'consistency', 'flink', 'kafka', 'roster', 'refactor', 'esign', 'signature', 'contract', 'java', 'huawei', 'dingtalk'
    ];
    const relevant = keywords.some(k => lowerMsg.includes(k) && (frontmatter.toLowerCase().includes(k) || body.toLowerCase().includes(k)));
    if (relevant) {
      docContext += `\n\n--- Detailed Specs for ${doc.filename} ---\nMetadata: ${frontmatter}\nContent: ${body}\n`;
    }
  });
  return `
    You are an AI Assistant for Huiru Wang (Robin). 
    Your goal is to help visitors understand Huiru's professional background, skills, and technical expertise.
    
    RULES:
    1. STRICTLY limit your answers to the provided context (Resume and Project Docs). 
    2. If asked about something unrelated (e.g., "What is the capital of France?", "Write a poem"), politely refuse and steer back to Huiru's profile.
    3. Be professional but slightly conversational.
    4. When discussing projects, use the "Detailed Specs" if available to provide technical depth.
    5. Formatting: You can use simple lists or bold text, but keep it concise.

    CONTEXT:
    ${resumeContext}
    
    ${docContext ? `RELEVANT TECHNICAL DOCUMENTATION FOUND:${docContext}` : ""}
  `;
}

/** 流式生成回复，逐个 yield 内容片段 */
export async function* streamAIResponse(userMessage: string): AsyncGenerator<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    yield "Error: DASHSCOPE_API_KEY is not set in the environment.";
    return;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });

  const systemInstruction = buildSystemInstruction(userMessage);

  try {
    const stream = await client.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === 'string' && delta) {
        yield delta;
      }
    }
  } catch (error) {
    console.error("Qwen API Error:", error);
    yield "Sorry, I am having trouble connecting to the AI service right now.";
  }
}
