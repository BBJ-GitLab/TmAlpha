/**
 * 用户服务模块 - 处理用户注册、登录等功能
 */

const fs = require('fs');
const path = require('path');

class UserService {
    constructor() {
        this.usersFile = path.join(__dirname, '../data/users.json');
        this.ensureDataDir();
        this.ensureUsersFile();
    }

    // 确保数据目录存在
    ensureDataDir() {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    // 确保用户文件存在
    ensureUsersFile() {
        if (!fs.existsSync(this.usersFile)) {
            fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
        }
    }

    // 读取用户数据
    readUsers() {
        try {
            const data = fs.readFileSync(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('读取用户文件失败:', error);
            return [];
        }
    }

    // 保存用户数据
    saveUsers(users) {
        try {
            fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
            return true;
        } catch (error) {
            console.error('保存用户文件失败:', error);
            return false;
        }
    }

    // 检查用户名是否存在
    isUsernameExists(username) {
        const users = this.readUsers();
        return users.some(user => user.username === username);
    }

    // 注册新用户
    register(username, password) {
        if (this.isUsernameExists(username)) {
            return { success: false, error: '用户名已存在' };
        }

        const users = this.readUsers();
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password, // 实际项目中应该加密
            createdAt: new Date().toISOString(),
            settings: {
                role: null,
                preferences: {
                    pace: 'relaxed',
                    break: 'often',
                    continuity: 'single'
                }
            }
        };

        users.push(newUser);
        const saved = this.saveUsers(users);

        if (saved) {
            return { success: true, user: newUser };
        } else {
            return { success: false, error: '注册失败' };
        }
    }

    // 用户登录
    login(username, password) {
        const users = this.readUsers();
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            return { success: true, user };
        } else {
            return { success: false, error: '用户名或密码错误' };
        }
    }

    // 更新用户设置
    updateUserSettings(userId, settings) {
        const users = this.readUsers();
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex !== -1) {
            users[userIndex].settings = { ...users[userIndex].settings, ...settings };
            const saved = this.saveUsers(users);
            return { success: saved, user: users[userIndex] };
        } else {
            return { success: false, error: '用户不存在' };
        }
    }

    // 根据ID获取用户
    getUserById(userId) {
        const users = this.readUsers();
        return users.find(user => user.id === userId);
    }

    // 根据用户名获取用户
    getUserByUsername(username) {
        const users = this.readUsers();
        return users.find(user => user.username === username);
    }
}

module.exports = new UserService();
