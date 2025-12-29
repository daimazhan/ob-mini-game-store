var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,

    board: [], // 游戏棋盘 6x6
    selectedCells: [], // 选中的单元格
    selectedMap: {}, // 选中状态映射表 { "row-col": true }
    selectedSum: 0, // 选中数字的和
    score: 0, // 当前分数
    level: 1, // 当前关卡
    targetScore: 100, // 目标分数
    gameOver: false,
    bestScore: 0 // 最佳分数
  },

  onLoad: function () {
    this.setData({
      bestScore: wx.getStorageSync('numberelim_bestScore') || 0
    });
    this.initGame();
  },

  // 初始化游戏
  initGame: function () {
    const size = 6;
    const board = [];

    // 生成随机数字棋盘（1-9）
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = Math.floor(Math.random() * 9) + 1;
      }
    }

    this.setData({
      board: board,
      selectedCells: [],
      selectedMap: {},
      selectedSum: 0,
      score: 0,
      targetScore: 100 + (this.data.level - 1) * 50,
      gameOver: false
    });
  },

  // 点击单元格
  onCellTap: function (e) {
    if (this.data.gameOver) {
      return;
    }

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;
    const cellKey = `${row}-${col}`;
    const selectedCells = [...this.data.selectedCells];
    const selectedMap = Object.assign({}, this.data.selectedMap);

    // 检查是否已选中
    const index = selectedCells.indexOf(cellKey);
    if (index > -1) {
      // 取消选中
      selectedCells.splice(index, 1);
      delete selectedMap[cellKey];
    } else {
      // 添加选中
      selectedCells.push(cellKey);
      selectedMap[cellKey] = true;
    }

    // 计算选中数字的和
    let sum = 0;
    const board = this.data.board;
    for (let i = 0; i < selectedCells.length; i++) {
      const [r, c] = selectedCells[i].split('-').map(Number);
      sum += board[r][c];
    }

    this.setData({ 
      selectedCells: selectedCells,
      selectedMap: selectedMap,
      selectedSum: sum
    });
  },

  // 消除选中的数字
  eliminate: function () {
    if (this.data.selectedCells.length < 2) {
      wx.showToast({
        title: '至少选择2个数字',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 计算选中数字的和
    let sum = 0;
    const cellsToRemove = [];
    const board = this.data.board;

    for (let i = 0; i < this.data.selectedCells.length; i++) {
      const [row, col] = this.data.selectedCells[i].split('-').map(Number);
      sum += board[row][col];
      cellsToRemove.push({ row: row, col: col });
    }

    // 检查是否满足消除条件（和为10的倍数）
    if (sum % 10 === 0 && sum >= 10) {
      // 消除成功
      const newBoard = this.data.board.map(row => [...row]);
      
      // 移除选中的单元格
      for (let i = 0; i < cellsToRemove.length; i++) {
        const { row, col } = cellsToRemove[i];
        newBoard[row][col] = 0; // 标记为空
      }

      // 计算分数（和值）
      const newScore = this.data.score + sum;

      // 下落填充
      this.fallDown(newBoard);

      // 填充新数字
      this.fillEmpty(newBoard);

      // 检查是否达到目标分数
      const gameOver = newScore >= this.data.targetScore;

      this.setData({
        board: newBoard,
        selectedCells: [],
        selectedMap: {},
        selectedSum: 0,
        score: newScore,
        gameOver: gameOver
      });

      if (gameOver) {
        this.gameWin();
      } else {
        wx.showToast({
          title: `+${sum}分`,
          icon: 'success',
          duration: 1000
        });
      }
    } else {
      // 消除失败
      wx.showToast({
        title: sum < 10 ? '和必须≥10' : '和必须是10的倍数',
        icon: 'none',
        duration: 1500
      });
      this.setData({ 
        selectedCells: [],
        selectedMap: {},
        selectedSum: 0
      });
    }
  },

  // 下落填充
  fallDown: function (board) {
    for (let col = 0; col < 6; col++) {
      let writeIndex = 5; // 从底部开始写入
      
      // 从下往上，将非0数字移到下面
      for (let row = 5; row >= 0; row--) {
        if (board[row][col] !== 0) {
          if (writeIndex !== row) {
            board[writeIndex][col] = board[row][col];
            board[row][col] = 0;
          }
          writeIndex--;
        }
      }
    }
  },

  // 填充空位
  fillEmpty: function (board) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (board[i][j] === 0) {
          board[i][j] = Math.floor(Math.random() * 9) + 1;
        }
      }
    }
  },

  // 游戏胜利
  gameWin: function () {
    // 更新最佳分数
    let bestScore = this.data.bestScore;
    let newRecord = false;

    if (this.data.score > bestScore) {
      bestScore = this.data.score;
      wx.setStorageSync('numberelim_bestScore', bestScore);
      newRecord = true;
    }

    this.setData({ bestScore: bestScore });

    // 上传游戏数据
    gameUpload.uploadGameScore({
      gameName: 'numberelim',
      score: this.data.score,
      difficulty: `level${this.data.level}`,
      extraData: {
        level: this.data.level,
        targetScore: this.data.targetScore
      }
    });

    setTimeout(() => {
      wx.showModal({
        title: '恭喜通关！',
        content: `得分：${this.data.score}${newRecord ? '\n🎉 新纪录！' : ''}`,
        showCancel: true,
        cancelText: '再来一局',
        confirmText: '下一关',
        success: (res) => {
          if (res.confirm) {
            // 下一关
            this.nextLevel();
          } else if (res.cancel) {
            // 重新开始
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

  // 重新开始
  restart: function () {
    this.setData({ level: 1 });
    this.initGame();
  },

  // 重置最佳成绩
  resetBest: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('numberelim_bestScore');
          this.setData({
            bestScore: 0
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
