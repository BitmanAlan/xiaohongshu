import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Meh, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { apiClient } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { AppState } from '../App';

interface FeedbackPageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const satisfactionLevels = [
  { id: 'love', icon: Heart, label: '超级满意', color: 'text-pink-500' },
  { id: 'like', icon: ThumbsUp, label: '很满意', color: 'text-green-500' },
  { id: 'ok', icon: Meh, label: '一般般', color: 'text-yellow-500' },
  { id: 'dislike', icon: ThumbsDown, label: '不满意', color: 'text-red-500' }
];

const feedbackTags = [
  '语气不符合',
  '结构有问题',
  '内容不符合产品',
  '风格不对',
  '长度不合适',
  '重复内容多',
  '创意不够',
  '合规有问题'
];

export function FeedbackPage({ appState, updateAppState }: FeedbackPageProps) {
  const [selectedSatisfaction, setSelectedSatisfaction] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSatisfaction) {
      toast.error('请选择满意度');
      return;
    }

    try {
      await apiClient.submitFeedback({
        generation_id: appState.currentGenerationId || 'default',
        satisfaction: selectedSatisfaction,
        tags: selectedTags,
        comment
      });
      
      toast.success('反馈提交成功，感谢您的意见！');
      updateAppState({ currentStep: 'results' });
    } catch (error) {
      console.error('Submit feedback error:', error);
      toast.error('提交失败，请重试');
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-xl text-gray-800 mb-2">本次生成满意吗？</h1>
        <div className="text-sm text-gray-500">您的反馈帮助我们提升生成质量</div>
      </div>

      {/* Satisfaction Rating */}
      <div className="mb-6">
        <h3 className="mb-4 text-gray-700">满意度评分</h3>
        <div className="grid grid-cols-2 gap-3">
          {satisfactionLevels.map((level) => {
            const IconComponent = level.icon;
            const isSelected = selectedSatisfaction === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedSatisfaction(level.id)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isSelected
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <IconComponent className={`w-8 h-8 mx-auto mb-2 ${isSelected ? level.color : 'text-gray-400'}`} />
                <div className={`text-sm ${isSelected ? 'text-pink-600' : 'text-gray-600'}`}>
                  {level.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Tags */}
      <div className="mb-6">
        <h3 className="mb-3 text-gray-700">具体问题 (可多选)</h3>
        <div className="flex flex-wrap gap-2">
          {feedbackTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'border-pink-300 bg-pink-50 text-pink-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="flex-1 mb-6">
        <h3 className="mb-3 text-gray-700">详细建议</h3>
        <Textarea
          placeholder="说说你的真实想法，帮助我们改进..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="h-24 resize-none bg-gray-50 border-0 rounded-xl"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
        >
          提交反馈
        </Button>
        <Button
          onClick={() => updateAppState({ currentStep: 'results' })}
          variant="ghost"
          className="w-full h-10 text-gray-500 rounded-xl"
        >
          跳过
        </Button>
      </div>
    </div>
  );
}