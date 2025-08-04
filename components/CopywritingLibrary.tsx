import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Star, MoreVertical, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiClient } from '../utils/api';
import { AppState } from '../App';

interface CopywritingLibraryProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  requireAuth: () => boolean;
}

const mockLibraryItems = [
  {
    id: 1,
    title: '春季护肤精华推荐',
    style: '情感故事',
    type: '单品种草',
    date: '2024-03-15',
    compliance: 'A',
    published: true,
    saved: true,
    preview: '用了这款精华后，我的皮肤真的发生了翻天覆地的变化...'
  },
  {
    id: 2,
    title: '敏感肌护肤品合集',
    style: '专业测评',
    type: '合集推荐',
    date: '2024-03-12',
    compliance: 'A',
    published: false,
    saved: true,
    preview: '作为敏感肌用户，经过3个月的测试，这几款产品...'
  },
  {
    id: 3,
    title: '平价面膜横向对比',
    style: '科学严谨',
    type: '对比横评',
    date: '2024-03-10',
    compliance: 'B',
    published: true,
    saved: false,
    preview: '通过成分分析和使用体验，对比了市面上5款热门面膜...'
  }
];

export function CopywritingLibrary({ appState, updateAppState }: CopywritingLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [libraryItems, setLibraryItems] = useState<any[]>(mockLibraryItems);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appState.user) {
      loadLibrary();
    }
  }, [appState.user]);

  const loadLibrary = async () => {
    if (!requireAuth()) return;
    
    setLoading(true);
    try {
      const result = await apiClient.getLibrary();
      if (result.library && result.library.length > 0) {
        setLibraryItems(result.library);
      }
    } catch (error) {
      console.error('Load library error:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <h1 className="text-xl text-gray-800 mb-4">我的文案库</h1>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索文案..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-0 rounded-xl"
            />
          </div>
          
          <div className="flex space-x-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1 bg-gray-50 border-0 rounded-xl">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="single">单品种草</SelectItem>
                <SelectItem value="collection">合集推荐</SelectItem>
                <SelectItem value="review">深度测评</SelectItem>
                <SelectItem value="comparison">对比横评</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 bg-gray-50 border-0 rounded-xl">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">按日期</SelectItem>
                <SelectItem value="compliance">按合规性</SelectItem>
                <SelectItem value="style">按风格</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Library Items */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : libraryItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>暂无保存的文案</p>
            <Button
              onClick={() => updateAppState({ currentStep: 'product-input' })}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
            >
              创建第一个文案
            </Button>
          </div>
        ) : (
          libraryItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-gray-800 mb-1">{item.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{item.style}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.saved && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.preview}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <Badge className={`text-xs ${getComplianceColor(item.compliance)}`}>
                    {item.compliance}级
                  </Badge>
                  {item.published && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      已发布
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-600">
                    再次生成
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Action */}
      <div className="pt-4">
        <Button
          onClick={() => updateAppState({ currentStep: 'product-input' })}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
        >
          创建新文案
        </Button>
      </div>
    </div>
  );
}