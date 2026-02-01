
export type Language = 'en' | 'zh';

export interface Project {
  id: string;
  title: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  techStack: string[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description?: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Markdown file structure simulation
export interface MarkdownFile {
  filename: string;
  content: string;
}

export interface UIContent {
  personalInfo: {
    name: string;
    title: string;
    summary: string;
    email: string;
    phone: string;
    website: string;
  };
  ui: {
    nav: {
      about: string;
      projects: string;
      experience: string;
      skills: string;
    };
    hero: {
      hello: string;
      im: string;
      name: string;
      contact: string;
      blog: string;
      terminal_title: string;
      role_label: string;
      stack_label: string;
      status_label: string;
      open_to_connect: string;
    };
    sections: {
      projects_title: string;
      projects_desc: string;
      experience_title: string;
      skills_title: string;
      education_title: string;
      education_footer: string;
    };
    chat: {
      greeting: string;
      button_label: string;
      placeholder: string;
      thinking: string;
      disclaimer: string;
      powered_by: string;
    };
  };
  experiences: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  education: { school: string; degree: string; period: string; }[];
}
