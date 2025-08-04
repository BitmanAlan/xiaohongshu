import React from 'react';
import { Star, Users, Search, BarChart3, User, Briefcase, GraduationCap, Baby } from 'lucide-react';
import { Button } from './ui/button';
import { AppState, ContentType, TargetAudience } from '../App';

interface TypeSelectionStepProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const contentTypes = [
  { id: 'single' as ContentType, label: '单品种草', icon: Star, description: '单个产品深度推荐' },
  { id: 'collection' as ContentType, label: '合集推荐', icon: Users, description: '多产品组合推荐' },
  { id: 'review' as ContentType, label: '深度测评', icon: Search, description: '详细使用体验' },
  { id: 'comparison' as ContentType, label: '对比横评', icon: BarChart3, description: '多产品对比分析' }
];

const targetAudiences = [
  { id: 'gen-z' as TargetAudience, label: 'Z世代女生', icon: User, description: '18-25岁年轻女性' },
  { id: 'sensitive-skin' as TargetAudience, label: '敏感肌', icon: Baby, description: '敏感肌肤人群' },
  { id: 'office-worker' as TargetAudience, label: '职场白领', icon: Briefcase, description: '25-35岁职场女性' },
  { id: 'student' as TargetAudience, label: '学生党', icon: GraduationCap, description: '学生群体' }
];

export function TypeSelectionStep({ appState, updateAppState }: TypeSelectionStepProps) {
  const handleNext = () => {
    if (appState.contentType && appState.targetAudience) {
      updateAppState({ currentStep: 'style-selection' });
    }
  };

  const handleBack = () => {
    updateAppState({ currentStep: 'product-input' });
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl text-gray-800 mb-2">本文是用于哪种类型内容？</h1>
        <div className="text-sm text-gray-500">Step 2/3</div>
      </div>

      {/* Content Type Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-gray-700">内容类型</h3>
        <div className="grid grid-cols-2 gap-3">
          {contentTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = appState.contentType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => updateAppState({ contentType: type.id })}
                className={`p-3 rounded-xl border-2 transition-colors text-left ${
                  isSelected
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-2 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                <div className={`text-sm mb-1 ${isSelected ? 'text-pink-600' : 'text-gray-800'}`}>
                  {type.label}
                </div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Audience Selection */}
      <div className="flex-1">
        <h3 className="mb-3 text-gray-700">目标人群</h3>
        <div className="space-y-3">
          {targetAudiences.map((audience) => {
            const IconComponent = audience.icon;
            const isSelected = appState.targetAudience === audience.id;
            return (
              <button
                key={audience.id}
                onClick={() => updateAppState({ targetAudience: audience.id })}
                className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center ${
                  isSelected
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <IconComponent className={`w-5 h-5 mr-3 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                <div className="text-left">
                  <div className={`text-sm ${isSelected ? 'text-pink-600' : 'text-gray-800'}`}>
                    {audience.label}
                  </div>
                  <div className="text-xs text-gray-500">{audience.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <Button
          onClick={handleNext}
          disabled={!appState.contentType || !appState.targetAudience}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
        >
          下一步
        </Button>
        <Button
          onClick={handleBack}
          variant="ghost"
          className="w-full h-12 text-gray-500 rounded-xl"
        >
          上一步
        </Button>
      </div>
    </div>
  );
}