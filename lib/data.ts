
import { Experience, Project, SkillCategory, MarkdownFile, UIContent } from './types';

// ================= Resume Data (English - Default) =================

export const personalInfo = {
  name: "王荟儒 (Huiru Wang)",
  title: "Senior Backend Engineer",
  email: "huiru-wang@outlook.com",
  phone: "(+86) 15981944319",
  website: "robinverse.me",
  summary: "The developer has extensive experience in server-side development, including high-concurrency distributed systems and SaaS architecture design and development. They are currently learning and practicing large-scale model agent design and development."
};

export const experiences: Experience[] = [
  {
    company: "Alibaba - DingTalk",
    role: "Backend Dev",
    period: "2023.11 – Present"
  },
  {
    company: "Huawei - Cloud Eye",
    role: "SDE",
    period: "2022.12 – 2023.10"
  },
  {
    company: "Huawei - Trading Platform",
    role: "SDE",
    period: "2021.08 – 2022.12"
  }
];

export const projects: Project[] = [
  {
    id: "dingtalk-ai-training",
    title: "DingTalk Smart HR - AI Training Agent",
    company: "Alibaba - DingTalk (DingTalk)",
    role: "Project Lead",
    period: "2025.12 - 2026.02",
    summary: "Led design of a multi-Agent assistant for the training domain.",
    techStack: ["Agent", "LLM", "Java", "React"]
  },
  {
    id: "dingtalk-ai-recruiment",
    title: "DingTalk Smart HR - AI Recruitment",
    company: "Alibaba - DingTalk (DingTalk)",
    role: "Core Developer",
    period: "2025.07 - 2025.10",
    summary: "Implemented intelligent outbound calling and intent confirmation modules for AI Recruitment.",
    techStack: ["LLM", "Java", "RocketMQ", "MySQL", "Redis"]
  },
  {
    id: "dingtalk-roster",
    title: "DingTalk Smart HR - Roster Core Refactor",
    company: "Alibaba - DingTalk (DingTalk)",
    role: "Core Developer",
    period: "2024.11 - 2025.02",
    summary: "Refactored the core roster service using Template Method and Chain of Responsibility, improving performance and maintainability.",
    techStack: ["Design Patterns", "Performance Optimization", "Legacy Migration"]
  },
  {
    id: "dingtalk-esign",
    title: "DingTalk Smart HR - E-signature Platform",
    company: "Alibaba - DingTalk (DingTalk)",
    role: "Project Lead",
    period: "2024.03 - 2024.06",
    summary: "Designed and delivered a PLG-driven e-sign solution for HR SaaS, addressing multi-tenant architecture and full contract lifecycle management.",
    techStack: ["Java", "Distributed Systems", "SaaS"]
  },
  {
    id: "huawei-trade-fund-consistency",
    title: "Huawei Trading Platform - BCP",
    company: "Huawei - Cloud Services (Trading Platform)",
    role: "Developer",
    period: "2022.07 - 2022.12",
    summary: "Built a side-channel verification service handling 6M+ daily checks with Flink, Kafka, and Redis to ensure financial data integrity.",
    techStack: ["Java", "Flink", "Kafka", "Redis"]
  },
  {
    id: "huawei-trade-channel",
    title: "Huawei Trading Platform - Channel Integration",
    company: "Huawei - Cloud Services (Trading Platform)",
    role: "Developer",
    period: "2021.11 - 2022.06",
    summary: "Integrated trading channels including PayPal, Knet, and Adyen.",
    techStack: ["Java", "MySQL", "Kafka", "Redis"]
  }
];

export const skills: SkillCategory[] = [
  {
    name: "Distributed Systems",
    skills: ["Microservices", "System Stability", "SLA Management", "Java/Spring Ecosystem"]
  },
  {
    name: "Database & Storage",
    skills: ["MySQL (InnoDB, Tuning)", "Redis", "Distributed Locks"]
  },
  {
    name: "Middleware",
    skills: ["Kafka", "RocketMQ"]
  }
];

export const education = [
  {
    school: "Nanjing University of Science and Technology",
    degree: "Master in Control Engineering",
    period: "2018.09 – 2021.06"
  },
  {
    school: "Changchun University of Science and Technology",
    degree: "Bachelor in Electronic Info & Automation",
    period: "2014.09 – 2018.06"
  }
];

// ================= Chinese Data =================

export const personalInfoZh = {
  ...personalInfo,
  title: "资深后端开发工程师",
  summary: "拥有丰富经验的服务端开发者，有高并发分布式系统、SaaS架构设计开发经验，正在学习与实践大模型Agent设计与开发。"
};

export const experiencesZh: Experience[] = [
  {
    company: "阿里巴巴 - 钉钉 (DingTalk)",
    role: "后端开发",
    period: "2023.11 – 至今"
  },
  {
    company: "华为 - 云服务 (Cloud Eye)",
    role: "软件开发工程师",
    period: "2022.12 – 2023.10"
  },
  {
    company: "华为 - 云服务 (交易中台)",
    role: "软件开发工程师",
    period: "2021.08 – 2022.12"
  }
];

export const projectsZh: Project[] = [
  {
    id: "dingtalk-ai-training",
    title: "钉钉智能人事 - AI培训Agent",
    company: "阿里巴巴 - 钉钉 (DingTalk)",
    role: "项目负责人",
    period: "2025.12 - 2026.02",
    summary: "主导设计培训领域的多Agent助手",
    techStack: ["Agent", "LLM", "Java", "React"]
  },
  {
    id: "dingtalk-ai-recruiment",
    title: "钉钉智能人事 - AI招聘",
    company: "阿里巴巴 - 钉钉 (DingTalk)",
    role: "核心开发",
    period: "2025.07 - 2025.10",
    summary: "负责钉钉智能人事AI招聘产品中的智能外呼模块、意向确认模块的设计与实现",
    techStack: ["LLM", "Java", "RocketMQ", "MySQL", "Redis"]
  },
  {
    id: "dingtalk-roster",
    title: "钉钉智能人事 - 花名册服务重构",
    company: "阿里巴巴 - 钉钉 (DingTalk)",
    role: "核心开发",
    period: "2024.11 - 2025.02",
    summary: "重构员工花名册核心服务，运用模板方法与责任链模式，显著提升了系统性能与代码可维护性。",
    techStack: ["设计模式", "性能优化", "老系统迁移"]
  },
  {
    id: "dingtalk-esign",
    title: "钉钉智能人事 - 电子签",
    company: "阿里巴巴 - 钉钉 (DingTalk)",
    role: "项目负责人",
    period: "2024.03 - 2024.06",
    summary: "主导设计并落地 HR SaaS 领域 PLG 驱动的电子签解决方案，解决了多租户架构与合同全生命周期管理难题。",
    techStack: ["Java", "分布式系统", "SaaS"]
  },
  {
    id: "huawei-trade-fund-consistency",
    title: "华为交易中台 - 资金一致性核对",
    company: "华为 - 云服务 (交易中台)",
    role: "开发人员",
    period: "2022.07 - 2022.12",
    summary: "构建旁路核对服务，利用 Flink、Kafka 和 Redis 处理每日 600万+ 笔核对任务，保障资金数据完整性。",
    techStack: ["Java", "Flink", "Kafka", "Redis"]
  },
  {
    id: "huawei-trade-channel",
    title: "华为交易中台 - 交易渠道接入",
    company: "华为 - 云服务 (交易中台)",
    role: "开发人员",
    period: "2021.11 - 2022.06",
    summary: "华为中台交易渠道接入：PayPal、Knet、Adyen等",
    techStack: ["Java", "MySQL", "Kafka", "Redis"]
  }
];

export const skillsZh: SkillCategory[] = [
  {
    name: "分布式系统",
    skills: ["微服务架构", "系统稳定性", "Java/Spring 生态"]
  },
  {
    name: "数据库 & 存储",
    skills: ["MySQL (InnoDB, 调优)", "Redis", "分布式锁"]
  },
  {
    name: "中间件",
    skills: ["Kafka", "RocketMQ"]
  }
];

export const educationZh = [
  {
    school: "南京理工大学",
    degree: "硕士 - 控制工程",
    period: "2018.09 – 2021.06"
  },
  {
    school: "长春理工大学",
    degree: "学士 - 电子信息与自动化",
    period: "2014.09 – 2018.06"
  }
];

// ================= I18n Data Structure =================

export const i18nData: { en: UIContent; zh: UIContent } = {
  en: {
    personalInfo,
    experiences,
    projects,
    skills,
    education,
    ui: {
      nav: { about: "ABOUT", projects: "PROJECTS", experience: "EXPERIENCE", skills: "SKILLS" },
      hero: {
        hello: "HELLO.",
        im: "I'M",
        name: "ROBIN.",
        contact: "Contact Me",
        blog: "Blog",
        terminal_title: "TERMINAL - robin@server:~",
        role_label: "current_role",
        stack_label: "cat work_history.log",
        status_label: "status",
        open_to_connect: "OPEN_TO_CONNECT"
      },
      sections: {
        projects_title: "PROJECTS",
        projects_desc: "Ask the AI for technical details →",
        experience_title: "EXPERIENCE",
        skills_title: "SKILLSET",
        education_title: "Education",
        education_footer: "Designed with Neobrutalism."
      },
      chat: {
        greeting: "Hello! I am Huiru's AI Assistant. Ask me about his projects, skills, or experience at Alibaba and Huawei.",
        button_label: "AI CHAT",
        placeholder: "Ask about projects, stack...",
        thinking: "Thinking...",
        disclaimer: "AI uses strict RAG context from resume & docs.",
        powered_by: "Powered by Gemini"
      }
    }
  },
  zh: {
    personalInfo: personalInfoZh,
    experiences: experiencesZh,
    projects: projectsZh,
    skills: skillsZh,
    education: educationZh,
    ui: {
      nav: { about: "关于我", projects: "项目经历", experience: "工作经历", skills: "技能栈" },
      hero: {
        hello: "你好。",
        im: "我是",
        name: "王荟儒",
        contact: "联系我",
        blog: "博客",
        terminal_title: "终端 - robin@server:~",
        role_label: "当前职位",
        stack_label: "cat 工作经历.log",
        status_label: "当前状态",
        open_to_connect: "阿里巴巴在职"
      },
      sections: {
        projects_title: "项目经历",
        projects_desc: "咨询 AI 了解更多技术细节 →",
        experience_title: "工作经历",
        skills_title: "核心技能",
        education_title: "教育背景",
        education_footer: "Designed with Neobrutalism."
      },
      chat: {
        greeting: "你好！我是王荟儒的 AI 助手。你可以问我关于他的项目经验、项目细节、技术栈等问题。",
        button_label: "AI 助手",
        placeholder: "询问项目细节、技术栈...",
        thinking: "思考中...",
        disclaimer: "AI 基于简历和文档生成回答。",
        powered_by: "由 Qwen 驱动"
      }
    }
  }
};

