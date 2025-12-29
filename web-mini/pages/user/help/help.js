const request = require('../../../utils/http.js');
const app = getApp();
Page({
  data: {
    helpData: [{
      show: true,
      color: 'red',
      title: '积分规则',
      content: '每日签到获得10分，每次使用辅助工具扣减1分。',
      category: '特别提醒'
    },{
      show: true,
      color: 'red',
      title: '激励广告',
      content: '一次激励广告，等同于1积分。',
      category: '特别提醒'
    },{
      show: true,
      color: 'blue',
      title: '排行榜',
      content: '每个游戏单独有全网排行榜',
      category: '常见问题'
    }]
  },
  onLoad() {}
});