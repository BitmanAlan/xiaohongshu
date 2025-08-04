import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '../utils/supabase/client';
import { authApi } from '../utils/api.tsx';
import { toast } from 'sonner@2.0.3';
import { AppState } from '../App';

interface AuthPageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export function AuthPage({ appState, updateAppState }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success('登录成功！');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      await authApi.signup(formData.email, formData.password, formData.name);
      
      // After successful signup, sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success('注册成功！');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    updateAppState({ 
      currentStep: 'product-input',
      user: null,
      accessToken: null
    });
    toast.info('以游客身份继续，部分功能可能受限');
  };

  return (
    <div className="p-6 h-screen flex flex-col justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-pink-500" />
        </div>
        <h1 className="text-2xl text-gray-800 mb-2">AI·种草文案</h1>
        <p className="text-gray-500">智能生成优质种草内容</p>
      </div>

      {/* Auth Form */}
      <Card className="p-6 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              !isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            注册
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="邮箱"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              placeholder="密码"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
            />
          </div>
        </div>

        <Button
          onClick={isLogin ? handleLogin : handleSignup}
          disabled={loading}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl mt-6"
        >
          {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </Button>
      </Card>

      {/* Guest Option */}
      <Button
        onClick={handleContinueAsGuest}
        variant="ghost"
        className="w-full h-12 text-gray-500 rounded-xl"
      >
        以游客身份继续
      </Button>

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-gray-400">
        继续使用即表示同意我们的服务条款和隐私政策
      </div>
    </div>
  );
}