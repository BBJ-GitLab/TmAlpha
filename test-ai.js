/**
 * 测试智能时间规划算法
 */

const AIService = require('./backend/services/aiService');

const aiService = AIService;

async function runTests() {
  console.log('🧪 测试智能时间规划算法\n');
  console.log('='.repeat(50));

  // 测试用例 1: 基本功能 - 不同优先级任务
  console.log('\n📋 测试 1: 基本功能 - 不同优先级任务');
  console.log('-'.repeat(50));

  const testTasks1 = [
    { id: 1, title: '写作业', duration: 90, priority: 'high' },
    { id: 2, title: '运动', duration: 60, priority: 'medium' },
    { id: 3, title: '阅读', duration: 30, priority: 'low' },
    { id: 4, title: '复习数学', duration: 120, priority: 'high' },
    { id: 5, title: '玩游戏', duration: 45, priority: 'low' }
  ];

  const plan1 = await aiService.generateTimePlan(testTasks1);
console.log('输入任务:', testTasks1.map(t => `${t.title}(${t.priority})`).join(', '));
console.log('\n生成的规划:');
plan1.tasks.forEach(task => {
  const icon = task.type === 'break' ? '☕' : '📝';
  console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
});
console.log(`\n总时长: ${plan1.totalDuration}分钟`);
console.log(`休息次数: ${plan1.breakCount}`);

// 测试用例 2: 长任务自动休息
  console.log('\n\n📋 测试 2: 长任务自动休息');
  console.log('-'.repeat(50));

  const testTasks2 = [
    { id: 1, title: '完成论文', duration: 150, priority: 'high' },
    { id: 2, title: '准备演讲', duration: 100, priority: 'high' }
  ];

  const plan2 = await aiService.generateTimePlan(testTasks2);
console.log('输入任务:', testTasks2.map(t => `${t.title}(${t.duration}分钟)`).join(', '));
console.log('\n生成的规划:');
plan2.tasks.forEach(task => {
  const icon = task.type === 'break' ? '☕' : '📝';
  console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
});
console.log(`\n总时长: ${plan2.totalDuration}分钟`);
console.log(`休息次数: ${plan2.breakCount}`);

// 测试用例 3: 多任务连续工作
  console.log('\n\n📋 测试 3: 多任务连续工作');
  console.log('-'.repeat(50));

  const testTasks3 = [
    { id: 1, title: '背单词', duration: 30, priority: 'medium' },
    { id: 2, title: '做数学题', duration: 45, priority: 'high' },
    { id: 3, title: '写作文', duration: 60, priority: 'medium' },
    { id: 4, title: '复习物理', duration: 50, priority: 'high' },
    { id: 5, title: '整理笔记', duration: 30, priority: 'low' }
  ];

  const plan3 = await aiService.generateTimePlan(testTasks3);
console.log('输入任务:', testTasks3.map(t => t.title).join(', '));
console.log('\n生成的规划:');
plan3.tasks.forEach(task => {
  const icon = task.type === 'break' ? '☕' : '📝';
  console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
});
console.log(`\n总时长: ${plan3.totalDuration}分钟`);
console.log(`休息次数: ${plan3.breakCount}`);

// 测试用例 4: 用户反馈修改 - 调整时长
  console.log('\n\n📋 测试 4: 用户反馈修改 - 调整时长');
  console.log('-'.repeat(50));

  console.log('原始规划:');
  plan1.tasks.forEach(task => {
    const icon = task.type === 'break' ? '☕' : '📝';
    console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
  });

  const feedback1 = '把运动时间调整到 30 分钟';
  console.log(`\n用户反馈: "${feedback1}"`);

  const modifiedPlan1 = await aiService.modifyPlan(plan1, feedback1);
console.log('\n修改后的规划:');
modifiedPlan1.tasks.forEach(task => {
  const icon = task.type === 'break' ? '☕' : '📝';
  console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
});

// 测试用例 5: 用户反馈修改 - 提前任务
  console.log('\n\n📋 测试 5: 用户反馈修改 - 提前任务');
  console.log('-'.repeat(50));

  console.log('原始规划:');
  plan3.tasks.slice(0, 5).forEach(task => {
    const icon = task.type === 'break' ? '☕' : '📝';
    console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
  });

  const feedback2 = '把复习物理提前';
  console.log(`\n用户反馈: "${feedback2}"`);

  const modifiedPlan2 = await aiService.modifyPlan(plan3, feedback2);
console.log('\n修改后的规划:');
modifiedPlan2.tasks.slice(0, 5).forEach(task => {
  const icon = task.type === 'break' ? '☕' : '📝';
  console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟)`);
});

// 测试用例 6: 用户反馈修改 - 提高优先级
  console.log('\n\n📋 测试 6: 用户反馈修改 - 提高优先级');
  console.log('-'.repeat(50));

  const testTasks4 = [
    { id: 1, title: '看书', duration: 45, priority: 'low' },
    { id: 2, title: '写代码', duration: 60, priority: 'medium' },
    { id: 3, title: '健身', duration: 30, priority: 'low' }
  ];

  const plan4 = await aiService.generateTimePlan(testTasks4);
  console.log('原始规划:');
  plan4.tasks.forEach(task => {
    const icon = task.type === 'break' ? '☕' : '📝';
    console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟, 优先级: ${task.priority})`);
  });

  const feedback3 = '把健身提高到高优先级';
  console.log(`\n用户反馈: "${feedback3}"`);

  const modifiedPlan3 = await aiService.modifyPlan(plan4, feedback3);
  console.log('\n修改后的规划:');
  modifiedPlan3.tasks.forEach(task => {
    const icon = task.type === 'break' ? '☕' : '📝';
    console.log(`  ${icon} ${task.startTime} - ${task.endTime} ${task.title} (${task.duration}分钟, 优先级: ${task.priority})`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ 所有测试完成！\n');

  process.exit(0);
}

// 运行测试
runTests();
