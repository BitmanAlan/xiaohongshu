import React from 'react';
import { Home, FileText, User, Sparkles, LogOut } from 'lucide-react';

interface NavigationProps {
  currentStep: string;
  updateAppState: (updates: { currentStep: string }) => void;
  user?: any;
  onSignOut?: () => void;
}

const navigationItems = [
  { id: 'product-input', label: '创作', icon: Home },
  { id: 'library', label: '文案库', icon: FileText },
  { id: 'training', label: '风格', icon: Sparkles },
  { id: 'profile', label: '我的', icon: User }
];

export function Navigation({ currentStep, updateAppState, user, onSignOut }: NavigationProps) {
  // Don't show navigation on certain steps
  const hideNavigation = [
    'welcome',
    'type-selection',
    'style-selection', 
    'confirmation',
    'results',
    'feedback',
    'compliance'
  ].includes(currentStep);

  if (hideNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      {user && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-2">
                <User className="w-3 h-3 text-pink-500" />
              </div>
              <span className="text-xs text-gray-600">
                {user.user_metadata?.name || user.email}
              </span>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center"
              >
                <LogOut className="w-3 h-3 mr-1" />
                退出
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentStep === item.id || 
            (item.id === 'product-input' && [
              'type-selection', 
              'style-selection', 
              'confirmation', 
              'results'
            ].includes(currentStep));
          
          return (
            <button
              key={item.id}
              onClick={() => updateAppState({ currentStep: item.id })}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}