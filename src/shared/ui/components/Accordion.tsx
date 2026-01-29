import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  
  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(id) ? [] : [id]
      );
    }
  };
  
  return (
    <div className="w-full space-y-2">
      {items.map(item => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <div key={item.id} className="border border-[var(--color-border)] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[var(--color-surface)] transition-all duration-200 text-left">
              <span className="font-medium">{item.title}</span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            {isOpen && (
              <div className="px-6 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] animate-in slide-in-from-top duration-200">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
