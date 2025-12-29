var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    board: [], // 4x4 棋盘
    emptyPos: { row: 3, col: 3 }, // 空格位置
    moves: 0, // 移动次数
    startTime: 0, // 开始时间
    elapsedTime: 0, // 已用时间（秒）
    elapsedTimeStr: '00:00', // 格式化后的时间字符串
    timer: null, // 计时器
    gameStarted: false,
    gameWon: false,
    bestTime: 0, // 最佳时间（秒）
    bestTimeStr: '-', // 格式化后的最佳时间
    bestMoves: 0 // 最佳步数
  },

  onLoad: function () {
    // 从本地存储加载最佳成绩
    const bestTime = wx.getStorageSync('puzzle15_bestTime') || 0;
    this.setData({
      bestTime: bestTime,
      bestTimeStr: bestTime > 0 ? this.formatTime(bestTime) : '-',
      bestMoves: wx.getStorageSync('puzzle15_bestMoves') || 0
    });
    this.initGame();
  },

  onUnload: function () {
    // 清除计时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 初始化游戏
  initGame: function () {
    // 创建有序数组 [1,2,3,...,15,0]
    let numbers = [];
    for (let i = 1; i <= 15; i++) {
      numbers.push(i);
    }
    numbers.push(0); // 0 代表空格

    // 打乱数组（使用随机移动确保可解）
    numbers = this.shuffleSolvable(numbers);

    // 转换为 4x4 矩阵
    const board = [];
    for (let i = 0; i < 4; i++) {
      board[i] = [];
      for (let j = 0; j < 4; j++) {
        const num = numbers[i * 4 + j];
        board[i][j] = num;
        if (num === 0) {
          this.setData({ emptyPos: { row: i, col: j } });
        }
      }
    }

    this.setData({
      board: board,
      moves: 0,
      startTime: 0,
      elapsedTime: 0,
      elapsedTimeStr: '00:00',
      gameStarted: false,
      gameWon: false
    });

    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 打乱数组（确保可解）
  shuffleSolvable: function (arr) {
    // 随机移动多次来打乱
    let board = [...arr];
    let emptyIdx = 15;
    
    for (let i = 0; i < 1000; i++) {
      const neighbors = this.getNeighbors(emptyIdx);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [board[emptyIdx], board[randomNeighbor]] = [board[randomNeighbor], board[emptyIdx]];
      emptyIdx = randomNeighbor;
    }
    
    return board;
  },

  // 获取可移动的邻居索引
  getNeighbors: function (idx) {
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const neighbors = [];
    
    if (row > 0) neighbors.push((row - 1) * 4 + col);
    if (row < 3) neighbors.push((row + 1) * 4 + col);
    if (col > 0) neighbors.push(row * 4 + (col - 1));
    if (col < 3) neighbors.push(row * 4 + (col + 1));
    
    return neighbors;
  },

  // 点击方块
  onTileTap: function (e) {
    if (this.data.gameWon) {
      return;
    }

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;
    const emptyPos = this.data.emptyPos;

    // 检查是否可以移动（必须与空格相邻）
    if (!this.canMove(row, col, emptyPos)) {
      wx.showToast({
        title: '无法移动',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    // 开始计时
    if (!this.data.gameStarted) {
      this.startTimer();
    }

    // 移动方块
    this.moveTile(row, col, emptyPos);
  },

  // 检查是否可以移动
  canMove: function (row, col, emptyPos) {
    return (Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
           (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row);
  },

  // 移动方块
  moveTile: function (row, col, emptyPos) {
    const board = this.data.board;
    const tileValue = board[row][col];

    // 交换位置
    board[emptyPos.row][emptyPos.col] = tileValue;
    board[row][col] = 0;

    const moves = this.data.moves + 1;

    this.setData({
      board: board,
      emptyPos: { row: row, col: col },
      moves: moves,
      gameStarted: true
    });

    // 检查是否完成
    this.checkWin();
  },

  // 检查是否获胜
  checkWin: function () {
    const board = this.data.board;
    let isWin = true;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const expected = i * 4 + j + 1;
        if (i === 3 && j === 3) {
          // 最后一个位置应该是 0
          if (board[i][j] !== 0) {
            isWin = false;
          }
        } else {
          if (board[i][j] !== expected) {
            isWin = false;
          }
        }
      }
    }

    if (isWin) {
      this.setData({ gameWon: true });
      if (this.data.timer) {
        clearInterval(this.data.timer);
      }

      // 更新最佳成绩
      let bestTime = this.data.bestTime;
      let bestMoves = this.data.bestMoves;
      let newRecord = false;

      if (bestTime === 0 || this.data.elapsedTime < bestTime) {
        bestTime = this.data.elapsedTime;
        wx.setStorageSync('puzzle15_bestTime', bestTime);
        this.setData({ bestTimeStr: this.formatTime(bestTime) });
        newRecord = true;
      }

      if (bestMoves === 0 || this.data.moves < bestMoves) {
        bestMoves = this.data.moves;
        wx.setStorageSync('puzzle15_bestMoves', bestMoves);
        newRecord = true;
      }

      this.setData({
        bestTime: bestTime,
        bestTimeStr: bestTime > 0 ? this.formatTime(bestTime) : '-',
        bestMoves: bestMoves
      });

      // 上传游戏数据
      gameUpload.uploadGameScore({
        gameName: 'puzzle15',
        score: this.data.moves, // 使用步数作为分数（步数越少越好，但后端按分数降序排列，所以这里用步数）
        duration: this.data.elapsedTime,
        extraData: {
          moves: this.data.moves,
          bestTime: bestTime,
          bestMoves: bestMoves
        }
      });

      wx.showModal({
        title: '恭喜完成！',
        content: `用时：${this.formatTime(this.data.elapsedTime)}\n步数：${this.data.moves}${newRecord ? '\n🎉 新纪录！' : ''}`,
        showCancel: false,
        confirmText: '再来一局'
      });
    }
  },

  // 开始计时
  startTimer: function () {
    this.setData({
      startTime: Date.now(),
      gameStarted: true
    });

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000);
      this.setData({ 
        elapsedTime: elapsed,
        elapsedTimeStr: this.formatTime(elapsed)
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
          wx.removeStorageSync('puzzle15_bestTime');
          wx.removeStorageSync('puzzle15_bestMoves');
          this.setData({
            bestTime: 0,
            bestTimeStr: '-',
            bestMoves: 0
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
