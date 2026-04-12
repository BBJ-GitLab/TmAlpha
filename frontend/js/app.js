// 时间规划器前端逻辑

// 全局状态
let tasks = [];
let currentPlan = null;
let currentPlanData = null;  // 存储当前规划数据
let currentUser = null;
let userProfile = {
    role: null,
    preferences: {
        pace: 'relaxed',
        break: 'often',
        continuity: 'single'
    }
};

// DeepSeek API 密钥
const DEEPSEEK_API_KEY = 'sk-432d471e52c64d5fb5b4884e27634e5b'; // 已设置用户提供的API密钥

// VIP状态
let isVIP = false;

// 模块切换
let activeModule = 'task';

// 任务相关
let taskTitle = '';
let taskTypes = [
    { label: '灵活时间', value: 'flexible' },
    { label: '固定时间', value: 'fixed' },
    { label: '时间区间', value: 'interval' }
];
let taskTypeIndex = 0;
let taskDuration = 60;
let durationUnits = ['分钟', '小时', '秒'];
let durationUnitIndex = 0;
let priorities = ['低优先级', '中优先级', '高优先级'];
let priorityIndex = 1;
let taskStartTime = '09:00';
let taskEndTime = '10:00';
let intervalStartTime = '09:00';
let intervalEndTime = '18:00';
let taskNote = '';

// 快速添加任务
let quickTaskTitle = '';

// 开始模块设置
let startTime = '08:00';
let startStates = ['精力充沛', '状态一般', '有点疲惫'];
let startStateIndex = 0;

// 结束模块设置
let endTime = '22:00';
let bedtimeRoutine = '';

// 休息模块设置
let shortBreakDuration = 5;
let longBreakDuration = 15;
let tasksBeforeLongBreak = 5;

// 高级选项设置
let conflictDetectionOptions = ['严格模式', '灵活模式', '关闭'];
let conflictDetectionIndex = 0;
let defaultTaskDuration = 60;
let timezones = ['本地时区', 'UTC'];
let timezoneIndex = 0;

// 提醒设置
let reminderSettings = {
    enabled: true,
    minutes: 0,
    sound: false
};

// 提醒定时器
let reminderTimers = [];

// 结果显示
let showResult = false;
let plan = {
    tasks: [],
    totalDuration: 0,
    breakCount: 0
};

// 模态框
let showHelpModal = false;

// 设备状态
let isLandscape = false;
let isLoading = false;

// 角色配置
const roleConfig = {
    student: {
        name: '学生',
        icon: '🎓',
        defaultTasks: ['完成作业', '复习功课', '阅读书籍', '运动锻炼'],
        suggestions: ['考试复习', '预习新课', '整理笔记', '参加社团']
    },
    worker: {
        name: '上班族',
        icon: '💼',
        defaultTasks: ['处理邮件', '参加会议', '完成报告', '团队沟通'],
        suggestions: ['项目规划', '客户沟通', '技能学习', '工作总结']
    },
    freelancer: {
        name: '自由职业',
        icon: '🎨',
        defaultTasks: ['创意工作', '客户对接', '项目管理', '自我提升'],
        suggestions: ['作品创作', '市场推广', '财务管理', '休息放松']
    },
    parent: {
        name: '家长',
        icon: '👨‍👩‍👧',
        defaultTasks: ['照顾孩子', '家务整理', '购物采购', '家庭时间'],
        suggestions: ['亲子活动', '家务分工', '孩子作业', '个人时间']
    }
};

// AI 服务类 - 智能时间规划器
class AIService {
  constructor() {
    this.PRIORITY_WEIGHT = {
      high: 100,
      medium: 50,
      low: 10
    };

    this.TIME_SLOTS = {
      morning: { start: 8, end: 12, name: '早晨', factor: 1.3 },
      afternoon: { start: 13, end: 17, name: '下午', factor: 1.0 },
      evening: { start: 18, end: 22, name: '晚上', factor: 0.8 }
    };

    this.BREAK_CONFIG = {
      afterTaskDuration: 0,
      breakDuration: 5,
      afterTasks: 5,
      longBreakDuration: 30,
      lunchBreak: { start: 12, end: 13, duration: 60 },
      dinnerBreak: { start: 18, end: 19, duration: 60 }
    };

    this.userProfile = {
      role: null,
      preferences: {
        pace: 'relaxed',
        break: 'often',
        continuity: 'single'
      }
    };

    this.ROLE_CONFIGS = {
      student: {
        startTime: 8,
        endTime: 22,
        lunchBreak: { start: 12, end: 13, duration: 60 },
        dinnerBreak: { start: 18, end: 19, duration: 60 },
        taskTypes: ['学习', '作业', '复习', '考试', '阅读', '运动', '休息']
      },
      worker: {
        startTime: 9,
        endTime: 18,
        lunchBreak: { start: 12, end: 13, duration: 60 },
        dinnerBreak: null,
        taskTypes: ['工作', '会议', '邮件', '报告', '项目', '沟通', '学习']
      },
      freelancer: {
        startTime: 8,
        endTime: 23,
        lunchBreak: { start: 12, end: 14, duration: 120 },
        dinnerBreak: { start: 18, end: 19, duration: 60 },
        taskTypes: ['创意', '客户', '项目', '管理', '学习', '休息', '运动']
      },
      parent: {
        startTime: 6,
        endTime: 22,
        lunchBreak: { start: 12, end: 13, duration: 60 },
        dinnerBreak: { start: 18, end: 19, duration: 60 },
        taskTypes: ['家务', '孩子', '购物', '家庭', '个人', '休息', '运动']
      }
    };

    this.PREFERENCE_CONFIGS = {
      pace: {
        relaxed: { breakDuration: 10, afterTasks: 3, longBreakDuration: 45 },
        balanced: { breakDuration: 5, afterTasks: 5, longBreakDuration: 30 },
        intensive: { breakDuration: 3, afterTasks: 8, longBreakDuration: 20 }
      },
      break: {
        often: { breakDuration: 10, afterTasks: 3 },
        normal: { breakDuration: 5, afterTasks: 5 },
        rare: { breakDuration: 3, afterTasks: 8 }
      },
      continuity: {
        single: { batchSize: 1, switchPenalty: 0 },
        mixed: { batchSize: 3, switchPenalty: 5 },
        batch: { batchSize: 5, switchPenalty: 10 }
      }
    };
  }

  setUserProfile(profile) {
    if (profile) {
      this.userProfile = { ...this.userProfile, ...profile };
      this.updateConfigByProfile();
    }
  }

  updateConfigByProfile() {
    const { role, preferences } = this.userProfile;
    
    if (role && this.ROLE_CONFIGS[role]) {
      const roleConfig = this.ROLE_CONFIGS[role];
      this.BREAK_CONFIG.lunchBreak = roleConfig.lunchBreak;
      this.BREAK_CONFIG.dinnerBreak = roleConfig.dinnerBreak;
    }
    
    if (preferences) {
      if (preferences.pace && this.PREFERENCE_CONFIGS.pace[preferences.pace]) {
        const paceConfig = this.PREFERENCE_CONFIGS.pace[preferences.pace];
        this.BREAK_CONFIG.breakDuration = paceConfig.breakDuration;
        this.BREAK_CONFIG.afterTasks = paceConfig.afterTasks;
        this.BREAK_CONFIG.longBreakDuration = paceConfig.longBreakDuration;
      }
      
      if (preferences.break && this.PREFERENCE_CONFIGS.break[preferences.break]) {
        const breakConfig = this.PREFERENCE_CONFIGS.break[preferences.break];
        this.BREAK_CONFIG.breakDuration = breakConfig.breakDuration;
        this.BREAK_CONFIG.afterTasks = breakConfig.afterTasks;
      }
    }
  }

  async generateTimePlan(tasks, userProfile = null) {
    if (userProfile) {
      this.setUserProfile(userProfile);
    }
    
    const sortedTasks = this.smartSortTasks(tasks);
    const plannedTasks = this.calculateTimeSchedule(sortedTasks);
    
    return {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      tasks: plannedTasks,
      totalDuration: plannedTasks.reduce((sum, task) => sum + task.duration, 0),
      breakCount: plannedTasks.filter(t => t.type === 'break').length,
      algorithm: 'smart-priority-time-slot',
      userProfile: this.userProfile
    };
  }

  smartSortTasks(tasks) {
    const taskList = JSON.parse(JSON.stringify(tasks));
    const fixedTasks = taskList.filter(t => t.type === 'fixed');
    const intervalTasks = taskList.filter(t => t.type === 'interval');
    const flexibleTasks = taskList.filter(t => t.type !== 'fixed' && t.type !== 'interval');
    
    const scoredTasks = flexibleTasks.map(task => ({
      ...task,
      score: this.calculateTaskScore(task)
    }));
    
    scoredTasks.sort((a, b) => b.score - a.score);
    
    return [...fixedTasks, ...intervalTasks, ...scoredTasks];
  }

  calculateTaskScore(task) {
    const priorityWeight = this.PRIORITY_WEIGHT[task.priority] || this.PRIORITY_WEIGHT.medium;
    
    let durationAdjustment = 0;
    if (task.duration >= 60 && task.duration <= 90) {
      durationAdjustment = 20;
    } else if (task.duration > 120) {
      durationAdjustment = -10;
    }
    
    return priorityWeight + durationAdjustment;
  }

  calculateTimeSchedule(sortedTasks) {
    try {
      const plannedTasks = [];
      let currentTime = this.getOptimalStartTime();
      let completedTasks = 0;
      const fixedTimeSlots = [];
      let lunchBreakAdded = false;
      let dinnerBreakAdded = false;

      // 首先处理固定时间任务，收集固定时间槽
      sortedTasks.forEach((task) => {
        if (task.type === 'fixed') {
          fixedTimeSlots.push({
            start: this.timeToMinutes(task.fixedStartTime),
            end: this.timeToMinutes(task.fixedEndTime)
          });
        }
      });

      sortedTasks.forEach((task, index) => {
        if (task.type === 'fixed') {
          const plannedTask = {
            id: index + 1,
            title: task.title,
            duration: task.duration || 60,
            priority: task.priority || 'medium',
            type: 'task',
            taskType: 'fixed',
            timeSlot: this.getTimeSlotName(task.fixedStartTime),
            startTime: task.fixedStartTime,
            endTime: task.fixedEndTime,
            note: task.note || ''
          };
          
          plannedTasks.push(plannedTask);
          completedTasks++;
        } else if (task.type === 'interval') {
          // 时间区间任务：在指定区间内灵活安排
          const intervalStart = this.timeToMinutes(task.intervalStartTime);
          const intervalEnd = this.timeToMinutes(task.intervalEndTime);
          
          // 调整当前时间到区间开始时间
          if (this.timeToMinutes(this.formatTime(currentTime)) < intervalStart) {
            const intervalStartDate = new Date(currentTime);
            const [hours, minutes] = task.intervalStartTime.split(':').map(Number);
            intervalStartDate.setHours(hours, minutes, 0, 0);
            currentTime = intervalStartDate;
          }
          
          // 检查是否在区间内
          while (this.timeToMinutes(this.formatTime(currentTime)) < intervalEnd) {
            const currentHour = currentTime.getHours();
            
            if (!lunchBreakAdded && currentHour >= 12 && currentHour < 13) {
              const lunchBreak = {
                id: 'lunch',
                title: '🍱 午餐休息',
                duration: this.BREAK_CONFIG.lunchBreak.duration,
                priority: 'low',
                type: 'break',
                breakType: 'meal',
                timeSlot: '午餐',
                startTime: '12:00',
                endTime: '13:00'
              };
              plannedTasks.push(lunchBreak);
              fixedTimeSlots.push({
                start: 12 * 60,
                end: 13 * 60
              });
              lunchBreakAdded = true;
              currentTime = new Date(currentTime);
              currentTime.setHours(13, 0, 0, 0);
              continue;
            }
            
            if (!dinnerBreakAdded && currentHour >= 18 && currentHour < 19) {
              const dinnerBreak = {
                id: 'dinner',
                title: '🍽️ 晚餐休息',
                duration: this.BREAK_CONFIG.dinnerBreak.duration,
                priority: 'low',
                type: 'break',
                breakType: 'meal',
                timeSlot: '晚餐',
                startTime: '18:00',
                endTime: '19:00'
              };
              plannedTasks.push(dinnerBreak);
              fixedTimeSlots.push({
                start: 18 * 60,
                end: 19 * 60
              });
              dinnerBreakAdded = true;
              currentTime = new Date(currentTime);
              currentTime.setHours(19, 0, 0, 0);
              continue;
            }
            
            // 检查是否在区间内
            if (this.timeToMinutes(this.formatTime(currentTime)) >= intervalEnd) {
              break;
            }
            
            currentTime = this.findNextAvailableTime(currentTime, fixedTimeSlots, task.duration);
            
            // 再次检查是否在区间内
            if (this.timeToMinutes(this.formatTime(currentTime)) >= intervalEnd) {
              break;
            }
            
            const plannedEndTime = new Date(currentTime.getTime() + task.duration * 60000);
            if (this.timeToMinutes(this.formatTime(plannedEndTime)) > intervalEnd) {
              break;
            }
            
            const timeSlot = this.getBestTimeSlot(currentTime, task);
            
            const plannedTask = {
              id: index + 1,
              title: task.title,
              duration: task.duration || 60,
              priority: task.priority || 'medium',
              type: 'task',
              taskType: 'interval',
              timeSlot: timeSlot.name,
              startTime: this.formatTime(currentTime),
              endTime: this.formatTime(plannedEndTime),
              note: task.note || ''
            };
            
            plannedTasks.push(plannedTask);
            
            // 添加到固定时间槽，避免重复安排
            fixedTimeSlots.push({
              start: this.timeToMinutes(plannedTask.startTime),
              end: this.timeToMinutes(plannedTask.endTime)
            });
            
            currentTime = plannedEndTime;
            completedTasks++;
            
            // 添加任务间休息
            if (this.shouldAddBreak(task, completedTasks) && index < sortedTasks.length - 1) {
              const breakDuration = this.getBreakDuration(completedTasks);
              currentTime = this.findNextAvailableTime(currentTime, fixedTimeSlots, breakDuration);
              
              // 检查休息时间是否在区间内
              const breakEndTime = new Date(currentTime.getTime() + breakDuration * 60000);
              if (this.timeToMinutes(this.formatTime(breakEndTime)) <= intervalEnd) {
                const breakTask = {
                  id: index + 1.5,
                  title: this.getBreakTitle(completedTasks),
                  duration: breakDuration,
                  priority: 'low',
                  type: 'break',
                  timeSlot: timeSlot.name,
                  startTime: this.formatTime(currentTime),
                  endTime: this.formatTime(breakEndTime)
                };
                plannedTasks.push(breakTask);
                
                // 添加休息时间到固定时间槽
                fixedTimeSlots.push({
                  start: this.timeToMinutes(breakTask.startTime),
                  end: this.timeToMinutes(breakTask.endTime)
                });
                
                currentTime = breakEndTime;
              }
            }
            
            // 只安排一个时间区间任务实例
            break;
          }
        } else {
          const currentHour = currentTime.getHours();
          
          if (!lunchBreakAdded && currentHour >= 12 && currentHour < 13) {
            const lunchBreak = {
              id: 'lunch',
              title: '🍱 午餐休息',
              duration: this.BREAK_CONFIG.lunchBreak.duration,
              priority: 'low',
              type: 'break',
              breakType: 'meal',
              timeSlot: '午餐',
              startTime: '12:00',
              endTime: '13:00'
            };
            plannedTasks.push(lunchBreak);
            fixedTimeSlots.push({
              start: 12 * 60,
              end: 13 * 60
            });
            lunchBreakAdded = true;
            currentTime = new Date(currentTime);
            currentTime.setHours(13, 0, 0, 0);
          }
          
          if (!dinnerBreakAdded && currentHour >= 18 && currentHour < 19) {
            const dinnerBreak = {
              id: 'dinner',
              title: '🍽️ 晚餐休息',
              duration: this.BREAK_CONFIG.dinnerBreak.duration,
              priority: 'low',
              type: 'break',
              breakType: 'meal',
              timeSlot: '晚餐',
              startTime: '18:00',
              endTime: '19:00'
            };
            plannedTasks.push(dinnerBreak);
            fixedTimeSlots.push({
              start: 18 * 60,
              end: 19 * 60
            });
            dinnerBreakAdded = true;
            currentTime = new Date(currentTime);
            currentTime.setHours(19, 0, 0, 0);
          }
          
          currentTime = this.findNextAvailableTime(currentTime, fixedTimeSlots, task.duration);
          
          const timeSlot = this.getBestTimeSlot(currentTime, task);
          
          const plannedTask = {
            id: index + 1,
            title: task.title,
            duration: task.duration || 60,
            priority: task.priority || 'medium',
            type: 'task',
            taskType: 'flexible',
            timeSlot: timeSlot.name,
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(new Date(currentTime.getTime() + task.duration * 60000)),
            note: task.note || ''
          };
          
          plannedTasks.push(plannedTask);
          
          currentTime = new Date(currentTime.getTime() + task.duration * 60000);
          completedTasks++;
          
          const breakNeeded = this.shouldAddBreak(task, completedTasks);
          if (breakNeeded && index < sortedTasks.length - 1) {
            const breakDuration = this.getBreakDuration(completedTasks);
            currentTime = this.findNextAvailableTime(currentTime, fixedTimeSlots, breakDuration);
            
            const breakTask = {
              id: index + 1.5,
              title: this.getBreakTitle(completedTasks),
              duration: breakDuration,
              priority: 'low',
              type: 'break',
              timeSlot: timeSlot.name,
              startTime: this.formatTime(currentTime),
              endTime: this.formatTime(new Date(currentTime.getTime() + breakDuration * 60000))
            };
            plannedTasks.push(breakTask);
            
            // 添加休息时间到固定时间槽
            fixedTimeSlots.push({
              start: this.timeToMinutes(breakTask.startTime),
              end: this.timeToMinutes(breakTask.endTime)
            });
            
            currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
          }
        }
      });

      return this.sortByStartTime(plannedTasks);
    } catch (error) {
      console.error('calculateTimeSchedule 错误:', error);
      throw error;
    }
  }

  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getTimeSlotName(timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour >= 8 && hour < 12) return '早晨';
    if (hour >= 13 && hour < 17) return '下午';
    if (hour >= 18 && hour < 22) return '晚上';
    return '其他';
  }

  findNextAvailableTime(currentTime, fixedSlots, duration) {
    let checkTime = new Date(currentTime);
    let attempts = 0;
    const maxAttempts = 100; // 防止无限循环

    while (attempts < maxAttempts) {
      const currentMinutes = checkTime.getHours() * 60 + checkTime.getMinutes();
      const endMinutes = currentMinutes + duration;
      
      // 检查是否超过当天结束时间（24:00）
      if (endMinutes >= 24 * 60) {
        // 移到第二天早上8点
        const nextDay = new Date(checkTime);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(8, 0, 0, 0);
        return nextDay;
      }

      let hasConflict = false;
      
      for (const slot of fixedSlots) {
        // 检查当前时间段是否与固定时间槽冲突
        if (currentMinutes < slot.end && endMinutes > slot.start) {
          // 有冲突，移到当前固定槽结束后
          const newTime = new Date(checkTime);
          newTime.setHours(Math.floor(slot.end / 60), slot.end % 60, 0, 0);
          checkTime = newTime;
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        return checkTime;
      }

      attempts++;
    }

    // 如果尝试次数过多，返回当前时间（作为 fallback）
    return currentTime;
  }

  sortByStartTime(plannedTasks) {
    return plannedTasks.sort((a, b) => {
      const timeA = this.timeToMinutes(a.startTime);
      const timeB = this.timeToMinutes(b.startTime);
      return timeA - timeB;
    });
  }

  getOptimalStartTime() {
    const now = new Date();
    const morningStart = new Date(now);
    morningStart.setHours(8, 0, 0, 0);
    
    if (now.getHours() >= 8) {
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      return now;
    }
    
    return morningStart;
  }

  getBestTimeSlot(currentTime, task) {
    const hour = currentTime.getHours();
    
    for (const slotName in this.TIME_SLOTS) {
      const slot = this.TIME_SLOTS[slotName];
      if (hour >= slot.start && hour < slot.end) {
        return slot;
      }
    }
    
    return this.TIME_SLOTS.afternoon;
  }

  shouldAddBreak(task, completedTasks) {
    return true;
  }

  getBreakDuration(completedTasks) {
    if (completedTasks % this.BREAK_CONFIG.afterTasks === 0) {
      return this.BREAK_CONFIG.longBreakDuration;
    }
    
    return this.BREAK_CONFIG.breakDuration;
  }

  getBreakTitle(completedTasks) {
    if (completedTasks % this.BREAK_CONFIG.afterTasks === 0) {
      return '☕ 长休息（完成5个任务）';
    }
    return '💧 休息5分钟';
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

const aiService = new AIService();

// DOM 元素
let taskInput, taskType, durationUnit, taskPriority, fixedTimeRow, intervalTimeRow, addTaskBtn, taskList, generatePlanBtn, resultSection, planContainer, feedbackInput, modifyPlanBtn, loadingOverlay;
let roleModal, roleCards, prefButtons, confirmRoleBtn, userInfo, userRole, userName, changeRoleBtn, logoutBtn;
let authModal, usernameInput, startBtn;

// 初始化
function init() {
    initElements();
    bindEvents();
    initOrientationListener();
    initUserProfile();
}

// 初始化DOM元素
function initElements() {
    // 任务相关元素
    taskInput = document.getElementById('taskInput');
    taskType = document.getElementById('taskType');
    taskDuration = document.getElementById('taskDuration');
    durationUnit = document.getElementById('durationUnit');
    taskPriority = document.getElementById('taskPriority');
    taskStartTime = document.getElementById('taskStartTime');
    taskEndTime = document.getElementById('taskEndTime');
    taskNote = document.getElementById('taskNote');
    fixedTimeRow = document.getElementById('fixedTimeRow');
    intervalTimeRow = document.getElementById('intervalTimeRow');
    intervalStartTime = document.getElementById('intervalStartTime');
    intervalEndTime = document.getElementById('intervalEndTime');
    addTaskBtn = document.getElementById('addTaskBtn');
    taskList = document.getElementById('taskList');
    generatePlanBtn = document.getElementById('generatePlanBtn');
    resultSection = document.getElementById('resultSection');
    planContainer = document.getElementById('planContainer');
    feedbackInput = document.getElementById('feedbackInput');
    modifyPlanBtn = document.getElementById('modifyPlanBtn');
    loadingOverlay = document.getElementById('loadingOverlay');

    // 角色选择相关元素
    roleModal = document.getElementById('roleModal');
    roleCards = document.querySelectorAll('.role-card');
    prefButtons = document.querySelectorAll('.pref-btn');
    confirmRoleBtn = document.getElementById('confirmRoleBtn');
    userInfo = document.getElementById('userInfo');
    userRole = document.getElementById('userRole');
    userName = document.getElementById('userName');
    changeRoleBtn = document.getElementById('changeRoleBtn');
    logoutBtn = document.getElementById('logoutBtn');

    // 简单登录相关元素
    authModal = document.getElementById('authModal');
    usernameInput = document.getElementById('usernameInput');
    startBtn = document.getElementById('startBtn');
    

    
    // 提醒相关元素
    enableReminders = document.getElementById('enableReminders');
    reminderMinutes = document.getElementById('reminderMinutes');
    enableSound = document.getElementById('enableSound');
    reminderNotification = document.getElementById('reminderNotification');
    reminderTaskName = document.getElementById('reminderTaskName');
    reminderTaskTime = document.getElementById('reminderTaskTime');
    reminderDismiss = document.getElementById('reminderDismiss');
    reminderView = document.getElementById('reminderView');
}

// 横屏检测
function initOrientationListener() {
    const orientationWarning = document.getElementById('orientationWarning');
    
    function checkOrientation() {
        // 检测是否是移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && window.innerWidth > window.innerHeight) {
            // 移动设备且横屏
            orientationWarning.classList.add('show');
        } else {
            orientationWarning.classList.remove('show');
        }
    }
    
    // 初始化检查
    checkOrientation();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkOrientation);
    
    // 监听设备方向变化
    window.addEventListener('orientationchange', checkOrientation);
}

// 初始化用户配置
function initUserProfile() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
            hideAuthModal();
            hideRoleModal();
            showUserInfo();
            loadRoleDefaultTasks();
        } else {
            hideAuthModal();
            showRoleModal();
        }
    } else {
        showAuthModal();
    }
}

// 显示角色选择弹窗
function showRoleModal() {
    roleModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 隐藏角色选择弹窗
function hideRoleModal() {
    roleModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 显示用户信息
function showUserInfo() {
    if (userProfile.role && roleConfig[userProfile.role]) {
        const role = roleConfig[userProfile.role];
        userRole.textContent = `${role.icon} ${role.name}`;
        if (currentUser) {
            userName.textContent = `用户: ${currentUser.username}`;
        }
        
        // 显示VIP标识
        const vipBadge = document.getElementById('vipBadge');
        if (vipBadge) {
            vipBadge.style.display = isVIP ? 'inline-block' : 'none';
        }
        
        userInfo.style.display = 'flex';
    }
}

// 显示登录注册弹窗
function showAuthModal() {
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 隐藏登录注册弹窗
function hideAuthModal() {
    authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 加载角色默认任务
function loadRoleDefaultTasks() {
    if (userProfile.role && roleConfig[userProfile.role]) {
        const config = roleConfig[userProfile.role];
        // 可以在这里预加载一些默认任务建议
        console.log('已加载角色配置:', config);
    }
}

// 绑定事件
function bindEvents() {
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (generatePlanBtn) generatePlanBtn.addEventListener('click', generatePlan);
    if (modifyPlanBtn) modifyPlanBtn.addEventListener('click', modifyPlan);
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    if (taskType) {
        taskType.addEventListener('change', () => {
            if (taskType.value === 'fixed') {
                fixedTimeRow.style.display = 'flex';
                intervalTimeRow.style.display = 'none';
                updateEndTimeFromDuration();
            } else if (taskType.value === 'interval') {
                fixedTimeRow.style.display = 'none';
                intervalTimeRow.style.display = 'flex';
            } else {
                fixedTimeRow.style.display = 'none';
                intervalTimeRow.style.display = 'none';
            }
        });
    }

    if (taskStartTime) taskStartTime.addEventListener('change', updateEndTimeFromDuration);
    if (taskDuration) taskDuration.addEventListener('change', updateEndTimeFromDuration);
    if (durationUnit) durationUnit.addEventListener('change', updateEndTimeFromDuration);

    // 角色选择事件
    if (roleCards) {
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                roleCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                userProfile.role = card.dataset.role;
            });
        });
    }

    // 偏好按钮事件
    if (prefButtons) {
        prefButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prefType = btn.dataset.pref;
                const prefValue = btn.dataset.value;
                
                // 移除同组其他按钮的active状态
                document.querySelectorAll(`.pref-btn[data-pref="${prefType}"]`).forEach(b => {
                    b.classList.remove('active');
                });
                
                // 添加当前按钮的active状态
                btn.classList.add('active');
                
                // 更新用户偏好
                userProfile.preferences[prefType] = prefValue;
            });
        });
    }

    // 确认角色按钮
    if (confirmRoleBtn) {
        confirmRoleBtn.addEventListener('click', () => {
            if (!userProfile.role) {
                showNotification('请选择一个角色', 'error');
                return;
            }
            
            // 保存到本地存储
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            hideRoleModal();
            showUserInfo();
            loadRoleDefaultTasks();
            showNotification(`欢迎使用，${roleConfig[userProfile.role].name}！`, 'success');
        });
    }

    // 切换角色按钮
    if (changeRoleBtn) {
        changeRoleBtn.addEventListener('click', () => {
            showRoleModal();
        });
    }

    // 退出登录按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // 帮助按钮
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpModalClose = document.getElementById('helpModalClose');
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.add('active');
        });
    }

    if (helpModalClose) {
        helpModalClose.addEventListener('click', () => {
            helpModal.classList.remove('active');
        });
    }

    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.remove('active');
            }
        });
    }

    // 开始使用按钮
    if (startBtn) {
        startBtn.addEventListener('click', simpleLogin);
    }

    // 回车键登录
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                simpleLogin();
            }
        });
    }

    // 模块栏切换
    const moduleBtns = document.querySelectorAll('.module-btn');
    const moduleContents = document.querySelectorAll('.module-content');
    
    if (moduleBtns) {
        moduleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有按钮的active状态
                moduleBtns.forEach(b => b.classList.remove('active'));
                // 添加当前按钮的active状态
                btn.classList.add('active');
                
                // 隐藏所有模块内容
                moduleContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // 显示对应的模块内容
                const moduleName = btn.dataset.module;
                const targetModule = document.getElementById(moduleName + 'Module');
                if (targetModule) {
                    targetModule.style.display = 'block';
                }
                
                activeModule = moduleName;
                console.log('切换到模块:', moduleName);
            });
        });
    }

    // 快速添加任务
    const quickAddButtons = document.querySelectorAll('.quick-add-btn');
    if (quickAddButtons) {
        quickAddButtons.forEach(btn => {
            btn.addEventListener('click', addTaskFromModule);
        });
    }

    // 快速输入框回车
    const quickInputFields = document.querySelectorAll('.quick-task-input');
    if (quickInputFields) {
        quickInputFields.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTaskFromModule();
                }
            });
        });
    }

    // 开始模块设置
    const startTimeInput = document.getElementById('startTimeInput');
    const startStateSelect = document.getElementById('startStateSelect');
    const saveStartSettings = document.getElementById('saveStartSettings');
    
    if (startTimeInput) startTimeInput.addEventListener('change', (e) => startTime = e.target.value);
    if (startStateSelect) startStateSelect.addEventListener('change', (e) => startStateIndex = e.target.value);
    if (saveStartSettings) saveStartSettings.addEventListener('click', saveStartSettingsFunc);

    // 结束模块设置
    const endTimeInput = document.getElementById('endTimeInput');
    const bedtimeRoutineInput = document.getElementById('bedtimeRoutine');
    const saveEndSettings = document.getElementById('saveEndSettings');
    
    if (endTimeInput) endTimeInput.addEventListener('change', (e) => endTime = e.target.value);
    if (bedtimeRoutineInput) bedtimeRoutineInput.addEventListener('input', (e) => bedtimeRoutine = e.target.value);
    if (saveEndSettings) saveEndSettings.addEventListener('click', saveEndSettingsFunc);

    // 休息模块设置
    const shortBreakDurationInput = document.getElementById('shortBreakDuration');
    const longBreakDurationInput = document.getElementById('longBreakDuration');
    const tasksBeforeLongBreakInput = document.getElementById('tasksBeforeLongBreak');
    const saveBreakSettings = document.getElementById('saveBreakSettings');
    
    if (shortBreakDurationInput) shortBreakDurationInput.addEventListener('input', (e) => shortBreakDuration = e.target.value);
    if (longBreakDurationInput) longBreakDurationInput.addEventListener('input', (e) => longBreakDuration = e.target.value);
    if (tasksBeforeLongBreakInput) tasksBeforeLongBreakInput.addEventListener('input', (e) => tasksBeforeLongBreak = e.target.value);
    if (saveBreakSettings) saveBreakSettings.addEventListener('click', saveBreakSettingsFunc);

    // 高级选项设置
    const conflictDetection = document.getElementById('conflictDetection');
    const defaultTaskDurationInput = document.getElementById('defaultTaskDuration');
    const timezoneSelect = document.getElementById('timezoneSelect');
    const saveAdvancedSettings = document.getElementById('saveAdvancedSettings');
    
    if (conflictDetection) conflictDetection.addEventListener('change', (e) => conflictDetectionIndex = e.target.value);
    if (defaultTaskDurationInput) defaultTaskDurationInput.addEventListener('input', (e) => defaultTaskDuration = e.target.value);
    if (timezoneSelect) timezoneSelect.addEventListener('change', (e) => timezoneIndex = e.target.value);
    if (saveAdvancedSettings) saveAdvancedSettings.addEventListener('click', saveAdvancedSettingsFunc);
    
    // 提醒设置
    if (enableReminders) enableReminders.addEventListener('change', (e) => reminderSettings.enabled = e.target.checked);
    if (reminderMinutes) reminderMinutes.addEventListener('input', (e) => reminderSettings.minutes = parseInt(e.target.value));
    if (enableSound) enableSound.addEventListener('change', (e) => reminderSettings.sound = e.target.checked);
    
    // 提醒通知事件
    if (reminderDismiss) reminderDismiss.addEventListener('click', hideReminderNotification);
    if (reminderView) reminderView.addEventListener('click', viewReminderTask);
    

}

// 简单登录（仅用户名）
// 检查VIP状态
function checkVIPStatus() {
    // 这里简化处理，实际项目中可能需要从服务器获取
    // 暂时设置为true，演示VIP功能
    isVIP = true;
    localStorage.setItem('isVIP', 'true');
}

function simpleLogin() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showNotification('请输入用户名', 'error');
        return;
    }
    
    if (username.length < 2 || username.length > 20) {
        showNotification('用户名长度应在2-20个字符之间', 'error');
        return;
    }
    
    // 检查VIP状态
    checkVIPStatus();
    
    // 创建用户对象
    currentUser = {
        username: username,
        role: 'student',
        preferences: {
            pace: 'relaxed',
            break: 'often',
            continuity: 'single'
        }
    };
    
    // 保存到本地存储
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // 检查是否已有角色配置
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        hideAuthModal();
        showUserInfo();
        loadRoleDefaultTasks();
        showNotification(`欢迎回来，${username}！`, 'success');
    } else {
        hideAuthModal();
        showRoleModal();
        showNotification(`欢迎，${username}！请选择您的角色`, 'success');
    }
}

// 退出登录
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    userInfo.style.display = 'none';
    showAuthModal();
    showNotification('已退出登录', 'success');
}

function updateEndTimeFromDuration() {
    if (taskType && taskType.value === 'fixed' && taskStartTime && taskStartTime.value) {
        const [hours, minutes] = taskStartTime.value.split(':').map(Number);
        const durationValue = parseInt(taskDuration.value);
        const unit = durationUnit.value;
        
        let durationInMinutes = durationValue;
        if (unit === 'hours') {
            durationInMinutes = durationValue * 60;
        } else if (unit === 'seconds') {
            durationInMinutes = Math.ceil(durationValue / 60);
        }
        
        const endMinutes = hours * 60 + minutes + durationInMinutes;
        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMins = endMinutes % 60;
        if (taskEndTime) {
            taskEndTime.value = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        }
    }
}

// 添加任务
function addTask() {
    try {
        if (!taskInput) return;
        
        const title = taskInput.value.trim();
        
        if (!title) {
            showNotification('请输入任务名称', 'error');
            return;
        }

        if (title.length > 100) {
            showNotification('任务名称不能超过100个字符', 'error');
            return;
        }

        if (/[<>{}\\/]/.test(title)) {
            showNotification('任务名称不能包含特殊字符 < > { } \\ /', 'error');
            return;
        }

        const type = taskType.value;
        const note = taskNote.value.trim();
        const durationValue = parseInt(taskDuration.value);
        const unit = durationUnit.value;
        
        let durationInMinutes = durationValue;
        if (unit === 'hours') {
            durationInMinutes = durationValue * 60;
        } else if (unit === 'seconds') {
            durationInMinutes = Math.ceil(durationValue / 60);
        }

        const task = {
            id: Date.now(),
            title: title,
            duration: durationInMinutes,
            priority: taskPriority.value,
            type: type,
            note: note
        };

        if (type === 'fixed') {
            if (!taskStartTime.value) {
                showNotification('请选择开始时间', 'error');
                return;
            }
            task.fixedStartTime = taskStartTime.value;
            task.fixedEndTime = taskEndTime.value;
        } else if (type === 'interval') {
            if (!intervalStartTime.value || !intervalEndTime.value) {
                showNotification('请选择区间开始和结束时间', 'error');
                return;
            }
            task.intervalStartTime = intervalStartTime.value;
            task.intervalEndTime = intervalEndTime.value;
        }

        tasks.push(task);
        renderTasks();
        
        taskInput.value = '';
        taskNote.value = '';
        taskInput.focus();
        
        if (generatePlanBtn) {
            generatePlanBtn.disabled = false;
        }
        showNotification('任务添加成功！', 'success');
    } catch (error) {
        console.error('添加任务失败:', error);
        showNotification('添加任务失败，请重试', 'error');
    }
}

// 快速添加任务
function addTaskFromModule(quickInput) {
    // 如果没有传入输入框，尝试获取当前模块的输入框
    if (!quickInput) {
        // 获取当前活动模块的输入框
        const activeModuleName = activeModule || 'task';
        quickInput = document.querySelector(`.${activeModuleName}-module .quick-task-input`);
        
        // 如果还是没有找到，获取第一个输入框
        if (!quickInput) {
            quickInput = document.querySelector('.quick-task-input');
        }
        
        if (!quickInput) {
            showNotification('未找到输入框', 'error');
            return;
        }
    }
    
    const title = quickInput.value.trim();
    
    if (!title) {
        showNotification('请输入任务名称', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        type: 'flexible',
        duration: 60,
        priority: 'medium',
        note: ''
    };
    
    tasks.push(task);
    renderTasks();
    
    quickInput.value = '';
    quickInput.focus();
    
    if (generatePlanBtn) {
        generatePlanBtn.disabled = false;
    }
    showNotification('任务添加成功！', 'success');
}

// 渲染任务列表
function renderTasks() {
    if (!taskList) return;
    
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>还没有添加任务，开始添加你的第一个任务吧！</p>
            </div>
        `;
        if (generatePlanBtn) {
            generatePlanBtn.disabled = true;
        }
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.type === 'fixed' ? 'task-fixed' : ''}">
            <div class="task-info">
                <div class="task-title">
                    ${escapeHtml(task.title)}
                    <span class="type-badge type-${task.type}">
                        ${task.type === 'fixed' ? '📌 固定' : '🔄 灵活'}
                    </span>
                    <span class="priority-badge priority-${task.priority}">
                        ${getPriorityText(task.priority)}
                    </span>
                </div>
                <div class="task-meta">
                    ⏱️ ${task.duration} 分钟
                    ${task.type === 'fixed' ? `| 🕐 ${task.fixedStartTime} - ${task.fixedEndTime}` : ''}
                    ${task.note ? `| 📝 ${escapeHtml(task.note)}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(${task.id})"><!--
                    -->删除
                </button>
            </div>
        </div>
    `).join('');
}

// 删除任务
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
    
    if (tasks.length === 0 && generatePlanBtn) {
        generatePlanBtn.disabled = true;
    }
}

// 生成时间规划
async function generatePlan() {
    if (tasks.length === 0) {
        showNotification('请先添加任务', 'error');
        return;
    }

    showLoading();
    
    try {
        console.log('开始生成规划，任务列表:', tasks);
        console.log('用户配置:', userProfile);
        
        // 使用前端AI服务生成规划
        const planResult = await aiService.generateTimePlan(tasks, userProfile);
        
        console.log('生成规划成功:', planResult);
        
        currentPlan = planResult;
        renderPlan(currentPlan);
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 生成任务提醒
        if (reminderSettings.enabled) {
            setupTaskReminders(planResult.tasks);
        }
        
        showNotification('时间规划生成成功！', 'success');
    } catch (error) {
        console.error('生成规划失败:', error);
        showNotification('生成规划失败：' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 统一渲染函数
function renderPlanWithData(data) {
    if (!planContainer) return;
    
    // 保存当前规划数据
    currentPlanData = data;
    
    const totalMinutes = data.reduce((sum, item) => sum + item.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    planContainer.innerHTML = `
        <div class="plan-summary">
            <h3>📋 总时长：${totalHours > 0 ? totalHours + ' 小时 ' : ''}${remainingMinutes} 分钟</h3>
        </div>
        <table class="plan-table">
            <thead>
                <tr>
                    <th>时间</th>
                    <th>任务</th>
                    <th>类型</th>
                    <th>时长</th>
                    <th>备注</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((item, index) => `
                    <tr class="${item.type === 'break' ? 'row-break' : ''}">
                        <td class="time-cell">
                            ${item.time}
                        </td>
                        <td class="title-cell">${escapeHtml(item.task)}</td>
                        <td class="type-cell">
                            ${item.type === 'break' ? '☕ 休息' : '🔄 任务'}
                        </td>
                        <td class="duration-cell">${item.duration} 分钟</td>
                        <td class="note-cell">${item.note ? escapeHtml(item.note) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    console.log('规划渲染完成，任务数量:', data.length);
}

// 渲染规划
function renderPlan(planResult) {
    if (!planContainer) return;
    
    console.log('开始渲染规划:', planResult);
    const totalHours = Math.floor(planResult.totalDuration / 60);
    const totalMinutes = planResult.totalDuration % 60;
    
    // 构建currentPlanData
    currentPlanData = planResult.tasks.map(task => ({
        time: `${task.startTime} - ${task.endTime}`,
        task: task.title,
        duration: task.duration,
        type: task.type,
        note: task.note || ''
    }));
    
    planContainer.innerHTML = `
        <div class="plan-summary">
            <h3>📋 总时长：${totalHours > 0 ? totalHours + ' 小时 ' : ''}${totalMinutes} 分钟</h3>
        </div>
        <table class="plan-table">
            <thead>
                <tr>
                    <th>时间</th>
                    <th>任务</th>
                    <th>类型</th>
                    <th>时长</th>
                    <th>备注</th>
                </tr>
            </thead>
            <tbody>
                ${planResult.tasks.map(task => `
                    <tr class="${task.taskType === 'fixed' ? 'row-fixed' : ''} ${task.type === 'break' ? 'row-break' : ''}">
                        <td class="time-cell">
                            ${task.startTime} - ${task.endTime}
                            ${task.taskType === 'fixed' ? '<span class="fixed-indicator">📌</span>' : ''}
                        </td>
                        <td class="title-cell">${escapeHtml(task.title)}</td>
                        <td class="type-cell">
                            ${task.type === 'break' ? '☕ 休息' : (task.taskType === 'fixed' ? '📌 固定' : (task.taskType === 'interval' ? '🕒 区间' : '🔄 灵活'))}
                        </td>
                        <td class="duration-cell">${task.duration} 分钟</td>
                        <td class="note-cell">${task.note ? escapeHtml(task.note) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    console.log('规划渲染完成，任务数量:', planResult.tasks.length);
}

// AI 修改规划
async function modifyPlan() {
    if (!feedbackInput) return;
    
    const userCommand = feedbackInput.value.trim();
    
    if (!userCommand) {
        showNotification('请输入修改指令', 'error');
        return;
    }

    if (!currentPlanData) {
        showNotification('请先生成规划', 'error');
        return;
    }

    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === '你的API密钥') {
        showNotification('请在app.js中设置DeepSeek API密钥', 'error');
        return;
    }

    showLoading();
    
    try {
        // 调用 DeepSeek API
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个时间规划助手。根据用户指令修改规划数据，只返回修改后的 JSON 数组，每个对象包含 time, task, duration。'
                    },
                    {
                        role: 'user',
                        content: `当前规划：${JSON.stringify(currentPlanData)}\n指令：${userCommand}\n返回修改后的 JSON 数组。`
                    }
                ],
                temperature: 0.1
            })
        });

        if (!res.ok) {
            throw new Error(`API 请求失败: ${res.status}`);
        }

        const json = await res.json();
        let reply = json.choices[0].message.content;
        
        // 提取 JSON 数组
        const match = reply.match(/\[[\s\S]*\]/);
        if (match) reply = match[0];
        
        const newData = JSON.parse(reply);
        
        // 渲染修改后的规划
        renderPlanWithData(newData);
        feedbackInput.value = '';
        
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        showNotification('规划已通过AI修改！', 'success');
    } catch (error) {
        console.error('修改规划失败:', error);
        showNotification('修改规划失败：' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 保存开始设置
function saveStartSettingsFunc() {
    try {
        localStorage.setItem('startTime', startTime);
        localStorage.setItem('startState', startStates[startStateIndex]);
        showNotification('开始设置保存成功！', 'success');
    } catch (error) {
        showNotification('保存失败，请重试', 'error');
        console.error('保存开始设置失败:', error);
    }
}

// 保存结束设置
function saveEndSettingsFunc() {
    try {
        localStorage.setItem('endTime', endTime);
        localStorage.setItem('bedtimeRoutine', bedtimeRoutine);
        showNotification('结束设置保存成功！', 'success');
    } catch (error) {
        showNotification('保存失败，请重试', 'error');
        console.error('保存结束设置失败:', error);
    }
}

// 保存休息设置
function saveBreakSettingsFunc() {
    try {
        localStorage.setItem('shortBreakDuration', shortBreakDuration);
        localStorage.setItem('longBreakDuration', longBreakDuration);
        localStorage.setItem('tasksBeforeLongBreak', tasksBeforeLongBreak);
        showNotification('休息设置保存成功！', 'success');
    } catch (error) {
        showNotification('保存失败，请重试', 'error');
        console.error('保存休息设置失败:', error);
    }
}

// 保存高级设置
function saveAdvancedSettingsFunc() {
    try {
        localStorage.setItem('conflictDetection', conflictDetectionOptions[conflictDetectionIndex]);
        localStorage.setItem('defaultTaskDuration', defaultTaskDuration);
        localStorage.setItem('timezone', timezones[timezoneIndex]);
        saveReminderSettings();
        showNotification('高级设置保存成功！', 'success');
    } catch (error) {
        showNotification('保存失败，请重试', 'error');
        console.error('保存高级设置失败:', error);
    }
}

// 显示加载动画
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// 隐藏加载动画
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// 获取优先级文本
function getPriorityText(priority) {
    const priorityMap = {
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return priorityMap[priority] || '中';
}

// HTML 转义（防止 XSS）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = '<span>' + escapeHtml(message) + '</span><button class="notification-close" onclick="this.parentElement.remove()">×</button>';
    document.body.appendChild(notification);
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 导出规划
function exportPlan(format) {
    if (!currentPlan) {
        showNotification('请先生成时间规划', 'error');
        return;
    }
    
    try {
        switch (format) {
            case 'pdf':
                showNotification('PDF导出功能开发中', 'info');
                break;
            case 'ics':
                showNotification('日历导出功能开发中', 'info');
                break;
            case 'markdown':
                exportAsMarkdown();
                break;
            case 'text':
                exportAsText();
                break;
            default:
                showNotification('不支持的导出格式', 'error');
        }
    } catch (error) {
        console.error('导出失败:', error);
        showNotification('导出失败：' + error.message, 'error');
    }
}

// 导出为Markdown
function exportAsMarkdown() {
    if (!currentPlan) return;
    
    const markdownContent = `# 时间规划

## 总览
- 总时长：${Math.floor(currentPlan.totalDuration / 60)} 小时 ${currentPlan.totalDuration % 60} 分钟
- 生成时间：${new Date().toLocaleString()}

## 详细安排

| 时间 | 任务 | 类型 | 时长 | 备注 |
|------|------|------|------|------|
${currentPlan.tasks.map(task => `| ${task.startTime} - ${task.endTime} | ${task.title} | ${task.type === 'break' ? '休息' : (task.taskType === 'fixed' ? '固定' : (task.taskType === 'interval' ? '区间' : '灵活'))} | ${task.duration} 分钟 | ${task.note || '-'} |`).join('\n')}
`;
    
    downloadFile('时间规划.md', markdownContent, 'text/markdown');
}

// 导出为文本
function exportAsText() {
    if (!currentPlan) return;
    
    const textContent = `时间规划

总览
- 总时长：${Math.floor(currentPlan.totalDuration / 60)} 小时 ${currentPlan.totalDuration % 60} 分钟
- 生成时间：${new Date().toLocaleString()}

详细安排

${currentPlan.tasks.map(task => `${task.startTime} - ${task.endTime} | ${task.title} | ${task.type === 'break' ? '休息' : (task.taskType === 'fixed' ? '固定' : (task.taskType === 'interval' ? '区间' : '灵活'))} | ${task.duration} 分钟 | ${task.note || '-'}`).join('\n')}
`;
    
    downloadFile('时间规划.txt', textContent, 'text/plain');
}

// 下载文件
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('导出成功！', 'success');
}





// 保存提醒设置
function saveReminderSettings() {
    localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
    showNotification('提醒设置已保存', 'success');
    
    // 如果启用了提醒，重新设置提醒
    if (reminderSettings.enabled && currentPlan) {
        setupTaskReminders(currentPlan.tasks);
    } else {
        // 清除所有提醒
        clearReminders();
    }
}

// 加载提醒设置
function loadReminderSettings() {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
        reminderSettings = JSON.parse(savedSettings);
        
        // 更新UI
        if (enableReminders) enableReminders.checked = reminderSettings.enabled;
        if (reminderMinutes) reminderMinutes.value = reminderSettings.minutes;
        if (enableSound) enableSound.checked = reminderSettings.sound;
    }
}

// 设置任务提醒
function setupTaskReminders(plannedTasks) {
    // 清除之前的提醒
    clearReminders();
    
    const now = new Date();
    const today = new Date().toDateString();
    
    plannedTasks.forEach(task => {
        if (task.type === 'task') {
            const [hours, minutes] = task.startTime.split(':').map(Number);
            const taskTime = new Date();
            taskTime.setHours(hours, minutes, 0, 0);
            
            // 确保任务时间是今天的，并且在当前时间之后
            if (taskTime.toDateString() === today && taskTime > now) {
                // 计算提醒时间（提前指定分钟数）
                const reminderTime = new Date(taskTime.getTime() - reminderSettings.minutes * 60000);
                
                // 如果提醒时间在当前时间之后
                if (reminderTime > now) {
                    const timeUntilReminder = reminderTime.getTime() - now.getTime();
                    
                    const timer = setTimeout(() => {
                        showReminderNotification(task);
                    }, timeUntilReminder);
                    
                    reminderTimers.push(timer);
                }
            }
        }
    });
}

// 清除所有提醒
function clearReminders() {
    reminderTimers.forEach(timer => clearTimeout(timer));
    reminderTimers = [];
}

// 显示提醒通知
function showReminderNotification(task) {
    if (reminderNotification && reminderTaskName && reminderTaskTime) {
        reminderTaskName.textContent = task.title;
        reminderTaskTime.textContent = `开始时间: ${task.startTime}`;
        reminderNotification.style.display = 'block';
        
        // 给闹钟图标添加摇晃动画
        const reminderIcon = reminderNotification.querySelector('.reminder-icon');
        if (reminderIcon) {
            reminderIcon.classList.add('shake');
        }
        
        // 播放提醒声音
        if (reminderSettings.sound) {
            playReminderSound();
        }
        
        // 30秒后自动隐藏
        setTimeout(hideReminderNotification, 30000);
    }
}

// 隐藏提醒通知
function hideReminderNotification() {
    if (reminderNotification) {
        // 移除闹钟图标的摇晃动画
        const reminderIcon = reminderNotification.querySelector('.reminder-icon');
        if (reminderIcon) {
            reminderIcon.classList.remove('shake');
        }
        reminderNotification.style.display = 'none';
    }
}

// 查看提醒任务
function viewReminderTask() {
    // 切换到任务模块
    const taskModuleBtn = document.querySelector('.module-btn[data-module="task"]');
    if (taskModuleBtn) {
        taskModuleBtn.click();
    }
    hideReminderNotification();
}

// 播放提醒声音
function playReminderSound() {
    // 创建音频上下文
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 设置参数
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // 播放
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 启动动画
function initStartupAnimation() {
    const startupAnimation = document.getElementById('startupAnimation');
    if (startupAnimation) {
        // 显示启动动画
        startupAnimation.style.display = 'flex';
        
        // 5秒后淡出动画
        setTimeout(() => {
            startupAnimation.classList.add('fade-out');
            
            // 动画结束后隐藏
            setTimeout(() => {
                startupAnimation.style.display = 'none';
                // 初始化用户配置，显示登录弹窗
                initUserProfile();
            }, 500);
        }, 5000);
    }
}

// 页面加载完成后初始化
window.onload = function() {
    initStartupAnimation();
    // 初始化其他功能，但不立即执行initUserProfile
    initElements();
    bindEvents();
    initOrientationListener();
    loadReminderSettings();
};

