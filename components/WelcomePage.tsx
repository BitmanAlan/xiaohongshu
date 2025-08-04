import React from 'react';
import { Sparkles, FileText, Shield, Heart, ArrowRight, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AppState } from '../App';

interface WelcomePageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'AI智能生成',
    description: '基于智谱AI技术，生成3个不同风格的文案版本',
    color: 'text-pink-500'
  },
  {
    icon: Heart,
    title: '个性化风格',
    description: '学习你的写作习惯，打造专属文案风格',
    color: 'text-purple-500'
  },
  {
    icon: Shield,
    title: '合规性检测',
    description: '自动检测广告法合规性，确保文案安全发布',
    color: 'text-green-500'
  },
  {
    icon: FileText,
    title: '文案库管理',
    description: '保存历史文案，支持分类管理和快速复用',
    color: 'text-blue-500'
  }
];

const steps = [
  {
    step: '01',
    title: '输入产品信息',
    description: '填写产品名称，选择相关标签'
  },
  {
    step: '02',
    title: '选择风格偏好',
    description: '选择文案类型、目标人群和写作风格'
  },
  {
    step: '03',
    title: 'AI生成文案',
    description: '一键生成多个版本的专业文案'
  }
];

export function WelcomePage({ appState, updateAppState }: WelcomePageProps) {
  const handleGetStarted = () => {
    if (appState.user) {
      updateAppState({ currentStep: 'product-input' });
    } else {
      updateAppState({ showAuthModal: true });
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-pink-500" />
        </div>
        <h1 className="text-2xl text-gray-800 mb-3">AI种草文案生成器</h1>
        <p className="text-gray-600 mb-6">
          让AI帮你写出更吸引人的种草文案<br />
          轻松提升商品转化率
        </p>
        
        {appState.user ? (
          <div className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-xl">
            <User className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">
              欢迎回来，{appState.user.user_metadata?.name || appState.user.email}
            </span>
          </div>
        ) : null}

        <Button
          onClick={handleGetStarted}
          className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {appState.user ? '开始创作' : '立即体验'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h2 className="text-lg text-gray-800 mb-4 text-center">核心功能</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.title} className="p-4 text-center">
                <IconComponent className={`w-8 h-8 ${feature.color} mx-auto mb-3`} />
                <h3 className="text-sm text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-8">
        <h2 className="text-lg text-gray-800 mb-4 text-center">使用流程</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-start">
              <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-xs">{step.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-800 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 mb-6">
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-lg text-pink-600">10K+</div>
              <div className="text-xs text-gray-600">用户使用</div>
            </div>
            <div>
              <div className="text-lg text-pink-600">50K+</div>
              <div className="text-xs text-gray-600">文案生成</div>
            </div>
            <div>
              <div className="text-lg text-pink-600">95%</div>
              <div className="text-xs text-gray-600">满意度</div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            已帮助数万创作者提升内容质量
          </p>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="mt-auto pt-4">
        {!appState.user && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-2">
              注册账户，解锁更多功能
            </p>
            <Button
              onClick={() => updateAppState({ showAuthModal: true })}
              variant="outline"
              className="w-full h-10 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl"
            >
              注册 / 登录
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}