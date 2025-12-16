import React from 'react';
import { Home, Leaf, Siren, Heart, User } from 'lucide-react';
import { AppView, NavItem } from '../types';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  t: (key: string) => string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, t }) => {
  
  const navItems: NavItem[] = [
    { view: AppView.HOME, label: t('home'), icon: Home, color: 'text-emerald-600' },
    { view: AppView.PRE_DISASTER, label: t('pre'), icon: Leaf, color: 'text-mint-600' },
    { view: AppView.DURING_DISASTER, label: t('during'), icon: Siren, color: 'text-red-500' },
    { view: AppView.POST_DISASTER, label: t('post'), icon: Heart, color: 'text-lime-600' },
    { view: AppView.PROFILE, label: t('profile'), icon: User, color: 'text-slate-600' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="glass-panel rounded-full px-2 py-3 flex justify-between items-center shadow-2xl relative overflow-hidden">
        {/* Animated Background Blob based on active tab - aesthetic touch */}
        <div className="absolute inset-0 bg-white/20 pointer-events-none" />
        
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`
                relative z-10 flex flex-col items-center justify-center w-full transition-all duration-300
                ${isActive ? '-translate-y-1' : 'opacity-60 hover:opacity-100'}
              `}
            >
              <div className={`
                p-2 rounded-full transition-all duration-500
                ${isActive ? 'bg-white shadow-lg scale-110' : 'bg-transparent'}
              `}>
                <Icon 
                  size={24} 
                  className={`
                    transition-colors duration-300
                    ${isActive ? item.color : 'text-slate-600'}
                  `} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`
                text-[10px] font-medium mt-1 transition-all duration-300
                ${isActive ? 'opacity-100 translate-y-0 text-slate-800' : 'opacity-0 translate-y-2'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};