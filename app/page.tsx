
'use client';

import React, { useState } from 'react';
import MarkdownArticle from '@/components/MarkdownArticle';
import { i18nData } from '@/lib/data';
import { Language } from '@/lib/types';
import RetroCard from '@/components/RetroCard';
import RetroButton from '@/components/RetroButton';
import ChatWidget from '@/components/ChatWidget';
import { Mail, Phone, ExternalLink, Globe } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('zh');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const content = i18nData[language];
  const { ui, projects, experiences, skills, education, personalInfo } = content;
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to get rotating colors for accents
  const getAccentColor = (index: number) => {
    const colors = ['bg-retro-yellow', 'bg-retro-purple', 'bg-retro-orange', 'bg-retro-green'];
    return colors[index % colors.length];
  };

  const getDecorationColor = (index: number) => {
     const colors = ['decoration-retro-yellow', 'decoration-retro-purple', 'decoration-retro-orange'];
     return colors[index % colors.length];
  }

  const [articleOpen, setArticleOpen] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  };


  const openArticle = async (id: string) => {
    setArticleId(id);
    setArticleTitle(null);
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setArticleContent(data.content || '');
      setArticleTitle(data.title ?? id);
      setArticleOpen(true);
    } catch (e) {
      setArticleContent('');
      setArticleTitle(id);
      setArticleOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-retro-bg font-sans selection:bg-retro-yellow selection:text-black pb-20">
      
      {/* Navigation / Header */}
      <nav className="border-b-2 border-black bg-white sticky top-0 z-30">
        <div className="retro-container h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter border-2 border-black bg-black text-white px-2 py-1 rotate-[-2deg] shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">
            HUIRU.WANG
          </div>
          <div className="flex gap-6 font-mono text-sm font-bold items-center">
            <div className="hidden md:flex gap-6">
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:bg-retro-yellow hover:px-1 transition-all cursor-pointer">{ui.nav.about}</a>
              <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className="hover:bg-retro-yellow hover:px-1 transition-all cursor-pointer">{ui.nav.projects}</a>
              <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className="hover:bg-retro-yellow hover:px-1 transition-all cursor-pointer">{ui.nav.skills}</a>
            </div>
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 border-2 border-black px-2 py-1 hover:bg-gray-200 transition-colors ml-2"
            >
              <Globe size={16} />
              <span className="font-black">{language === 'en' ? 'CN' : 'EN'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="retro-container py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {/* Avatar Added Here */}
          <div className="mb-8 relative w-fit">
             <div className="w-32 h-32 rounded-full border-2 border-black bg-white overflow-hidden shadow-[6px_6px_0px_0px_#000] hover:scale-105 transition-transform duration-300">
                 <img 
                   src="/avatar.png" 
                   alt="Huiru Wang Avatar" 
                   className="w-full h-full object-cover"
                 />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-retro-green border-2 border-black px-2 py-0.5 text-xs font-bold rotate-[-10deg] shadow-[2px_2px_0px_0px_#000]">
               HI!
             </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            {ui.hero.hello} {ui.hero.im} <span className="text-retro-purple">{ui.hero.name}</span>
          </h1>
          <p className="text-xl font-mono mb-8 border-l-4 border-black pl-4">
            {personalInfo.summary}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={``}>
              <RetroButton variant="primary" className="flex items-center gap-2">
                <Mail size={18} /> {ui.hero.contact}
              </RetroButton>
            </a>
            <a href={`https://github.com/huiru-wang`} target="_blank" rel="noreferrer">
              <RetroButton variant="secondary" className="flex items-center gap-2">
                <ExternalLink size={18} /> GitHub
              </RetroButton>  
            </a>
          </div>
          
          <div className="mt-8 flex gap-4 text-sm font-mono">
             <button
               type="button"
               onClick={() => copy(personalInfo.phone, 'phone')}
               className={`flex items-center gap-2 border-2 border-black px-3 py-2 bg-white shadow-retro active:translate-x-[2px] active:translate-y-[2px] ${copiedField==='phone' ? 'bg-retro-green' : ''}`}
               aria-label="Copy phone"
             >
               <Phone size={14}/> {personalInfo.phone}
               {copiedField==='phone' && (
                 <span className="ml-2 text-xs font-bold border border-black px-2 bg-retro-bg">COPIED</span>
               )}
             </button>
             <button
               type="button"
               onClick={() => copy(personalInfo.email, 'email')}
               className={`flex items-center gap-2 border-2 border-black px-3 py-2 bg-white shadow-retro active:translate-x-[2px] active:translate-y-[2px] ${copiedField==='email' ? 'bg-retro-green' : ''}`}
               aria-label="Copy email"
             >
               <Mail size={14}/> {personalInfo.email}
               {copiedField==='email' && (
                 <span className="ml-2 text-xs font-bold border border-black px-2 bg-retro-bg">COPIED</span>
               )}
             </button>
          </div>
        </div>
        
        <div className="relative hidden md:flex items-center justify-center min-h-[400px]">
           {/* Abstract Background Shapes */}
           <div className="absolute top-0 right-10 w-32 h-32 bg-retro-yellow border-2 border-black rounded-full z-0"></div>
           <div className="absolute bottom-10 left-10 w-24 h-24 bg-retro-purple border-2 border-black z-0 rotate-12"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] h-[90%] bg-dot-pattern opacity-20 -z-10 pointer-events-none"></div>

           {/* Terminal Window Card */}
           <div className="relative w-full max-w-md bg-white border-2 border-black shadow-[12px_12px_0px_0px_#000] z-10 transition-transform hover:-translate-y-1 hover:translate-x-1 duration-300">
              {/* Terminal Title Bar */}
              <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b-2 border-black">
                  <span className="font-mono text-xs tracking-wider">{ui.hero.terminal_title}</span>
                  <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-white border border-gray-500"></div>
                       <div className="w-3 h-3 rounded-full bg-white border border-gray-500 opacity-50"></div>
                  </div>
              </div>

              {/* Terminal Content */}
              <div className="p-6 font-mono text-sm leading-relaxed">
                  <div className="mb-4">
                      <span className="text-retro-green font-bold text-lg">➜</span> <span className="font-bold">{ui.hero.role_label}</span>
                      <p className="text-gray-600 pl-6 border-l-2 border-gray-200 ml-1 mt-1">{personalInfo.title}</p>
                  </div>

                  <div className="mb-4">
                      <span className="text-retro-green font-bold text-lg">➜</span> <span className="font-bold">{ui.hero.stack_label}</span>
                      <div className="pl-6 text-xs text-gray-600 mt-2 space-y-2">
                          {experiences.map((exp, i) => (
                             <div key={i}>
                                <span className="text-retro-purple">[{exp.period.split(' ')[0]}]</span>{" "}
                                <span className="text-black font-bold">{exp.company}</span>
                                <span className="text-gray-500 hidden sm:inline"> :: {exp.role}</span>
                                <div className="sm:hidden text-gray-500 pl-2">↳ {exp.role}</div>
                             </div>
                          ))}
                      </div>
                  </div>

                  <div className="mb-2">
                      <span className="text-retro-green font-bold text-lg">➜</span> <span className="font-bold">{ui.hero.status_label}</span>
                      <div className="pl-6 mt-1">
                          <span className="bg-retro-yellow px-2 py-0.5 border border-black text-black font-bold text-xs inline-block">
                              {ui.hero.open_to_connect}
                          </span>
                      </div>
                  </div>
                  
                  <div className="mt-6 pl-6 animate-pulse">
                      <span className="w-2.5 h-5 bg-black inline-block align-bottom"></span>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="border-t-2 border-black bg-white py-20">
        <div className="retro-container">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-5xl font-black text-black">
              {ui.sections.projects_title}
            </h2>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="font-mono text-sm hidden md:block bg-gray-100 px-2 py-1 border border-black font-bold hover:bg-retro-yellow transition-colors cursor-pointer"
            >
              {ui.sections.projects_desc}
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <RetroCard 
                key={project.id} 
                title={project.title} 
                subtitle={`${project.role} | ${project.period}`}
                className="h-full flex flex-col"
                badge={project.company}
                onClick={() => openArticle(project.id)}
                bgColor="bg-white"
              >
                <p className="mb-4 text-black font-medium">{project.summary}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.techStack.map(tech => (
                    <span key={tech} className="text-xs font-bold border border-black px-2 py-1 bg-retro-bg text-black">
                      {tech}
                    </span>
                  ))}
                </div>
              </RetroCard>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="border-t-2 border-black bg-black text-white py-20">
        <div className="retro-container">
          <h2 className="text-5xl font-black mb-12 text-white">{ui.sections.skills_title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((cat, idx) => (
              <div key={cat.name} className="border-2 border-white bg-white text-black p-6 shadow-[8px_8px_0px_0px_#333] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                {/* Accent on Underline */}
                <h3 className={`text-xl font-bold mb-6 underline decoration-4 underline-offset-4 ${getDecorationColor(idx)}`}>{cat.name}</h3>
                <ul className="space-y-2 font-mono">
                  {cat.skills.map(skill => (
                    <li key={skill} className="flex items-center gap-2 font-bold">
                      <span className="text-xl">›</span> {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Education Footer */}
      <footer className="bg-white border-t-2 border-black py-12">
         <div className="retro-container">
            <h3 className="text-2xl font-black mb-6 uppercase bg-black text-white inline-block px-2">{ui.sections.education_title}</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {education.map((edu, i) => (
                    <div key={i} className="border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:bg-retro-bg transition-colors">
                        <h4 className="font-bold">{edu.school}</h4>
                        <p className="text-sm">{edu.degree}</p>
                        <p className="text-xs font-mono text-gray-500 mt-2">{edu.period}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center font-mono text-xs text-gray-400">
                <p>© {new Date().getFullYear()} Huiru Wang. {ui.sections.education_footer}</p>
            </div>
         </div>
      </footer>

      {/* AI Widget */}
      <ChatWidget language={language} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      {articleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setArticleOpen(false)}>
          <div className="bg-white border-2 border-black shadow-[12px_12px_0px_0px_#000] max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b-2 border-black bg-retro-bg">
              <div className="font-bold text-lg">{articleTitle ?? articleId}</div>
              <button className="border-2 border-black px-2 py-1 bg-black text-white font-bold" onClick={() => setArticleOpen(false)}>CLOSE</button>
            </div>
            <MarkdownArticle content={articleContent} />
          </div>
        </div>
      )}
    </main>
  );
}
