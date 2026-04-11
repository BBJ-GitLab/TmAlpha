// 时间规划器小程序逻辑
Page({
  data: {
    // 登录相关
    showAuthModal: true,
    showRoleModal: false,
    isLoggedIn: false,
    username: '',
    userRole: '',
    userRoleText: '',
    
    // VIP相关
    isVip: false,
    vipLevel: 0,
    vipExpiryDate: '',
    showVipModal: false,
    
    // 偏好设置
    pace: 'relaxed',
    breakFreq: 'often',
    continuity: 'single',
    
    // 模块切换
    activeModule: 'task',
    
    // 任务相关
    tasks: [],
    taskTitle: '',
    taskTypes: [
      { label: '灵活时间', value: 'flexible' },
      { label: '固定时间', value: 'fixed' },
      { label: '时间区间', value: 'interval' }
    ],
    taskTypeIndex: 0,
    taskDuration: 60,
    durationUnits: ['分钟', '小时', '秒'],
    durationUnitIndex: 0,
    priorities: ['低优先级', '中优先级', '高优先级'],
    priorityIndex: 1,
    taskStartTime: '09:00',
    taskEndTime: '10:00',
    intervalStartTime: '09:00',
    intervalEndTime: '18:00',
    taskNote: '',
    
    // 快速添加任务
    quickTaskTitle: '',
    
    // 开始模块设置
    startTime: '08:00',
    startStates: ['精力充沛', '状态一般', '有点疲惫'],
    startStateIndex: 0,
    
    // 结束模块设置
    endTime: '22:00',
    bedtimeRoutine: '',
    
    // 休息模块设置
    shortBreakDuration: 5,
    longBreakDuration: 15,
    tasksBeforeLongBreak: 5,
    
    // 高级选项设置
    conflictDetectionOptions: ['严格模式', '灵活模式', '关闭'],
    conflictDetectionIndex: 0,
    defaultTaskDuration: 60,
    timezones: ['本地时区', 'UTC'],
    timezoneIndex: 0,
    
    // 结果显示
    showResult: false,
    plan: {
      tasks: [],
      totalDuration: 0,
      breakCount: 0
    },
    
    // 模态框
    showHelpModal: false,
    showEditModal: false,
    
    // 编辑任务数据
    editTaskData: {
      id: null,
      title: '',
      duration: 60,
      priority: 'medium',
      note: ''
    },
    editTaskPriorityIndex: 1,
    
    // 设备状态
    isLandscape: false,
    isLoading: false
  },

  // 生命周期函数
  onLoad() {
    // 延迟执行，避免启动时卡顿
    setTimeout(() => {
      this.checkOrientation();
      this.loadSettings();
    }, 100);
  },

  onShow() {
    this.checkOrientation();
  },

  // 登录相关
  bindUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  handleStartBtn() {
    const { username } = this.data;
    if (!username || username.length < 2 || username.length > 20) {
      wx.showToast({ title: '请输入2-20个字符的用户名', icon: 'none', duration: 1500 });
      return;
    }
    this.setData({ 
      showAuthModal: false, 
      showRoleModal: true 
    });
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    let roleText = '';
    switch (role) {
      case 'student': roleText = '🎓 学生'; break;
      case 'worker': roleText = '💼 上班族'; break;
      case 'freelancer': roleText = '🎨 自由职业'; break;
      case 'parent': roleText = '👨‍👩‍👧 家长'; break;
    }
    this.setData({ userRole: role, userRoleText: roleText });
  },

  selectPreference(e) {
    const { pref, value } = e.currentTarget.dataset;
    this.setData({ [pref]: value });
  },

  confirmRole() {
    const { username, userRole, pace, breakFreq, continuity } = this.data;
    if (!userRole) {
      wx.showToast({ title: '请选择角色', icon: 'none', duration: 1500 });
      return;
    }
    
    // 保存用户信息
    try {
      wx.setStorageSync('username', username);
      wx.setStorageSync('userRole', userRole);
      wx.setStorageSync('userRoleText', this.data.userRoleText);
      wx.setStorageSync('pace', pace);
      wx.setStorageSync('breakFreq', breakFreq);
      wx.setStorageSync('continuity', continuity);
      wx.setStorageSync('isLoggedIn', true);
      
      this.setData({ 
        showRoleModal: false, 
        isLoggedIn: true,
        userName: username
      });
      
      wx.showToast({ title: '登录成功！', icon: 'success', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none', duration: 1500 });
      console.error('保存用户信息失败:', error);
    }
  },

  changeRole() {
    this.setData({ showRoleModal: true });
  },

  logout() {
    try {
      // 清除本地存储
      wx.removeStorageSync('username');
      wx.removeStorageSync('userRole');
      wx.removeStorageSync('userRoleText');
      wx.removeStorageSync('isLoggedIn');
      wx.removeStorageSync('isVip');
      wx.removeStorageSync('vipLevel');
      wx.removeStorageSync('vipExpiryDate');
      
      this.setData({ 
        isLoggedIn: false, 
        showAuthModal: true,
        tasks: [],
        isVip: false,
        vipLevel: 0,
        vipExpiryDate: ''
      });
      
      wx.showToast({ title: '已退出登录', icon: 'info', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '退出失败，请重试', icon: 'none', duration: 1500 });
      console.error('退出登录失败:', error);
    }
  },

  // 模块切换
  switchModule(e) {
    const module = e.currentTarget.dataset.module;
    this.setData({ activeModule: module });
  },

  // 任务相关
  bindTaskInput(e) {
    this.setData({ taskTitle: e.detail.value });
  },

  bindTaskTypeChange(e) {
    this.setData({ taskTypeIndex: e.detail.value });
  },

  bindTaskDurationInput(e) {
    this.setData({ taskDuration: e.detail.value });
  },

  bindDurationUnitChange(e) {
    this.setData({ durationUnitIndex: e.detail.value });
  },

  bindPriorityChange(e) {
    this.setData({ priorityIndex: e.detail.value });
  },

  bindTaskStartTimeChange(e) {
    this.setData({ taskStartTime: e.detail.value });
  },

  bindTaskEndTimeChange(e) {
    this.setData({ taskEndTime: e.detail.value });
  },

  bindIntervalStartTimeChange(e) {
    this.setData({ intervalStartTime: e.detail.value });
  },

  bindIntervalEndTimeChange(e) {
    this.setData({ intervalEndTime: e.detail.value });
  },

  bindTaskNoteInput(e) {
    this.setData({ taskNote: e.detail.value });
  },

  addTask() {
    const { taskTitle, taskTypes, taskTypeIndex, taskDuration, priorities, priorityIndex, taskNote } = this.data;
    
    if (!taskTitle.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none', duration: 1500 });
      return;
    }
    
    const task = {
      id: Date.now(),
      title: taskTitle.trim(),
      type: taskTypes[taskTypeIndex].value,
      duration: parseInt(taskDuration) || 60,
      priority: priorities[priorityIndex].includes('高') ? 'high' : priorities[priorityIndex].includes('中') ? 'medium' : 'low',
      note: taskNote.trim()
    };
    
    if (task.type === 'fixed') {
      task.startTime = this.data.taskStartTime;
      task.endTime = this.data.taskEndTime;
    } else if (task.type === 'interval') {
      task.intervalStart = this.data.intervalStartTime;
      task.intervalEnd = this.data.intervalEndTime;
    }
    
    // 使用对象展开语法优化性能
    const newTasks = [...this.data.tasks, task];
    this.setData({
      tasks: newTasks,
      taskTitle: '',
      taskNote: ''
    });
    
    // 保存任务数据
    try {
      wx.setStorageSync('tasks', newTasks);
    } catch (error) {
      console.error('保存任务数据失败:', error);
    }
    
    wx.showToast({ title: '任务添加成功！', icon: 'success', duration: 1500 });
  },

  deleteTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const tasks = this.data.tasks.filter(task => task.id !== taskId);
    this.setData({ tasks });
    
    // 保存任务数据
    try {
      wx.setStorageSync('tasks', tasks);
    } catch (error) {
      console.error('保存任务数据失败:', error);
    }
    
    wx.showToast({ title: '任务已删除', icon: 'success', duration: 1500 });
  },

  // 编辑任务
  editTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 计算优先级索引
    let priorityIndex = 1; // 默认中优先级
    if (task.priority === 'high') {
      priorityIndex = 2;
    } else if (task.priority === 'low') {
      priorityIndex = 0;
    }
    
    this.setData({
      editTaskData: {
        id: task.id,
        title: task.title,
        duration: task.duration,
        priority: task.priority,
        note: task.note || ''
      },
      editTaskPriorityIndex: priorityIndex,
      showEditModal: true
    });
  },

  bindEditTaskInput(e) {
    this.setData({ 'editTaskData.title': e.detail.value });
  },

  bindEditTaskDurationInput(e) {
    this.setData({ 'editTaskData.duration': e.detail.value });
  },

  bindEditTaskPriorityChange(e) {
    const index = e.detail.value;
    const priorityMap = ['low', 'medium', 'high'];
    this.setData({
      editTaskPriorityIndex: index,
      'editTaskData.priority': priorityMap[index]
    });
  },

  bindEditTaskNoteInput(e) {
    this.setData({ 'editTaskData.note': e.detail.value });
  },

  saveEditTask() {
    const { editTaskData } = this.data;
    
    if (!editTaskData.title.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none', duration: 1500 });
      return;
    }
    
    const tasks = this.data.tasks.map(task => {
      if (task.id === editTaskData.id) {
        return {
          ...task,
          title: editTaskData.title.trim(),
          duration: parseInt(editTaskData.duration) || 60,
          priority: editTaskData.priority,
          note: editTaskData.note.trim()
        };
      }
      return task;
    });
    
    this.setData({ 
      tasks,
      showEditModal: false 
    });
    
    // 保存任务数据
    try {
      wx.setStorageSync('tasks', tasks);
    } catch (error) {
      console.error('保存任务数据失败:', error);
    }
    
    wx.showToast({ title: '任务已更新', icon: 'success', duration: 1500 });
  },

  closeEditModal() {
    this.setData({ showEditModal: false });
  },

  confirmDeleteTask(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteTask(e);
        }
      }
    });
  },

  // 快速添加任务
  bindQuickTaskInput(e) {
    this.setData({ quickTaskTitle: e.detail.value });
  },

  addTaskFromModule() {
    const { quickTaskTitle } = this.data;
    
    if (!quickTaskTitle.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none', duration: 1500 });
      return;
    }
    
    const task = {
      id: Date.now(),
      title: quickTaskTitle.trim(),
      type: 'flexible',
      duration: 60,
      priority: 'medium',
      note: ''
    };
    
    this.setData({
      tasks: [...this.data.tasks, task],
      quickTaskTitle: ''
    });
    
    wx.showToast({ title: '任务添加成功！', icon: 'success', duration: 1500 });
  },

  // 生成时间规划
  generatePlan() {
    this.setData({ isLoading: true });
    
    // 优化：使用requestAnimationFrame确保UI更新
    requestAnimationFrame(() => {
      // 模拟生成规划，使用更短的延迟
      setTimeout(() => {
        const plan = this.generateMockPlan();
        this.setData({
          plan,
          showResult: true,
          isLoading: false
        });
        wx.showToast({ title: '时间规划生成成功！', icon: 'success', duration: 1500 });
      }, 500);
    });
  },

  generateMockPlan() {
    const { tasks, startTime } = this.data;
    const planTasks = [];
    let currentTime = startTime || '09:00';
    let breakCount = 0;
    let totalDuration = 0;
    
    // 按优先级排序任务
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
    
    // 优化：使用for循环代替forEach，提升性能
    for (let index = 0; index < sortedTasks.length; index++) {
      const task = sortedTasks[index];
      
      // 处理固定时间任务
      if (task.type === 'fixed' && task.startTime && task.endTime) {
        // 计算任务时长
        const [startHours, startMins] = task.startTime.split(':').map(Number);
        const [endHours, endMins] = task.endTime.split(':').map(Number);
        const taskDuration = (endHours - startHours) * 60 + (endMins - startMins);
        
        planTasks.push({
          title: task.title,
          startTime: task.startTime,
          endTime: task.endTime,
          duration: taskDuration,
          type: 'task',
          taskType: task.type,
          note: task.note
        });
        
        totalDuration += taskDuration;
        
        // 更新当前时间
        if (task.endTime > currentTime) {
          currentTime = task.endTime;
        }
      } else {
        // 处理灵活时间和时间区间任务
        planTasks.push({
          title: task.title,
          startTime: currentTime,
          endTime: this.addTime(currentTime, task.duration),
          duration: task.duration,
          type: 'task',
          taskType: task.type,
          note: task.note
        });
        
        totalDuration += task.duration;
        currentTime = this.addTime(currentTime, task.duration);
      }
      
      // 添加休息
      if (index < sortedTasks.length - 1) {
        const isLongBreak = (index + 1) % 5 === 0;
        const breakDuration = isLongBreak ? 15 : 5;
        
        planTasks.push({
          title: isLongBreak ? '长休息' : '短休息',
          startTime: currentTime,
          endTime: this.addTime(currentTime, breakDuration),
          duration: breakDuration,
          type: 'break',
          note: ''
        });
        
        totalDuration += breakDuration;
        breakCount++;
        currentTime = this.addTime(currentTime, breakDuration);
      }
    }
    
    return {
      tasks: planTasks,
      totalDuration,
      breakCount
    };
  },

  addTime(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  },

  // 导出规划
  exportPlan(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({ title: `导出${type}功能开发中`, icon: 'none', duration: 1500 });
  },

  // 开始模块设置
  bindStartTimeChange(e) {
    this.setData({ startTime: e.detail.value });
  },

  bindStartStateChange(e) {
    this.setData({ startStateIndex: e.detail.value });
  },

  saveStartSettings() {
    const { startTime, startStates, startStateIndex } = this.data;
    try {
      wx.setStorageSync('startTime', startTime);
      wx.setStorageSync('startState', startStates[startStateIndex]);
      wx.showToast({ title: '开始设置保存成功！', icon: 'success', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none', duration: 1500 });
      console.error('保存开始设置失败:', error);
    }
  },

  // 结束模块设置
  bindEndTimeChange(e) {
    this.setData({ endTime: e.detail.value });
  },

  bindBedtimeRoutineInput(e) {
    this.setData({ bedtimeRoutine: e.detail.value });
  },

  saveEndSettings() {
    const { endTime, bedtimeRoutine } = this.data;
    try {
      wx.setStorageSync('endTime', endTime);
      wx.setStorageSync('bedtimeRoutine', bedtimeRoutine);
      wx.showToast({ title: '结束设置保存成功！', icon: 'success', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none', duration: 1500 });
      console.error('保存结束设置失败:', error);
    }
  },

  // 休息模块设置
  bindShortBreakInput(e) {
    this.setData({ shortBreakDuration: e.detail.value });
  },

  bindLongBreakInput(e) {
    this.setData({ longBreakDuration: e.detail.value });
  },

  bindTasksBeforeLongBreakInput(e) {
    this.setData({ tasksBeforeLongBreak: e.detail.value });
  },

  saveBreakSettings() {
    const { shortBreakDuration, longBreakDuration, tasksBeforeLongBreak } = this.data;
    try {
      wx.setStorageSync('shortBreakDuration', shortBreakDuration);
      wx.setStorageSync('longBreakDuration', longBreakDuration);
      wx.setStorageSync('tasksBeforeLongBreak', tasksBeforeLongBreak);
      wx.showToast({ title: '休息设置保存成功！', icon: 'success', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none', duration: 1500 });
      console.error('保存休息设置失败:', error);
    }
  },

  // 高级选项设置
  bindConflictDetectionChange(e) {
    this.setData({ conflictDetectionIndex: e.detail.value });
  },

  bindDefaultTaskDurationInput(e) {
    this.setData({ defaultTaskDuration: e.detail.value });
  },

  bindTimezoneChange(e) {
    this.setData({ timezoneIndex: e.detail.value });
  },

  saveAdvancedSettings() {
    const { conflictDetectionOptions, conflictDetectionIndex, defaultTaskDuration, timezones, timezoneIndex } = this.data;
    try {
      wx.setStorageSync('conflictDetection', conflictDetectionOptions[conflictDetectionIndex]);
      wx.setStorageSync('defaultTaskDuration', defaultTaskDuration);
      wx.setStorageSync('timezone', timezones[timezoneIndex]);
      wx.showToast({ title: '高级设置保存成功！', icon: 'success', duration: 1500 });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none', duration: 1500 });
      console.error('保存高级设置失败:', error);
    }
  },

  // 帮助模态框
  showHelp() {
    this.setData({ showHelpModal: true });
  },

  closeHelpModal() {
    this.setData({ showHelpModal: false });
  },

  // VIP相关
  showVipModal() {
    this.setData({ showVipModal: true });
  },

  closeVipModal() {
    this.setData({ showVipModal: false });
  },

  purchaseVip(e) {
    const plan = e.currentTarget.dataset.plan;
    this.setData({ isLoading: true });
    
    // 模拟购买过程
    setTimeout(() => {
      const now = new Date();
      let expiryDate = new Date();
      
      if (plan === 'monthly') {
        expiryDate.setMonth(now.getMonth() + 1);
      } else if (plan === 'yearly') {
        expiryDate.setFullYear(now.getFullYear() + 1);
      } else if (plan === 'lifetime') {
        expiryDate.setFullYear(now.getFullYear() + 99);
      }
      
      const formattedExpiryDate = expiryDate.toLocaleDateString('zh-CN');
      
      this.setData({
        isVip: true,
        vipLevel: 1,
        vipExpiryDate: formattedExpiryDate,
        isLoading: false
      });
      
      // 保存VIP状态
      try {
        wx.setStorageSync('isVip', true);
        wx.setStorageSync('vipLevel', 1);
        wx.setStorageSync('vipExpiryDate', formattedExpiryDate);
      } catch (error) {
        console.error('保存VIP状态失败:', error);
      }
      
      wx.showToast({ title: 'VIP开通成功！', icon: 'success', duration: 1500 });
      
      // 延迟关闭模态框
      setTimeout(() => {
        this.setData({ showVipModal: false });
      }, 2000);
    }, 1500);
  },

  // 设备方向检测
  checkOrientation() {
    try {
      const res = wx.getSystemInfoSync();
      this.setData({ isLandscape: res.windowWidth > res.windowHeight });
    } catch (error) {
      console.error('获取设备信息失败:', error);
    }
  },

  // 加载设置
  loadSettings() {
    try {
      // 加载用户信息
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      if (isLoggedIn) {
        this.setData({
          isLoggedIn: true,
          showAuthModal: false,
          username: wx.getStorageSync('username') || '',
          userRole: wx.getStorageSync('userRole') || '',
          userRoleText: wx.getStorageSync('userRoleText') || '',
          pace: wx.getStorageSync('pace') || 'relaxed',
          breakFreq: wx.getStorageSync('breakFreq') || 'often',
          continuity: wx.getStorageSync('continuity') || 'single'
        });
      }
      
      // 加载VIP状态
      const isVip = wx.getStorageSync('isVip');
      if (isVip) {
        this.setData({
          isVip: true,
          vipLevel: wx.getStorageSync('vipLevel') || 1,
          vipExpiryDate: wx.getStorageSync('vipExpiryDate') || ''
        });
      }
      
      // 加载任务数据
      const savedTasks = wx.getStorageSync('tasks');
      if (savedTasks) {
        this.setData({ tasks: savedTasks });
      }
      
      // 加载开始设置
      const savedStartTime = wx.getStorageSync('startTime');
      const savedStartState = wx.getStorageSync('startState');
      if (savedStartTime) this.setData({ startTime: savedStartTime });
      if (savedStartState) {
        const index = this.data.startStates.indexOf(savedStartState);
        if (index !== -1) this.setData({ startStateIndex: index });
      }
      
      // 加载结束设置
      const savedEndTime = wx.getStorageSync('endTime');
      const savedBedtimeRoutine = wx.getStorageSync('bedtimeRoutine');
      if (savedEndTime) this.setData({ endTime: savedEndTime });
      if (savedBedtimeRoutine) this.setData({ bedtimeRoutine: savedBedtimeRoutine });
      
      // 加载休息设置
      const savedShortBreak = wx.getStorageSync('shortBreakDuration');
      const savedLongBreak = wx.getStorageSync('longBreakDuration');
      const savedTasksBeforeLongBreak = wx.getStorageSync('tasksBeforeLongBreak');
      if (savedShortBreak) this.setData({ shortBreakDuration: savedShortBreak });
      if (savedLongBreak) this.setData({ longBreakDuration: savedLongBreak });
      if (savedTasksBeforeLongBreak) this.setData({ tasksBeforeLongBreak: savedTasksBeforeLongBreak });
      
      // 加载高级设置
      const savedConflictDetection = wx.getStorageSync('conflictDetection');
      const savedDefaultTaskDuration = wx.getStorageSync('defaultTaskDuration');
      const savedTimezone = wx.getStorageSync('timezone');
      if (savedConflictDetection) {
        const index = this.data.conflictDetectionOptions.indexOf(savedConflictDetection);
        if (index !== -1) this.setData({ conflictDetectionIndex: index });
      }
      if (savedDefaultTaskDuration) this.setData({ defaultTaskDuration: savedDefaultTaskDuration });
      if (savedTimezone) {
        const index = this.data.timezones.indexOf(savedTimezone);
        if (index !== -1) this.setData({ timezoneIndex: index });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
});