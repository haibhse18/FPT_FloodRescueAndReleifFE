import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills';
}

export function Tabs({ tabs, defaultTab, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;
  
  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={`flex gap-2 ${variant === 'default' ? 'border-b border-[var(--color-border)]' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all duration-200 ease-in-out ${
              variant === 'pills'
                ? activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-primary)] rounded-lg shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] rounded-lg'
                : activeTab === tab.id
                  ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-6 animate-in fade-in duration-300">
        {activeContent}
      </div>
    </div>
  );
}
