/**
 * AI 服务模块 - 智能时间规划器
 * 使用编程算法实现智能时间规划，无需调用 AI API
 */

class AIService {
  // 优先级权重
  PRIORITY_WEIGHT = {
    high: 100,
    medium: 50,
    low: 10
  };

  // 最佳时间段（小时）
  TIME_SLOTS = {
    morning: { start: 8, end: 12, name: '早晨', factor: 1.3 },    // 早晨适合重要任务
    afternoon: { start: 13, end: 17, name: '下午', factor: 1.0 },  // 下午常规工作
    evening: { start: 18, end: 22, name: '晚上', factor: 0.8 }    // 晚上适合轻松任务
  };

  // 休息时间配置（默认配置）
  BREAK_CONFIG = {
    afterTaskDuration: 0,
    breakDuration: 5,
    afterTasks: 5,
    longBreakDuration: 30,
    lunchBreak: { start: 12, end: 13, duration: 60 },
    dinnerBreak: { start: 18, end: 19, duration: 60 }
  };

  // 用户配置
  userProfile = {
    role: null,
    preferences: {
      pace: 'relaxed',
      break: 'often',
      continuity: 'single'
    }
  };

  // 角色配置
  ROLE_CONFIGS = {
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

  // 偏好配置
  PREFERENCE_CONFIGS = {
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

  /**
   * 设置用户配置
   * @param {Object} profile - 用户配置
   */
  setUserProfile(profile) {
    if (profile) {
      this.userProfile = { ...this.userProfile, ...profile };
      this.updateConfigByProfile();
    }
  }

  /**
   * 根据用户配置更新算法配置
   */
  updateConfigByProfile() {
    const { role, preferences } = this.userProfile;
    
    // 应用角色配置
    if (role && this.ROLE_CONFIGS[role]) {
      const roleConfig = this.ROLE_CONFIGS[role];
      this.BREAK_CONFIG.lunchBreak = roleConfig.lunchBreak;
      this.BREAK_CONFIG.dinnerBreak = roleConfig.dinnerBreak;
    }
    
    // 应用偏好配置
    if (preferences) {
      // 工作节奏
      if (preferences.pace && this.PREFERENCE_CONFIGS.pace[preferences.pace]) {
        const paceConfig = this.PREFERENCE_CONFIGS.pace[preferences.pace];
        this.BREAK_CONFIG.breakDuration = paceConfig.breakDuration;
        this.BREAK_CONFIG.afterTasks = paceConfig.afterTasks;
        this.BREAK_CONFIG.longBreakDuration = paceConfig.longBreakDuration;
      }
      
      // 休息频率（覆盖工作节奏中的休息设置）
      if (preferences.break && this.PREFERENCE_CONFIGS.break[preferences.break]) {
        const breakConfig = this.PREFERENCE_CONFIGS.break[preferences.break];
        this.BREAK_CONFIG.breakDuration = breakConfig.breakDuration;
        this.BREAK_CONFIG.afterTasks = breakConfig.afterTasks;
      }
    }
  }

  /**
   * 根据任务列表生成时间规划
   * @param {Array} tasks - 任务列表
   * @param {Object} userProfile - 用户配置（可选）
   * @returns {Object} 时间规划
   */
  async generateTimePlan(tasks, userProfile = null) {
    // 设置用户配置
    if (userProfile) {
      this.setUserProfile(userProfile);
    }
    
    const sortedTasks = this.smartSortTasks(tasks);
    const plannedTasks = this.calculateTimeSchedule(sortedTasks);
    
    const plan = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      tasks: plannedTasks,
      totalDuration: plannedTasks.reduce((sum, task) => sum + task.duration, 0),
      breakCount: plannedTasks.filter(t => t.type === 'break').length,
      algorithm: 'smart-priority-time-slot',
      userProfile: this.userProfile
    };

    return plan;
  }

  smartSortTasks(tasks) {
    const taskList = JSON.parse(JSON.stringify(tasks));
    const fixedTasks = taskList.filter(t => t.type === 'fixed');
    const flexibleTasks = taskList.filter(t => t.type !== 'fixed');
    
    const scoredTasks = flexibleTasks.map(task => ({
      ...task,
      score: this.calculateTaskScore(task)
    }));
    
    scoredTasks.sort((a, b) => b.score - a.score);
    
    return [...fixedTasks, ...scoredTasks];
  }

  /**
   * 计算任务得分
   * 得分 = 优先级权重 + 时长调整
   */
  calculateTaskScore(task) {
    const priorityWeight = this.PRIORITY_WEIGHT[task.priority] || this.PRIORITY_WEIGHT.medium;
    
    // 时长调整：中等时长（60-90分钟）得分稍高，避免过长或过短任务优先
    let durationAdjustment = 0;
    if (task.duration >= 60 && task.duration <= 90) {
      durationAdjustment = 20;
    } else if (task.duration > 120) {
      durationAdjustment = -10; // 过长任务稍微降低优先级
    }
    
    return priorityWeight + durationAdjustment;
  }

  calculateTimeSchedule(sortedTasks) {
    const plannedTasks = [];
    let currentTime = this.getOptimalStartTime();
    let completedTasks = 0;
    let workMinutesSinceLastBreak = 0;
    const fixedTimeSlots = [];
    let lunchBreakAdded = false;
    let dinnerBreakAdded = false;

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
        fixedTimeSlots.push({
          start: this.timeToMinutes(task.fixedStartTime),
          end: this.timeToMinutes(task.fixedEndTime)
        });
        workMinutesSinceLastBreak += task.duration;
      } else {
        // 检查是否需要添加午餐/晚餐休息
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
          workMinutesSinceLastBreak = 0;
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
          workMinutesSinceLastBreak = 0;
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
        workMinutesSinceLastBreak += task.duration;
        
        const breakNeeded = this.shouldAddBreak(task, completedTasks);
        if (breakNeeded && index < sortedTasks.length - 1) {
          const breakDuration = this.getBreakDuration(completedTasks);
          currentTime = this.findNextAvailableTime(currentTime, fixedTimeSlots, breakDuration);
          
          plannedTasks.push({
            id: index + 1.5,
            title: this.getBreakTitle(completedTasks),
            duration: breakDuration,
            priority: 'low',
            type: 'break',
            timeSlot: timeSlot.name,
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(new Date(currentTime.getTime() + breakDuration * 60000))
          });
          
          currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
        }
      }
    });

    return this.sortByStartTime(plannedTasks);
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
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const endMinutes = currentMinutes + duration;

    for (const slot of fixedSlots) {
      if (currentMinutes < slot.end && endMinutes > slot.start) {
        const newTime = new Date(currentTime);
        newTime.setHours(Math.floor(slot.end / 60), slot.end % 60, 0, 0);
        return newTime;
      }
    }

    return currentTime;
  }

  sortByStartTime(plannedTasks) {
    return plannedTasks.sort((a, b) => {
      const timeA = this.timeToMinutes(a.startTime);
      const timeB = this.timeToMinutes(b.startTime);
      return timeA - timeB;
    });
  }

  /**
   * 获取最佳开始时间
   * 默认从早上 8 点或当前时间（如果超过 8 点）
   */
  getOptimalStartTime() {
    const now = new Date();
    const morningStart = new Date(now);
    morningStart.setHours(8, 0, 0, 0);
    
    // 如果当前时间已经超过早上 8 点，从当前时间开始
    if (now.getHours() >= 8) {
      // 取整到最近的 15 分钟
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      return now;
    }
    
    return morningStart;
  }

  /**
   * 获取最佳时间段
   */
  getBestTimeSlot(currentTime, task) {
    const hour = currentTime.getHours();
    
    for (const slotName in this.TIME_SLOTS) {
      const slot = this.TIME_SLOTS[slotName];
      if (hour >= slot.start && hour < slot.end) {
        return slot;
      }
    }
    
    // 默认返回下午时间段
    return this.TIME_SLOTS.afternoon;
  }

  /**
   * 判断是否需要添加休息
   */
  shouldAddBreak(task, completedTasks) {
    // 每个任务后都休息
    return true;
  }

  /**
   * 获取休息时长
   */
  getBreakDuration(completedTasks) {
    // 每完成 5 个任务后的长休息（30分钟）
    if (completedTasks % this.BREAK_CONFIG.afterTasks === 0) {
      return this.BREAK_CONFIG.longBreakDuration;
    }
    
    // 普通休息 5 分钟
    return this.BREAK_CONFIG.breakDuration;
  }

  /**
   * 获取休息标题
   */
  getBreakTitle(completedTasks) {
    if (completedTasks % this.BREAK_CONFIG.afterTasks === 0) {
      return '☕ 长休息（完成5个任务）';
    }
    return '💧 休息5分钟';
  }

  /**
   * 格式化时间为 HH:MM
   */
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * 根据用户反馈修改时间规划
   * @param {Object} currentPlan - 当前规划
   * @param {String} feedback - 用户反馈
   * @returns {Object} 修改后的规划
   */
  async modifyPlan(currentPlan, feedback) {
    // 解析用户反馈，提取修改意图
    const modification = this.parseFeedback(feedback);
    
    // 获取当前任务列表（排除休息时间）
    const currentTasks = currentPlan.tasks.filter(t => t.type === 'task');
    
    // 根据修改意图调整任务
    let modifiedTasks = this.applyModification(currentTasks, modification);
    
    // 重新计算时间安排
    const plannedTasks = this.calculateTimeSchedule(modifiedTasks);
    
    // 生成修改后的规划
    const modifiedPlan = {
      ...currentPlan,
      id: Date.now(),
      modifiedAt: new Date().toISOString(),
      tasks: plannedTasks,
      totalDuration: plannedTasks.reduce((sum, task) => sum + task.duration, 0),
      breakCount: plannedTasks.filter(t => t.type === 'break').length,
      note: `根据用户反馈修改: ${feedback}`
    };

    return modifiedPlan;
  }

  /**
   * 解析用户反馈
   * 识别用户的修改意图
   */
  parseFeedback(feedback) {
    const modification = {
      type: 'adjust',
      targetTask: null,
      newDuration: null,
      newPriority: null,
      moveBefore: null,
      moveAfter: null
    };

    const lowerFeedback = feedback.toLowerCase();
    
    // 检测调整时长
    const durationMatch = lowerFeedback.match(/(\d+)\s*(分钟|小时|分|小时)/);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      modification.newDuration = durationMatch[2].includes('小时') ? num * 60 : num;
    }

    // 检测调整优先级
    if (lowerFeedback.includes('高优先级') || lowerFeedback.includes('提高优先级')) {
      modification.newPriority = 'high';
    } else if (lowerFeedback.includes('低优先级') || lowerFeedback.includes('降低优先级')) {
      modification.newPriority = 'low';
    } else if (lowerFeedback.includes('中优先级')) {
      modification.newPriority = 'medium';
    }

    // 检测移动任务位置
    const beforeMatch = lowerFeedback.match(/把.*?(提前|移到前面)/);
    if (beforeMatch) {
      modification.moveBefore = true;
    }

    const afterMatch = lowerFeedback.match(/把.*?(延后|移到后面)/);
    if (afterMatch) {
      modification.moveAfter = true;
    }

    // 检测特定任务
    const taskKeywords = ['写作业', '运动', '阅读', '学习', '休息'];
    for (const keyword of taskKeywords) {
      if (feedback.includes(keyword)) {
        modification.targetTask = keyword;
        break;
      }
    }

    // 如果没有特定关键词，尝试提取第一个任务相关词
    if (!modification.targetTask && feedback.includes('把')) {
      const taskMatch = feedback.match(/把(.+?)(?:的?|时间|提前|延后)/);
      if (taskMatch) {
        modification.targetTask = taskMatch[1].trim();
      }
    }

    return modification;
  }

  /**
   * 应用修改到任务列表
   */
  applyModification(tasks, modification) {
    const modifiedTasks = JSON.parse(JSON.stringify(tasks));
    
    // 如果没有指定任务，修改所有符合条件的任务
    const targetTasks = modification.targetTask 
      ? modifiedTasks.filter(t => t.title.includes(modification.targetTask))
      : modifiedTasks;

    // 应用修改
    targetTasks.forEach(task => {
      if (modification.newDuration) {
        task.duration = modification.newDuration;
      }
      if (modification.newPriority) {
        task.priority = modification.newPriority;
      }
    });

    // 如果需要移动位置，重新排序
    if (modification.moveBefore || modification.moveAfter) {
      if (modification.targetTask) {
        const targetIndex = modifiedTasks.findIndex(t => t.title.includes(modification.targetTask));
        if (targetIndex !== -1) {
          const targetTask = modifiedTasks[targetIndex];
          modifiedTasks.splice(targetIndex, 1);
          
          if (modification.moveBefore) {
            modifiedTasks.unshift(targetTask);
          } else {
            modifiedTasks.push(targetTask);
          }
        }
      }
    }

    return modifiedTasks;
  }
}

module.exports = new AIService();