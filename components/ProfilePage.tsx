import React, { useState, useEffect } from 'react';
import { User, Settings, FileText, Sparkles, LogOut, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { apiClient } from '../utils/api';
import { AppState } from '../App';

interface ProfilePageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onLogout: () => void;
}

export function ProfilePage({ appState, updateAppState, onLogout }: ProfilePageProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appState.user && appState.accessToken) {
      loadProfile();
    }
  }, [appState.user, appState.accessToken]);

  const loadProfile = async () => {
    if (!appState.accessToken) return;
    
    setLoading(true);
    try {
      const result = await apiClient.getProfile();
      setProfileData(result.profile);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!appState.user) {
    return (
      <div className="p-6 h-screen flex flex-col justify-center items-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">请先登录查看个人资料</p>
          <Button
            onClick={() => updateAppState({ showAuthModal: true })}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            去登录
          </Button>
        </div>
      </div>
    );
  }

  const profileStats = [
    {
      label: '已保存文案',
      value: profileData?.usage_stats?.total_generations || 0,
      icon: FileText
    },
    {
      label: '生成次数',
      value: profileData?.usage_stats?.total_generations || 0,
      icon: Sparkles
    },
    {
      label: '反馈次数',
      value: profileData?.usage_stats?.total_feedback || 0,
      icon: Crown
    }
  ];

  const menuItems = [
    {
      label: '我的文案库',
      icon: FileText,
      action: () => updateAppState({ currentStep: 'library' })
    },
    {
      label: '个性化风格',
      icon: Sparkles,
      action: () => updateAppState({ currentStep: 'training' })
    },
    {
      label: '设置',
      icon: Settings,
      action: () => {} // Mock
    }
  ];

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-pink-500" />
        </div>
        <h2 className="text-xl text-gray-800 mb-1">
          {appState.user.user_metadata?.name || '用户'}
        </h2>
        <p className="text-sm text-gray-500">{appState.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {profileStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label} className="p-4 text-center">
              <IconComponent className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <div className="text-lg text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Membership Status */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="flex items-center mb-2">
          <Crown className="w-5 h-5 text-pink-500 mr-2" />
          <span className="text-pink-800">会员状态</span>
        </div>
        <div className="text-sm text-pink-700 mb-2">
          普通用户 - 享受基础功能
        </div>
        <Button 
          size="sm" 
          className="bg-pink-500 hover:bg-pink-600 text-white text-xs"
        >
          升级会员
        </Button>
      </Card>

      {/* Style Training Status */}
      {profileData?.style_preferences && Object.keys(profileData.style_preferences).length > 0 && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-blue-800">个性化风格</span>
          </div>
          <div className="text-sm text-blue-700 mb-2">
            已训练个性化风格模型
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(profileData.style_preferences).slice(0, 3).map((style: string) => (
              <Badge key={style} className="bg-blue-100 text-blue-700 text-xs">
                {style}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Menu Items */}
      <div className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.label}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={item.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconComponent className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-800">{item.label}</span>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="pt-6">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full h-12 text-red-500 hover:bg-red-50 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
}