import React, { useState } from 'react';
import { Upload, Link, Tag, Sparkles, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { apiClient } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { AppState } from '../App';

interface StyleTrainingProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  requireAuth: () => boolean;
}

export function StyleTraining({ appState, updateAppState, requireAuth }: StyleTrainingProps) {
  const [trainingText, setTrainingText] = useState('');
  const [accountTag, setAccountTag] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!requireAuth()) {
      return;
    }

    if (!trainingText.trim()) {
      toast.error('请输入训练文本');
      return;
    }

    try {
      const result = await apiClient.analyzeStyle(trainingText, accountTag);
      
      setAnalysisResult(result.analysis);
      toast.success('风格分析完成！');
    } catch (error) {
      console.error('Style analysis error:', error);
      toast.error('分析失败，请重试');
    }
  };

  const handleStartTraining = () => {
    toast.success('个性化风格训练完成！生成文案将更贴合您的风格');
    updateAppState({ currentStep: 'product-input' });
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-xl text-gray-800 mb-2">个性化你的文案风格</h1>
        <div className="text-sm text-gray-500">通过分析你的历史文案，打造专属写作风格</div>
      </div>

      {/* Import Methods */}
      <div className="mb-6">
        <h3 className="mb-3 text-gray-700">导入历史文案</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-6 h-6 text-pink-500 mb-2" />
            <div className="text-sm text-gray-800 mb-1">上传文件</div>
            <div className="text-xs text-gray-500">支持 txt, docx</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <Link className="w-6 h-6 text-pink-500 mb-2" />
            <div className="text-sm text-gray-800 mb-1">链接导入</div>
            <div className="text-xs text-gray-500">小红书、微博链接</div>
          </Card>
        </div>
        
        <Textarea
          placeholder="或者直接粘贴你的历史文案内容..."
          value={trainingText}
          onChange={(e) => setTrainingText(e.target.value)}
          className="h-32 bg-gray-50 border-0 rounded-xl resize-none"
        />
      </div>

      {/* Account Tag */}
      <div className="mb-6">
        <h3 className="mb-3 text-gray-700">账号标签</h3>
        <Input
          placeholder="例如：小红书主账号、美妆博主"
          value={accountTag}
          onChange={(e) => setAccountTag(e.target.value)}
          className="bg-gray-50 border-0 rounded-xl"
        />
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="p-4 mb-6 bg-pink-50 border-pink-200">
          <div className="flex items-center mb-3">
            <Tag className="w-5 h-5 text-pink-500 mr-2" />
            <span className="text-pink-800">风格分析结果</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">风格标签：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(analysisResult.style_types || []).map((style: string) => (
                  <Badge key={style} className="bg-pink-100 text-pink-700 text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">高频词汇：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(analysisResult.word_frequency || []).map((word: string) => (
                  <span key={word} className="bg-white text-pink-600 px-2 py-1 rounded text-xs">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">句式特点：</span>
              <span className="text-gray-800 ml-1">{analysisResult.sentence_pattern}</span>
            </div>
            
            <div>
              <span className="text-gray-600">情感基调：</span>
              <span className="text-gray-800 ml-1">{analysisResult.emotional_tone}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="mt-auto space-y-3">
        {!analysisResult ? (
          <Button
            onClick={handleAnalyze}
            disabled={!trainingText.trim()}
            className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            <FileText className="w-4 h-4 mr-2" />
            分析文案风格
          </Button>
        ) : (
          <Button
            onClick={handleStartTraining}
            className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            开始训练
          </Button>
        )}
        
        <Button
          onClick={() => updateAppState({ currentStep: 'library' })}
          variant="ghost"
          className="w-full h-10 text-gray-500 rounded-xl"
        >
          返回文案库
        </Button>
      </div>
    </div>
  );
}