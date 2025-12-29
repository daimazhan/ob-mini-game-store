var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    differences: [], // 不同点的位置 [{row, col, found: false, type: 'color'|'icon'}]
    leftGrid: [], // 左图网格数据
    rightGrid: [], // 右图网格数据（包含不同点）
    foundCount: 0, // 已找到的数量
    totalDifferences: 5, // 总共有5处不同
    level: 1, // 当前关卡
    time: 0, // 用时（秒）
    timeStr: '00:00', // 格式化后的时间字符串
    timer: null, // 计时器
    gameStarted: false,
    gameWon: false,
    bestTime: 0, // 最佳时间（秒）
    bestTimeStr: '-', // 格式化后的最佳时间
    cellHeight: '' // 单元格高度（动态计算）
  },

  onLoad: function () {
    const bestTime = wx.getStorageSync('spotdiff_bestTime') || 0;
    this.setData({
      bestTime: bestTime,
      bestTimeStr: bestTime > 0 ? this.formatTime(bestTime) : '-'
    });
    this.initGame();
    // 延迟设置单元格高度，确保布局已完成
    setTimeout(() => {
      this.setCellHeight();
    }, 100);
  },

  onReady: function () {
    // 页面渲染完成后设置单元格高度
    this.setCellHeight();
  },

  // 设置单元格高度，使其保持正方形
  setCellHeight: function () {
    const query = wx.createSelectorQuery().in(this);
    // 获取第一个 grid 的宽度来计算单元格宽度
    query.select('.grid').boundingClientRect((gridRect) => {
      if (gridRect && gridRect.width) {
        // 计算每个单元格的宽度：grid宽度减去padding(16px)除以5列，再减去margin
        const gridWidth = gridRect.width;
        const padding = 16; // 左右各8px
        const margin = 6; // 每个cell右边距6px，5列共4个间距
        const cellWidth = (gridWidth - padding - margin * 4) / 5;
        // 设置单元格高度等于宽度
        this.setData({
          cellHeight: cellWidth + 'px'
        });
      }
    }).exec();
  },

  onUnload: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 初始化游戏
  initGame: function () {
    // 生成随机不同点位置（5x5网格）
    const gridSize = 5;
    const differences = [];
    const usedPositions = new Set();

    // 生成左图（基础图案）
    const leftGrid = [];
    const rightGrid = [];
    
    // 可用的不同类型
    const diffTypes = ['color', 'icon', 'shape'];
    const icons = ['⭐', '❤️', '🎯', '🔴', '💎', '🌟', '💫', '✨'];
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#95e1d3', '#fce38a', '#eaffd0'];
    const shapes = ['circle', 'square', 'triangle'];

    // 初始化左右网格，先为所有位置生成相同的基础内容
    for (let i = 0; i < gridSize; i++) {
      leftGrid[i] = [];
      rightGrid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        // 随机决定这个位置的内容类型：图标、形状或颜色背景
        const contentType = Math.random();
        let cellData = {
          bgColor: '#f0f0f0',
          icon: '',
          isDot: false,
          shape: '',
          shapeColor: ''
        };

        if (contentType < 0.3) {
          // 30%概率：图标
          const icon = icons[Math.floor(Math.random() * icons.length)];
          cellData.icon = icon;
        } else if (contentType < 0.6) {
          // 30%概率：形状
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const shapeColor = colors[Math.floor(Math.random() * colors.length)];
          cellData.shape = shape;
          cellData.shapeColor = shapeColor;
        } else if (contentType < 0.8) {
          // 20%概率：彩色背景
          const color = colors[Math.floor(Math.random() * colors.length)];
          cellData.bgColor = color;
        }
        // 20%概率：保持空白（灰色背景）

        // 左右两图初始完全相同
        leftGrid[i][j] = JSON.parse(JSON.stringify(cellData));
        rightGrid[i][j] = JSON.parse(JSON.stringify(cellData));
      }
    }

    // 生成不同点
    while (differences.length < this.data.totalDifferences) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const key = `${row}-${col}`;

      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        
        // 随机选择不同类型的不同点
        const type = diffTypes[Math.floor(Math.random() * diffTypes.length)];
        let diffData = {
          row: row,
          col: col,
          found: false,
          type: type
        };

        // 根据类型设置右图的不同点（修改右图，左图保持不变）
        if (type === 'color') {
          // 改变背景颜色
          const color = colors[Math.floor(Math.random() * colors.length)];
          rightGrid[row][col].bgColor = color;
          diffData.color = color;
        } else if (type === 'icon') {
          // 改变图标（如果原来没有图标，添加一个；如果有，换成不同的）
          const icon = icons[Math.floor(Math.random() * icons.length)];
          rightGrid[row][col].icon = icon;
          rightGrid[row][col].isDot = false;
          diffData.icon = icon;
        } else if (type === 'shape') {
          // 改变形状（如果原来没有形状，添加一个；如果有，换成不同的）
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const shapeColor = colors[Math.floor(Math.random() * colors.length)];
          rightGrid[row][col].shape = shape;
          rightGrid[row][col].shapeColor = shapeColor;
          diffData.shape = shape;
          diffData.shapeColor = shapeColor;
        }

        differences.push(diffData);
      }
    }

    this.setData({
      differences: differences,
      leftGrid: leftGrid,
      rightGrid: rightGrid,
      foundCount: 0,
      time: 0,
      timeStr: '00:00',
      gameStarted: false,
      gameWon: false
    });

    if (this.data.timer) {
      clearInterval(this.data.timer);
    }

    // 重新计算单元格高度
    setTimeout(() => {
      this.setCellHeight();
    }, 50);
  },

  // 点击网格
  onGridTap: function (e) {
    if (this.data.gameWon) {
      return;
    }

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;

    // 开始计时
    if (!this.data.gameStarted) {
      this.startTimer();
    }

    // 检查是否点击到不同点
    const differences = this.data.differences;
    let found = false;
    let foundCount = this.data.foundCount;

    for (let i = 0; i < differences.length; i++) {
      if (!differences[i].found && 
          differences[i].row === row && 
          differences[i].col === col) {
        differences[i].found = true;
        found = true;
        foundCount += 1;
        break;
      }
    }

    if (found) {
      // 找到不同点
      wx.showToast({
        title: `找到 ${foundCount}/${this.data.totalDifferences}`,
        icon: 'success',
        duration: 1000
      });

      this.setData({
        differences: differences,
        foundCount: foundCount
      });

      // 检查是否全部找到
      if (foundCount === this.data.totalDifferences) {
        this.gameWin();
      }
    } else {
      // 点击错误
      wx.showToast({
        title: '这里没有不同',
        icon: 'none',
        duration: 800
      });
    }
  },

  // 游戏胜利
  gameWin: function () {
    this.setData({ gameWon: true });

    if (this.data.timer) {
      clearInterval(this.data.timer);
    }

    // 更新最佳成绩
    let bestTime = this.data.bestTime;
    let newRecord = false;

    if (bestTime === 0 || this.data.time < bestTime) {
      bestTime = this.data.time;
      wx.setStorageSync('spotdiff_bestTime', bestTime);
      this.setData({ bestTimeStr: this.formatTime(bestTime) });
      newRecord = true;
    }

    this.setData({ 
      bestTime: bestTime,
      bestTimeStr: bestTime > 0 ? this.formatTime(bestTime) : '-'
    });

    // 上传游戏数据（时间越短越好，但后端按分数降序排列，所以用10000-时间作为分数）
    gameUpload.uploadGameScore({
      gameName: 'spotdiff',
      score: 10000 - this.data.time, // 时间越短分数越高
      duration: this.data.time,
      difficulty: `level${this.data.level}`,
      extraData: {
        level: this.data.level,
        time: this.data.time
      }
    });

    setTimeout(() => {
      wx.showModal({
        title: '恭喜完成！',
        content: `用时：${this.formatTime(this.data.time)}${newRecord ? '\n🎉 新纪录！' : ''}`,
        showCancel: true,
        cancelText: '再来一局',
        confirmText: '下一关',
        success: (res) => {
          if (res.confirm) {
            // 下一关
            this.nextLevel();
          } else if (res.cancel) {
            // 重新开始当前关卡
            this.restart();
          }
        }
      });
    }, 500);
  },

  // 下一关
  nextLevel: function () {
    const level = this.data.level + 1;
    this.setData({ level: level });
    this.initGame();
  },

  // 开始计时
  startTimer: function () {
    this.setData({
      gameStarted: true,
      time: 0
    });

    const timer = setInterval(() => {
      const newTime = this.data.time + 1;
      this.setData({
        time: newTime,
        timeStr: this.formatTime(newTime)
      });
    }, 1000);

    this.setData({ timer: timer });
  },

  // 格式化时间
  formatTime: function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 重新开始
  restart: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    this.initGame();
  },

  // 重置最佳成绩
  resetBest: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('spotdiff_bestTime');
          this.setData({
            bestTime: 0,
            bestTimeStr: '-'
          });
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },
  showModal(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  goto(e){
    util.goto(e.currentTarget.dataset.url)
  }
});
