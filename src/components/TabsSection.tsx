import React, { useRef, useEffect } from 'react';
import { Signal, Target, MessageSquare } from 'lucide-react';

type TabsSectionProps = {
  activeTab: 'skills' | 'goals' | 'posts';
  onTabChange: (tab: 'skills' | 'goals' | 'posts') => void;
  children: React.ReactNode;
};

export function TabsSection({ activeTab, onTabChange, children }: TabsSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<Record<string, number>>({
    skills: 0,
    goals: 0,
    posts: 0
  });

  useEffect(() => {
    if (contentRef.current) {
      scrollPositionRef.current[activeTab] = contentRef.current.scrollTop;
    }
  }, [activeTab]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPositionRef.current[activeTab] || 0;
    }
  }, [activeTab]);

  return (
    <section className="bg-white font-safiro pb-6 pt-6">
      <div className="flex justify-center gap-12 mb-6">
        <button 
          className={`pb-2 text-lg flex grow justify-center items-center gap-2 ${
            activeTab === 'skills' 
              ? 'border-b-2 border-black' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('skills')}
        >
          <Signal className="w-4 h-4" />
          Skills
        </button>
        <button 
          className={`pb-2 text-lg flex grow justify-center items-center gap-2 ${
            activeTab === 'goals' 
              ? ' border-b-2 border-black' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('goals')}
        >
          <Target className="w-4 h-4" />
          Ziele
        </button>
        <button 
          className={`pb-2 text-lg flex grow justify-center items-center gap-2 ${
            activeTab === 'posts' 
              ? ' border-b-2 border-black' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('posts')}
        >
          <MessageSquare className="w-4 h-4" />
          Posts
        </button>
      </div>
      <div ref={contentRef} className="overflow-y-auto">
        {children}
      </div>
    </section>
  );
}