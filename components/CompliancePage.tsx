import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AppState } from '../App';

interface CompliancePageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const complianceResults = [
  {
    id: 1,
    title: '版本一：情感共鸣版',
    grade: 'A',
    score: 95,
    issues: [],
    highlights: ['语言规范', '内容真实', '无夸大宣传']
  },
  {
    id: 2,
    title: '版本二：成分分析版',
    grade: 'A',
    score: 92,
    issues: [],
    highlights: ['数据真实', '成分描述准确', '符合广告法']
  },
  {
    id: 3,
    title: '版本三：轻松种草版',
    grade: 'B',
    score: 78,
    issues: [
      { text: '冲鸭', suggestion: '建议改为"快试试"' },
      { text: '无压力', suggestion: '建议改为"很划算"' }
    ],
    highlights: ['整体表达良好', '情感真实']
  }
];

export function CompliancePage({ appState, updateAppState }: CompliancePageProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleReplace = (original: string, suggestion: string) => {
    // Mock replacement logic
    console.log(`Replace "${original}" with "${suggestion}"`);
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateAppState({ currentStep: 'results' })}
          className="mr-3 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl text-gray-800">合规性评分</h1>
          <div className="text-sm text-gray-500">基于最新广告法和平台规范</div>
        </div>
      </div>

      {/* Compliance Results */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {complianceResults.map((result) => (
          <Card key={result.id} className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800">{result.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getGradeColor(result.grade)}>
                  {result.grade}级
                </Badge>
                <span className="text-sm text-gray-500">{result.score}分</span>
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-700">需要注意的表达</span>
                </div>
                <div className="space-y-2">
                  {result.issues.map((issue, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                          {issue.text}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReplace(issue.text, issue.suggestion)}
                          className="text-xs h-6 px-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          一键替换
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600">
                        建议：{issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div>
              <div className="flex items-center mb-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-700">表现良好</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-blue-800">合规性总结</span>
        </div>
        <div className="text-sm text-blue-700">
          整体合规性良好，建议修改标记的表达方式以获得更好的平台推荐。
        </div>
      </Card>
    </div>
  );
}