import React, { useState } from 'react';
import { Copy, Heart, MoreHorizontal, CheckCircle, MessageSquare, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { apiClient } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { AppState } from '../App';

interface GeneratedResultsProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export function GeneratedResults({ appState, updateAppState }: GeneratedResultsProps) {
  const [savedItems, setSavedItems] = useState<number[]>([]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const handleSave = async (item: any) => {
    if (!appState.user || !appState.accessToken) {
      toast.error('请先登录后再保存');
      return;
    }

    const isCurrentlySaved = savedItems.includes(item.id);
    
    if (!isCurrentlySaved) {
      try {
        await apiClient.saveToLibrary(appState.currentGenerationId || '', item.id.toString());
        
        setSavedItems(prev => [...prev, item.id]);
        toast.success('已收藏');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('收藏失败');
      }
    } else {
      setSavedItems(prev => prev.filter(itemId => itemId !== item.id));
      toast.success('已取消收藏');
    }
  };

  const handleCopyAll = async () => {
    const allContent = appState.generatedContent
      .map((item, index) => `${item.title}\n\n${item.content}`)
      .join('\n\n---\n\n');
    
    try {
      await navigator.clipboard.writeText(allContent);
      toast.success('已复制全部内容到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-yellow-100 text-yellow-700';
      case 'C': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl text-gray-800 mb-2">AI·种草文案</h1>
        <div className="text-sm text-gray-500">为您生成了 {appState.generatedContent.length} 个版本</div>
      </div>

      {/* Generated Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {appState.generatedContent.map((item: any) => (
          <Card key={item.id} className="p-4">
            {/* Title and Actions */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-800">{item.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getComplianceColor(item.compliance)}>
                  {item.compliance}级
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(item)}
                  className={savedItems.includes(item.id) ? 'text-pink-500' : 'text-gray-400'}
                >
                  <Heart className={`w-4 h-4 ${savedItems.includes(item.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
              {item.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(item.content)}
                className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAppState({ currentStep: 'compliance' })}
                className="text-gray-500 hover:text-gray-600"
              >
                <Shield className="w-4 h-4 mr-1" />
                合规检测
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 space-y-3">
        <Button
          onClick={handleCopyAll}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
        >
          <Copy className="w-4 h-4 mr-2" />
          一键复制全部
        </Button>
        <div className="flex space-x-3">
          <Button
            onClick={() => updateAppState({ currentStep: 'feedback' })}
            variant="outline"
            className="flex-1 h-10 rounded-xl"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            反馈
          </Button>
          <Button
            onClick={() => updateAppState({ currentStep: 'product-input' })}
            variant="outline"
            className="flex-1 h-10 rounded-xl"
          >
            重新生成
          </Button>
        </div>
      </div>
    </div>
  );
}