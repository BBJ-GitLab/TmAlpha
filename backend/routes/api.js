const express = require('express');
const router = express.Router();
const timeService = require('../services/aiService');

// 简单的用户存储（生产环境应使用数据库）
const users = new Map();

router.post('/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('登录请求:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const user = users.get(username);
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    console.log('登录成功:', username);
    res.json({ 
      success: true, 
      user: { 
        username: user.username,
        role: user.role,
        preferences: user.preferences 
      } 
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

router.post('/user/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('注册请求:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度应为3-20个字符' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6个字符' });
    }

    if (users.has(username)) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    const newUser = {
      username,
      password,
      role: 'student',
      preferences: {
        pace: 'relaxed',
        break: 'often',
        continuity: 'single'
      },
      createdAt: new Date().toISOString()
    };

    users.set(username, newUser);
    
    console.log('注册成功:', username);
    res.json({ 
      success: true, 
      user: { 
        username: newUser.username,
        role: newUser.role,
        preferences: newUser.preferences 
      } 
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/generate-plan', async (req, res) => {
  try {
    const { tasks, userProfile } = req.body;
    
    console.log('收到请求，任务列表:', JSON.stringify(tasks, null, 2));
    console.log('用户配置:', JSON.stringify(userProfile, null, 2));
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: '请提供有效的任务列表' });
    }

    const plan = await timeService.generateTimePlan(tasks, userProfile);
    
    console.log('生成规划成功:', JSON.stringify(plan, null, 2));
    
    res.json({ success: true, plan });
  } catch (error) {
    console.error('生成规划失败:', error);
    res.status(500).json({ error: '生成规划失败，请稍后重试: ' + error.message });
  }
});

// 修改时间规划
router.post('/modify-plan', async (req, res) => {
  try {
    const { currentPlan, feedback } = req.body;
    
    if (!currentPlan || !feedback) {
      return res.status(400).json({ error: '请提供当前规划和修改意见' });
    }

    // AI 处理（待实现）
    const modifiedPlan = await aiService.modifyPlan(currentPlan, feedback);
    
    res.json({ success: true, plan: modifiedPlan });
  } catch (error) {
    console.error('修改规划失败:', error);
    res.status(500).json({ error: '修改规划失败，请稍后重试' });
  }
});

module.exports = router;