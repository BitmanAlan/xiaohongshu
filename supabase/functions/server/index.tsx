import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

type Variables = {
  supabase: any;
  user: any;
};

const app = new Hono<{ Variables: Variables }>();

// CORS and logging
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client setup
app.use('*', async (c, next) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  c.set('supabase', supabase);
  await next();
});

// Auth middleware for protected routes
async function requireAuth(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
  
  const accessToken = authHeader?.split(' ')[1];
  console.log('Extracted access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'None');
  
  if (!accessToken) {
    console.log('Authentication failed: No access token provided');
    return c.json({ error: 'Authentication required. Please sign in.' }, 401);
  }

  try {
    // Use service role client to validate the user token
    const serviceSupabase = c.get('supabase');
    console.log('Validating token with service role client...');
    
    const { data: { user }, error } = await serviceSupabase.auth.getUser(accessToken);
    
    console.log('Token validation result:', { 
      userId: user?.id, 
      email: user?.email,
      error: error?.message,
      errorCode: error?.code
    });
    
    if (error) {
      console.log('Token validation failed:', error.message);
      return c.json({ 
        error: 'Authentication failed. Please sign in again.', 
        details: error.message 
      }, 401);
    }
    
    if (!user || !user.id) {
      console.log('No valid user found in token');
      return c.json({ 
        error: 'Invalid user session. Please sign in again.' 
      }, 401);
    }

    console.log('Authentication successful for user:', user.email);
    c.set('user', user);
    await next();
    
  } catch (authError) {
    console.error('Auth middleware error:', authError);
    return c.json({ 
      error: 'Authentication error occurred', 
      details: authError.message 
    }, 500);
  }
}

// 智谱AI API调用函数
async function callZhipuAI(prompt: string, systemPrompt: string) {
  const apiKey = Deno.env.get('ZHIPU_API_KEY');
  
  if (!apiKey) {
    console.error('ZHIPU_API_KEY environment variable not found');
    throw new Error('智谱AI API密钥未配置');
  }
  
  console.log('Using ZHIPU_API_KEY for AI request');

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('智谱AI API错误:', errorData);
    throw new Error(`智谱AI API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 生成系统提示词
function generateSystemPrompt(contentType: string, targetAudience: string, writingStyle: string) {
  const audienceMap = {
    'gen-z': 'Z世代年轻人（18-25岁）',
    'sensitive-skin': '敏感肌用户',
    'office-worker': '上班族',
    'student': '学生群体'
  };

  const styleMap = {
    'emotional': '情感共鸣型，注重情感体验和个人感受',
    'professional': '专业分析型，重视成分和效果数据',
    'casual': '轻松愉快型，语言活泼有趣',
    'scientific': '科学严谨型，注重科学依据和专业性'
  };

  const typeMap = {
    'single': '单品推荐',
    'collection': '合集推荐',
    'review': '产品测评',
    'comparison': '产品对比'
  };

  return `你是一位专业的小红书种草文案编写专家。请根据以下要求生成高质量的种草文案：

目标用户：${audienceMap[targetAudience] || targetAudience}
文案风格：${styleMap[writingStyle] || writingStyle}  
内容类型：${typeMap[contentType] || contentType}

要求：
1. 文案要符合小红书平台的调性和用户习惯
2. 内容要真实可信，避免过度夸大
3. 语言要生动有趣，容易引起共鸣
4. 适当使用emoji和标签增加活跃度
5. 每个版本都要有不同的切入角度和特色
6. 注意合规性，避免违规词汇

请生成3个不同版本的文案，每个版本都要有：
- 标题
- 正文内容（150-300字）
- 推荐的标签
- 合规等级（A/B/C，A为最佳）`;
}

// ==================== AUTH ROUTES ====================

// User signup
app.post('/make-server-7be2d7c8/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log('Signup request for:', email);
    
    if (!email || !password || !name) {
      return c.json({ error: '缺少必填字段' }, 400);
    }

    const supabase = c.get('supabase');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', { 
        message: error.message, 
        code: error.code,
        status: error.status 
      });
      return c.json({ error: '用户创建失败', details: error.message }, 400);
    }

    console.log('User created successfully:', {
      userId: data.user.id,
      email: data.user.email,
      confirmed: data.user.email_confirmed_at
    });

    // Initialize user profile in KV store
    try {
      await kv.set(`user_profile:${data.user.id}`, {
        id: data.user.id,
        email,
        name,
        created_at: new Date().toISOString(),
        style_preferences: {},
        usage_stats: {
          total_generations: 0,
          total_feedback: 0
        }
      });
      console.log('User profile created in KV store');
    } catch (kvError) {
      console.error('Failed to create user profile in KV store:', kvError);
      // Don't fail the signup for this error
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: '服务器内部错误', details: error.message }, 500);
  }
});

// ==================== COPYWRITING ROUTES ====================

// Generate copywriting content
app.post('/make-server-7be2d7c8/generate', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { productName, selectedTags, contentType, targetAudience, writingStyle } = await c.req.json();

    console.log('Generation request from authenticated user:', {
      userId: user.id,
      email: user.email,
      productName,
      contentType,
      targetAudience,
      writingStyle
    });

    if (!productName || !contentType || !targetAudience || !writingStyle) {
      return c.json({ error: '缺少必填参数' }, 400);
    }

    // 构建提示词
    const systemPrompt = generateSystemPrompt(contentType, targetAudience, writingStyle);
    const userPrompt = `产品名称：${productName}
选中标签：${selectedTags.join(', ')}

请为这个产品生成3个不同版本的小红书种草文案。`;

    console.log('Calling 智谱AI for content generation...');
    
    try {
      // 调用智谱AI生成内容
      const aiResponse = await callZhipuAI(userPrompt, systemPrompt);
      console.log('智谱AI response received');

      // 解析AI响应，尝试提取结构化内容
      let generatedContent;
      try {
        // 尝试解析JSON格式的响应
        generatedContent = JSON.parse(aiResponse);
      } catch {
        // 如果不是JSON，则手动解析文本格式
        const versions = aiResponse.split(/版本[一二三1-3]|第[一二三1-3]版/).slice(1);
        generatedContent = versions.slice(0, 3).map((version, index) => {
          const lines = version.trim().split('\n').filter(line => line.trim());
          const content = lines.join('\n');
          
          return {
            id: index + 1,
            title: `版本${index + 1}`,
            content: content,
            tags: selectedTags,
            compliance: 'A',
            style: writingStyle
          };
        });

        // 如果解析失败，创建默认结构
        if (generatedContent.length === 0) {
          generatedContent = [{
            id: 1,
            title: '智谱AI生成版本',
            content: aiResponse,
            tags: selectedTags,
            compliance: 'A',
            style: writingStyle
          }];
        }
      }

      // 确保有3个版本
      while (generatedContent.length < 3) {
        generatedContent.push({
          id: generatedContent.length + 1,
          title: `版本${generatedContent.length + 1}`,
          content: `${productName}真的是我最近的心头好！✨\n\n这款产品的质感和效果都超出了我的预期，用了一段时间后真的看到了明显的改变。\n\n推荐给和我一样在寻找好产品的小伙伴们！`,
          tags: selectedTags,
          compliance: 'A',
          style: writingStyle
        });
      }

      // Store generation result
      const generationId = `generation:${user.id}:${Date.now()}`;
      await kv.set(generationId, {
        id: generationId,
        user_id: user.id,
        product_name: productName,
        selected_tags: selectedTags,
        content_type: contentType,
        target_audience: targetAudience,
        writing_style: writingStyle,
        generated_content: generatedContent,
        created_at: new Date().toISOString()
      });

      // Update user stats
      const userProfile = await kv.get(`user_profile:${user.id}`);
      if (userProfile) {
        userProfile.usage_stats.total_generations += 1;
        await kv.set(`user_profile:${user.id}`, userProfile);
      }

      console.log('Content generation completed successfully');
      return c.json({ 
        generation_id: generationId,
        content: generatedContent 
      });

    } catch (aiError) {
      console.error('智谱AI调用失败，使用备用模板:', aiError);
      
      // 如果AI调用失败，使用备用模板
      const backupContent = [
        {
          id: 1,
          title: '情感体验版',
          content: `用了${productName}已经快一个月了，真的要感谢小红书让我发现了这个宝藏产品！💕\n\n作为一个对产品很挑剔的人，这款产品刚开始用的时候还有点担心，但是坚持下来真的看到了改变。\n\n现在每天使用都能感受到它带来的愉悦体验，那种发自内心的满足感真的无法言喻～\n\n姐妹们如果也在寻找优质产品，真的可以试试这款！\n\n#好物分享 #种草 #生活好物`,
          tags: selectedTags,
          compliance: 'A',
          style: writingStyle
        },
        {
          id: 2,
          title: '专业分析版',
          content: `今天来详细分析一下${productName}的特点：\n\n✨ 主要优势：\n• 品质优良 - 材料精选，工艺精湛\n• 性价比高 - 价格合理，效果显著\n• 用户友好 - 操作简单，体验舒适\n\n📊 使用体验：\n经过一段时间的测试，整体满意度很高，各项指标表现优秀。质感上乘，适合各种使用场景。\n\n推荐给注重品质和性价比的小伙伴们！\n\n#产品评测 #品质生活 #推荐`,
          tags: selectedTags,
          compliance: 'A',
          style: writingStyle
        },
        {
          id: 3,
          title: '轻松种草版',
          content: `哈喽美少女们～今天又来分享好物啦！\n\n${productName}真的是我最近的心头好💕\n\n这个质感太治愈了吧！用起来超舒服，效果也很棒，每次使用都心情好好！\n\n价格也很美丽，学生党完全无压力🎉\n\n已经准备回购了，姐妹们快试试！\n\n#好物分享 #学生党福利 #日常好物 #种草`,
          tags: selectedTags,
          compliance: 'B',
          style: writingStyle
        }
      ];

      // Store generation result with backup content
      const generationId = `generation:${user.id}:${Date.now()}`;
      await kv.set(generationId, {
        id: generationId,
        user_id: user.id,
        product_name: productName,
        selected_tags: selectedTags,
        content_type: contentType,
        target_audience: targetAudience,
        writing_style: writingStyle,
        generated_content: backupContent,
        created_at: new Date().toISOString(),
        fallback_used: true
      });

      // Update user stats
      const userProfile = await kv.get(`user_profile:${user.id}`);
      if (userProfile) {
        userProfile.usage_stats.total_generations += 1;
        await kv.set(`user_profile:${user.id}`, userProfile);
      }

      return c.json({ 
        generation_id: generationId,
        content: backupContent,
        notice: '使用了备用模板生成内容'
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    return c.json({ error: '内容生成失败', details: error.message }, 500);
  }
});

// Get user's copywriting library
app.get('/make-server-7be2d7c8/library', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const generations = await kv.getByPrefix(`generation:${user.id}:`);
    
    const library = generations.map(item => ({
      id: item.value.id,
      title: `${item.value.product_name} - ${item.value.content_type}`,
      style: item.value.writing_style,
      type: item.value.content_type,
      date: item.value.created_at.split('T')[0],
      compliance: item.value.generated_content?.[0]?.compliance || 'A',
      published: false,
      saved: true,
      preview: item.value.generated_content?.[0]?.content?.substring(0, 50) + '...' || '内容预览...'
    }));

    return c.json({ library });
  } catch (error) {
    console.log('Library fetch error:', error);
    return c.json({ error: '获取文案库失败' }, 500);
  }
});

// Save copywriting to library
app.post('/make-server-7be2d7c8/library/save', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { generation_id, content_id } = await c.req.json();

    const savedItemId = `saved:${user.id}:${Date.now()}`;
    await kv.set(savedItemId, {
      id: savedItemId,
      user_id: user.id,
      generation_id,
      content_id,
      saved_at: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Save error:', error);
    return c.json({ error: '保存失败' }, 500);
  }
});

// ==================== FEEDBACK ROUTES ====================

// Submit feedback
app.post('/make-server-7be2d7c8/feedback', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { generation_id, satisfaction, tags, comment } = await c.req.json();

    const feedbackId = `feedback:${user.id}:${Date.now()}`;
    await kv.set(feedbackId, {
      id: feedbackId,
      user_id: user.id,
      generation_id,
      satisfaction,
      tags,
      comment,
      created_at: new Date().toISOString()
    });

    // Update user stats
    const userProfile = await kv.get(`user_profile:${user.id}`);
    if (userProfile) {
      userProfile.usage_stats.total_feedback += 1;
      await kv.set(`user_profile:${user.id}`, userProfile);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Feedback submission error:', error);
    return c.json({ error: '反馈提交失败' }, 500);
  }
});

// ==================== STYLE TRAINING ROUTES ====================

// Analyze user writing style
app.post('/make-server-7be2d7c8/style/analyze', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { training_text, account_tag } = await c.req.json();

    if (!training_text) {
      return c.json({ error: '训练文本不能为空' }, 400);
    }

    // 尝试使用智谱AI进行风格分析
    let styleAnalysis;
    try {
      const systemPrompt = `你是一位专业的文本风格分析师。请分析用户提供的文案，识别其写作风格特征：

请从以下维度进行分析：
1. 风格类型（如：亲切、幽默、专业、文艺等）
2. 常用词汇和短语
3. 句式特点
4. 情感倾向
5. 语言习惯

请返回JSON格式的分析结果。`;

      const prompt = `请分析以下文案的写作风格：\n\n${training_text}`;
      
      const aiResponse = await callZhipuAI(prompt, systemPrompt);
      
      try {
        styleAnalysis = JSON.parse(aiResponse);
      } catch {
        // 如果AI返回的不是JSON，创建默认分析
        styleAnalysis = {
          style_types: ['个人化', '真实感', '分享型'],
          word_frequency: ['真的', '推荐', '很好', '喜欢'],
          sentence_pattern: '多用陈述句和感叹句，语言亲切自然',
          emotional_tone: '积极正面，带有个人体验感',
          ai_analysis: aiResponse
        };
      }
    } catch (aiError) {
      console.log('Style analysis AI error, using fallback:', aiError);
      // AI分析失败时的备用分析
      styleAnalysis = {
        style_types: ['亲切', '真实', '分享'],
        word_frequency: ['真的', '推荐', '很好', '效果'],
        sentence_pattern: '多用感叹句和疑问句，语言生动活泼',
        emotional_tone: '积极正面，带有亲和力',
        analyzed_at: new Date().toISOString()
      };
    }

    // Store training data
    const trainingId = `training:${user.id}:${Date.now()}`;
    await kv.set(trainingId, {
      id: trainingId,
      user_id: user.id,
      training_text,
      account_tag,
      analysis_result: styleAnalysis,
      created_at: new Date().toISOString()
    });

    return c.json({ analysis: styleAnalysis });
  } catch (error) {
    console.log('Style analysis error:', error);
    return c.json({ error: '风格分析失败' }, 500);
  }
});

// Get user's style training data
app.get('/make-server-7be2d7c8/style/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const trainingSessions = await kv.getByPrefix(`training:${user.id}:`);
    
    return c.json({ 
      training_sessions: trainingSessions.map(item => item.value),
      total_sessions: trainingSessions.length
    });
  } catch (error) {
    console.log('Style profile fetch error:', error);
    return c.json({ error: '获取风格档案失败' }, 500);
  }
});

// ==================== USER PROFILE ROUTES ====================

// Get user profile
app.get('/make-server-7be2d7c8/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const profile = await kv.get(`user_profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: '用户档案未找到' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: '获取用户档案失败' }, 500);
  }
});

// Update user profile
app.put('/make-server-7be2d7c8/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const updates = await c.req.json();
    
    const currentProfile = await kv.get(`user_profile:${user.id}`);
    if (!currentProfile) {
      return c.json({ error: '用户档案未找到' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: '更新用户档案失败' }, 500);
  }
});

// Health check
app.get('/make-server-7be2d7c8/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ai_service: 'zhipu-ai',
    version: '2.0',
    env_check: {
      supabase_url: !!Deno.env.get('SUPABASE_URL'),
      supabase_anon_key: !!Deno.env.get('SUPABASE_ANON_KEY'),
      supabase_service_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      zhipu_api_key: !!Deno.env.get('ZHIPU_API_KEY')
    }
  });
});

// Test endpoint without auth
app.post('/make-server-7be2d7c8/test', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Test endpoint called with body:', body);
    return c.json({ 
      success: true, 
      message: 'Test endpoint working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);