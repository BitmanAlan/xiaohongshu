import React, { useState } from 'react';
import { Package2, Sparkles, Shield, Droplets, Zap, Heart, Upload, Link, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { AppState } from '../App';
import { toast } from 'sonner@2.0.3';

interface ProductInputStepProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  requireAuth: () => boolean;
}

const popularTags = [
  { id: 'antioxidant', label: '抗氧化', icon: Shield },
  { id: 'repair', label: '修护屏障', icon: Heart },
  { id: 'refreshing', label: '清爽不黏腻', icon: Droplets },
  { id: 'whitening', label: '美白亮肤', icon: Sparkles },
  { id: 'anti-aging', label: '抗衰老', icon: Zap },
  { id: 'moisturizing', label: '深层保湿', icon: Droplets }
];

export function ProductInputStep({ appState, updateAppState, requireAuth }: ProductInputStepProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleTagToggle = (tagId: string) => {
    const newTags = appState.selectedTags.includes(tagId)
      ? appState.selectedTags.filter(t => t !== tagId)
      : [...appState.selectedTags, tagId];
    updateAppState({ selectedTags: newTags });
  };

  const handleNext = () => {
    if (appState.productName.trim()) {
      updateAppState({ currentStep: 'type-selection' });
    } else {
      toast.error('请先输入产品名称');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('请上传有效的图片文件 (JPG, PNG, WebP)');
      return;
    }

    // 检查文件大小 (5MB限制)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过5MB');
      return;
    }

    setIsImporting(true);
    try {
      // 模拟文件处理 - 在实际实现中这里会调用图像识别API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟提取产品信息
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      updateAppState({ 
        productName: fileName.includes('product') ? fileName : '未识别产品名称',
        selectedTags: ['moisturizing', 'repair'] // 模拟识别的标签
      });
      
      setShowImportDialog(false);
      toast.success('图片上传成功！已自动识别产品信息');
    } catch (error) {
      toast.error('图片处理失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      toast.error('请输入有效的商品链接');
      return;
    }

    // 简单的URL验证
    try {
      new URL(importUrl);
    } catch {
      toast.error('请输入有效的URL');
      return;
    }

    setIsImporting(true);
    try {
      // 模拟链接解析 - 在实际实现中这里会调用链接解析API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟提取产品信息
      let productName = '未识别产品';
      let suggestedTags = ['repair'];
      
      if (importUrl.includes('taobao') || importUrl.includes('tmall')) {
        productName = '淘宝商品';
        suggestedTags = ['moisturizing', 'repair'];
      } else if (importUrl.includes('xiaohongshu') || importUrl.includes('xhs')) {
        productName = '小红书推荐商品';
        suggestedTags = ['whitening', 'anti-aging'];
      } else if (importUrl.includes('douyin') || importUrl.includes('tiktok')) {
        productName = '抖音热门商品';
        suggestedTags = ['refreshing', 'antioxidant'];
      }
      
      updateAppState({ 
        productName,
        selectedTags: suggestedTags
      });
      
      setShowImportDialog(false);
      setImportUrl('');
      toast.success('链接解析成功！已自动填充产品信息');
    } catch (error) {
      toast.error('链接解析失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const canProceed = appState.productName.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package2 className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-xl text-gray-800 mb-2">你要写的产品是？</h1>
          <div className="text-sm text-gray-500">Step 1/3</div>
        </div>

        {/* Product Name Input */}
        <div className="mb-6">
          <Input
            placeholder="请输入产品名称"
            value={appState.productName}
            onChange={(e) => updateAppState({ productName: e.target.value })}
            className="h-12 bg-gray-50 border-0 rounded-xl text-center"
          />
          
          {/* Import Options */}
          <div className="flex gap-2 mt-3">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-10 bg-white border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  导入
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>导入产品信息</DialogTitle>
                  <DialogDescription>
                    通过上传图片或输入链接快速获取产品信息，AI将自动识别并填充相关内容。
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">上传图片</TabsTrigger>
                    <TabsTrigger value="link">链接导入</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-pink-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        上传产品图片，AI将自动识别产品信息
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isImporting}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center px-6 py-3 rounded-lg cursor-pointer transition-colors ${
                          isImporting 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-pink-500 hover:bg-pink-600 text-white'
                        }`}
                      >
                        {isImporting ? (
                          <>处理中...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            选择图片
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-400 mt-2">
                        支持 JPG、PNG、WebP 格式，最大 5MB
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="link" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Link className="w-8 h-8 text-pink-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        输入商品链接，自动获取产品信息
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="粘贴淘宝、天猫、小红书、抖音等平台的商品链接"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="min-h-[80px] resize-none"
                        disabled={isImporting}
                      />
                      <Button
                        onClick={handleUrlImport}
                        disabled={!importUrl.trim() || isImporting}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        {isImporting ? '解析中...' : '解析链接'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      支持淘宝、天猫、小红书、抖音等主流平台
                    </p>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="mb-8">
          <h3 className="mb-4 text-gray-700">热门标签</h3>
          <div className="grid grid-cols-2 gap-3">
            {popularTags.map((tag) => {
              const IconComponent = tag.icon;
              const isSelected = appState.selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isSelected
                      ? 'border-pink-300 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mb-2 mx-auto" />
                  <div className="text-sm">{tag.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>进度</span>
            <span>1/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-1/3 transition-all duration-300"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full h-12 rounded-xl transition-all duration-200 ${
              canProceed
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canProceed ? '下一步' : '请先输入产品名称'}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full h-12 text-gray-500 rounded-xl hover:bg-gray-50"
            onClick={() => updateAppState({ currentStep: 'welcome' })}
          >
            返回首页
          </Button>
        </div>

        {/* Tips */}
        {appState.selectedTags.length > 0 && (
          <div className="mt-6 p-4 bg-pink-50 rounded-xl">
            <p className="text-sm text-pink-600 text-center">
              ✨ 已选择 {appState.selectedTags.length} 个标签，这将帮助生成更精准的文案
            </p>
          </div>
        )}
      </div>
    </div>
  );
}