var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    size: 4, // 4x4 棋盘
    board: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false
  },

  onLoad: function () {
    // 加载最佳成绩
    this.setData({
      bestScore: wx.getStorageSync('2048_bestScore') || 0
    });
    this.initGame();
  },

  // 初始化游戏
  initGame: function () {
    const size = this.data.size;
    const board = [];

    // 创建空棋盘
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = 0;
      }
    }

    // 添加两个初始数字
    this.addRandomTile(board);
    this.addRandomTile(board);

    this.setData({
      board: board,
      score: 0,
      gameOver: false,
      won: false
    });
  },

  // 添加随机数字
  addRandomTile: function (board) {
    const emptyCells = [];
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  },

  // 触摸开始
  touchStartX: 0,
  touchStartY: 0,
  touchStart: function (e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  // 触摸结束
  touchEnd: function (e) {
    if (this.data.gameOver) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - this.touchStartX;
    const dy = touchEndY - this.touchStartY;

    // 判断滑动方向（需要最小滑动距离）
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    let direction = -1;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 1 : 3; // 右:1, 左:3
    } else {
      direction = dy > 0 ? 2 : 0; // 下:2, 上:0
    }

    this.move(direction);
  },

  // 移动
  move: function (direction) {
    const board = this.data.board.map(row => [...row]);
    let moved = false;
    let newScore = this.data.score;

    // 0:上, 1:右, 2:下, 3:左
    if (direction === 0) { // 上
      for (let j = 0; j < this.data.size; j++) {
        const result = this.moveLine([board[0][j], board[1][j], board[2][j], board[3][j]]);
        for (let i = 0; i < this.data.size; i++) {
          if (board[i][j] !== result.line[i]) moved = true;
          board[i][j] = result.line[i];
        }
        newScore += result.score || 0;
      }
    } else if (direction === 1) { // 右
      for (let i = 0; i < this.data.size; i++) {
        // 向右移动：提取行从右到左 [board[i][3], board[i][2], board[i][1], board[i][0]]
        // moveLine处理（从左到右合并），结果如 [merged, 0, 0, 0]
        // 这个结果对应从右到左的位置，所以需要反转，使其对应从左到右的位置
        const originalRow = [board[i][0], board[i][1], board[i][2], board[i][3]]; // 保存原始行用于比较
        const row = [board[i][3], board[i][2], board[i][1], board[i][0]]; // 从右到左
        const result = this.moveLine(row);
        // 反转结果，使其对应从左到右的位置
        const newRow = [...result.line].reverse(); // 使用展开运算符避免修改原数组
        for (let j = 0; j < this.data.size; j++) {
          if (originalRow[j] !== newRow[j]) moved = true;
          board[i][j] = newRow[j];
        }
        newScore += result.score || 0;
      }
    } else if (direction === 2) { // 下
      for (let j = 0; j < this.data.size; j++) {
        // 向下移动：提取列从下到上 [board[3][j], board[2][j], board[1][j], board[0][j]]
        // moveLine处理（从左到右合并），结果如 [merged, 0, 0, 0]
        // 这个结果对应从下到上的位置，所以：
        // result[0] -> board[3][j] (最下面)
        // result[1] -> board[2][j]
        // result[2] -> board[1][j]
        // result[3] -> board[0][j] (最上面)
        const column = [board[3][j], board[2][j], board[1][j], board[0][j]];
        const result = this.moveLine(column);
        // 结果需要反转，因为result是从左到右的，但我们需要从上到下赋值
        result.line.reverse();
        for (let i = 0; i < this.data.size; i++) {
          if (board[i][j] !== result.line[i]) moved = true;
          board[i][j] = result.line[i];
        }
        newScore += result.score || 0;
      }
    } else if (direction === 3) { // 左
      for (let i = 0; i < this.data.size; i++) {
        const result = this.moveLine([board[i][0], board[i][1], board[i][2], board[i][3]]);
        for (let j = 0; j < this.data.size; j++) {
          if (board[i][j] !== result.line[j]) moved = true;
          board[i][j] = result.line[j];
        }
        newScore += result.score || 0;
      }
    }

    if (moved) {
      this.addRandomTile(board);
      this.setData({
        board: board,
        score: newScore
      });

      // 更新最佳成绩
      if (newScore > this.data.bestScore) {
        this.setData({ bestScore: newScore });
        wx.setStorageSync('2048_bestScore', newScore);
      }

      // 检查是否获胜
      if (!this.data.won) {
        for (let i = 0; i < this.data.size; i++) {
          for (let j = 0; j < this.data.size; j++) {
            if (board[i][j] === 2048) {
              this.setData({ won: true });
              wx.showModal({
                title: '恭喜！',
                content: '你达到了2048！',
                showCancel: false
              });
              break;
            }
          }
        }
      }

      // 检查游戏是否结束
      if (this.isGameOver(board)) {
        this.setData({ gameOver: true });
        
        // 上传游戏数据
        gameUpload.uploadGameScore({
          gameName: '2048',
          score: newScore
        });
        
        wx.showModal({
          title: '游戏结束',
          content: '无法继续移动',
          showCancel: false,
          confirmText: '再来一局',
          success: () => {
            this.restart();
          }
        });
      }
    }
  },

  // 移动一行
  moveLine: function (line) {
    // 创建副本，避免修改原数组
    let newLine = [...line].filter(val => val !== 0);
    let score = 0;

    // 合并相同数字
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        score += newLine[i];
        newLine[i + 1] = 0;
      }
    }

    // 再次移除0
    newLine = newLine.filter(val => val !== 0);

    // 补齐到4个
    while (newLine.length < 4) {
      newLine.push(0);
    }

    return { line: newLine, score: score };
  },

  // 检查游戏是否结束
  isGameOver: function (board) {
    // 检查是否有空格
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // 检查是否可以合并
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        const val = board[i][j];
        if ((i < this.data.size - 1 && board[i + 1][j] === val) ||
            (j < this.data.size - 1 && board[i][j + 1] === val)) {
          return false;
        }
      }
    }

    return true;
  },

  // 重新开始
  restart: function () {
    this.initGame();
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
