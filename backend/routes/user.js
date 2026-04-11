const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// 注册
router.post('/register', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: '请提供用户名和密码' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ success: false, error: '用户名长度应在3-20个字符之间' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: '密码长度至少6个字符' });
        }

        const result = userService.register(username, password);
        
        if (result.success) {
            // 不返回密码
            const { password, ...userWithoutPassword } = result.user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ success: false, error: '注册失败' });
    }
});

// 登录
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: '请提供用户名和密码' });
        }

        const result = userService.login(username, password);
        
        if (result.success) {
            // 不返回密码
            const { password, ...userWithoutPassword } = result.user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, error: '登录失败' });
    }
});

// 获取用户信息
router.get('/info/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const user = userService.getUserById(userId);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(404).json({ success: false, error: '用户不存在' });
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
});

// 更新用户设置
router.post('/settings/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { settings } = req.body;

        if (!settings) {
            return res.status(400).json({ success: false, error: '请提供设置信息' });
        }

        const result = userService.updateUserSettings(userId, settings);
        
        if (result.success) {
            const { password, ...userWithoutPassword } = result.user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('更新设置失败:', error);
        res.status(500).json({ success: false, error: '更新设置失败' });
    }
});

module.exports = router;
