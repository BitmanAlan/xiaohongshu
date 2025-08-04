import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { apiClient } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, accessToken: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session?.access_token && data.user) {
          console.log('Login successful:', {
            userId: data.user.id,
            email: data.user.email,
            tokenLength: data.session.access_token.length,
            tokenPrefix: data.session.access_token.substring(0, 50)
          });
          apiClient.setAccessToken(data.session.access_token);
          onAuthSuccess(data.user, data.session.access_token);
          toast.success('登录成功！');
          onClose();
        } else {
          console.error('Login failed - incomplete session data:', {
            hasSession: !!data.session,
            hasToken: !!data.session?.access_token,
            hasUser: !!data.user
          });
          throw new Error('登录失败：未获得有效会话');
        }
      } else {
        // Sign up
        if (!formData.name.trim()) {
          throw new Error('请输入姓名');
        }

        await apiClient.signup(formData.email, formData.password, formData.name);
        
        // After signup, sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session?.access_token && data.user) {
          console.log('Signup and login successful:', {
            userId: data.user.id,
            email: data.user.email,
            tokenLength: data.session.access_token.length,
            tokenPrefix: data.session.access_token.substring(0, 50)
          });
          apiClient.setAccessToken(data.session.access_token);
          onAuthSuccess(data.user, data.session.access_token);
          toast.success('注册成功！');
          onClose();
        } else {
          console.error('Signup login failed - incomplete session data:', {
            hasSession: !!data.session,
            hasToken: !!data.session?.access_token,
            hasUser: !!data.user
          });
          throw new Error('注册后登录失败：未获得有效会话');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-xl text-gray-800 mb-2">
            {isLogin ? '登录账户' : '创建账户'}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin ? '欢迎回来，继续您的创作之旅' : '加入我们，开始AI文案创作'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="请输入姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10 bg-gray-50 border-0 rounded-xl"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10 bg-gray-50 border-0 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10 pr-10 bg-gray-50 border-0 rounded-xl"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-pink-500 hover:text-pink-600"
          >
            {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-3 text-gray-500"
        >
          取消
        </Button>
      </Card>
    </div>
  );
}