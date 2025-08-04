import React, { useState } from 'react';
import { Edit, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { apiClient } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { AppState } from '../App';

interface ConfirmationStepProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const getContentTypeLabel = (type: string) => {
  const labels = {
    'single': '单品种草',
    'collection': '合集推荐',
    'review': '深度测评',
    'comparison': '对比横评'
  };
  return labels[type as keyof typeof labels] || type;
};

const getTargetAudienceLabel = (audience: string) => {
  const labels = {
    'gen-z': 'Z世代女生',
    'sensitive-skin': '敏感肌',
    'office-worker': '职场白领',
    'student': '学生党'
  };
  return labels[audience as keyof typeof labels] || audience;
};

const getWritingStyleLabel = (style: string) => {
  const labels = {
    'emotional': '情感故事',
    'professional': '专业测评',
    'casual': '轻松种草',
    'scientific': '科学严谨'
  };
  return labels[style as keyof typeof labels] || style;
};

export function ConfirmationStep({ appState, updateAppState }: ConfirmationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!appState.productName || !appState.contentType || !appState.targetAudience || !appState.writingStyle) {
      return;
    }

    // Check authentication before proceeding
    if (!appState.user || !appState.accessToken) {
      toast.error('请先登录再使用生成功能');
      updateAppState({ showAuthModal: true });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting content generation with params:', {
        productName: appState.productName,
        contentType: appState.contentType,
        targetAudience: appState.targetAudience,
        writingStyle: appState.writingStyle,
        hasUser: !!appState.user,
        hasToken: !!appState.accessToken,
        tokenPrefix: appState.accessToken?.substring(0, 50)
      });
      
      const result = await apiClient.generateCopywriting({
        productName: appState.productName,
        selectedTags: appState.selectedTags,
        contentType: appState.contentType,
        targetAudience: appState.targetAudience,
        writingStyle: appState.writingStyle
      });

      console.log('Generation successful, content received:', result);
      updateAppState({ 
        generatedContent: result.content,
        currentGenerationId: result.generation_id,
        currentStep: 'results'
      });
    } catch (error) {
      console.error('Generation error:', error);
      
      if (error.message.includes('Authentication')) {
        toast.error('请先登录再使用生成功能');
        updateAppState({ showAuthModal: true });
      } else {
        toast.error('生成失败，请重试: ' + error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    updateAppState({ currentStep: 'style-selection' });
  };

  const confirmationItems = [
    {
      label: '产品名称',
      value: appState.productName,
      editStep: 'product-input'
    },
    {
      label: '文案类型',
      value: getContentTypeLabel(appState.contentType || ''),
      editStep: 'type-selection'
    },
    {
      label: '目标人群',
      value: getTargetAudienceLabel(appState.targetAudience || ''),
      editStep: 'type-selection'
    },
    {
      label: '文案风格',
      value: getWritingStyleLabel(appState.writingStyle || ''),
      editStep: 'style-selection'
    }
  ];

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-xl text-gray-800 mb-2">确认生成信息</h1>
        <div className="text-sm text-gray-500">请检查以下信息是否正确</div>
      </div>

      {/* Confirmation Items */}
      <div className="flex-1 space-y-4">
        {confirmationItems.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                <div className="text-gray-800">{item.value}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAppState({ currentStep: item.editStep })}
                className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Selected Tags */}
        {appState.selectedTags.length > 0 && (
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">选择的标签</div>
            <div className="flex flex-wrap gap-2">
              {appState.selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? '生成中...' : '确认生成'}
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