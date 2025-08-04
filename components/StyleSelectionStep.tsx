import React from 'react';
import { Heart, Briefcase, Smile, FlaskConical, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AppState, WritingStyle } from '../App';

interface StyleSelectionStepProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const writingStyles = [
  {
    id: 'emotional' as WritingStyle,
    title: '情感故事',
    preview: '用了这款精华后，我的皮肤真的发生了翻天覆地的变化！每天照镜子都能看到自己在变美...',
    tags: ['情绪共鸣', '个人体验', '合集推荐'],
    icon: Heart
  },
  {
    id: 'professional' as WritingStyle,
    title: '专业测评',
    preview: '从成分分析来看，这款产品含有3%烟酰胺和透明质酸，经过28天测试，肌肤改善度达到85%...',
    tags: ['数据支撑', '成分分析', '深度测评'],
    icon: FlaskConical
  },
  {
    id: 'casual' as WritingStyle,
    title: '轻松种草',
    preview: '姐妹们！我又来分享好物了～这个精华真的是我今年的心头好，价格美丽效果棒棒...',
    tags: ['轻松愉快', '日常分享', '单品种草'],
    icon: Smile
  },
  {
    id: 'scientific' as WritingStyle,
    title: '科学严谨',
    preview: '该产品采用先进的微囊包埋技术，活性成分渗透率提升40%，临床试验证明有效改善肌肤质地...',
    tags: ['科学依据', '技术分析', '对比横评'],
    icon: Briefcase
  }
];

export function StyleSelectionStep({ appState, updateAppState }: StyleSelectionStepProps) {
  const handleNext = () => {
    if (appState.writingStyle) {
      updateAppState({ currentStep: 'confirmation' });
    }
  };

  const handleBack = () => {
    updateAppState({ currentStep: 'type-selection' });
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl text-gray-800 mb-2">选择你喜欢的文案风格</h1>
        <div className="text-sm text-gray-500">Step 3/3</div>
      </div>

      {/* Style Selection */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {writingStyles.map((style) => {
          const IconComponent = style.icon;
          const isSelected = appState.writingStyle === style.id;
          return (
            <Card
              key={style.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-300 bg-pink-50 shadow-md'
                  : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
              }`}
              onClick={() => updateAppState({ writingStyle: style.id })}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 mr-2 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                  <h3 className={`${isSelected ? 'text-pink-600' : 'text-gray-800'}`}>
                    {style.title}
                  </h3>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-pink-500" />}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {style.preview}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {style.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-1 text-xs rounded-full ${
                      isSelected
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <Button
          onClick={handleNext}
          disabled={!appState.writingStyle}
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