var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    board: [], // 15x15 棋盘
    currentPlayer: 'black', // 当前玩家：black(玩家) 或 white(AI)
    gameOver: false,
    winner: '',
    boardSize: 15,
    blackWins: 0, // 黑棋(玩家)获胜次数
    whiteWins: 0, // 白棋(AI)获胜次数
    isAITurn: false // AI是否正在思考
  },

  onLoad: function () {
    // 从本地存储加载历史战绩
    this.setData({
      blackWins: wx.getStorageSync('gomoku_blackWins') || 0,
      whiteWins: wx.getStorageSync('gomoku_whiteWins') || 0
    });
    this.initGame();
  },

  // 初始化游戏
  initGame: function () {
    const size = this.data.boardSize;
    const board = [];

    // 创建空棋盘
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = ''; // 空位置
      }
    }

    this.setData({
      board: board,
      currentPlayer: 'black',
      gameOver: false,
      winner: '',
      isAITurn: false
    });
  },

  // 点击棋盘
  onCellTap: function (e) {
    if (this.data.gameOver || this.data.isAITurn || this.data.currentPlayer !== 'black') {
      return;
    }

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;

    if (this.data.board[row][col] !== '') {
      wx.showToast({
        title: '该位置已有棋子',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    // 玩家下棋
    this.makeMove(row, col, 'black');
  },

  // 下棋
  makeMove: function (row, col, player) {
    const board = this.data.board.map(r => [...r]);
    board[row][col] = player;

    // 检查是否获胜
    const winner = this.checkWinner(board, row, col, player);
    let gameOver = false;
    let blackWins = this.data.blackWins;
    let whiteWins = this.data.whiteWins;

    if (winner) {
      gameOver = true;
      if (winner === 'black') {
        blackWins += 1;
        wx.setStorageSync('gomoku_blackWins', blackWins);
      } else {
        whiteWins += 1;
        wx.setStorageSync('gomoku_whiteWins', whiteWins);
      }
    }

    this.setData({
      board: board,
      gameOver: gameOver,
      winner: winner,
      blackWins: blackWins,
      whiteWins: whiteWins
    });

    if (gameOver) {
      // 上传游戏数据（五子棋以胜负为主，用分数表示：1=玩家胜，0=AI胜）
      gameUpload.uploadGameScore({
        gameName: 'gomoku',
        score: winner === 'black' ? 1 : 0,
        extraData: {
          winner: winner,
          playerWins: winner === 'black' ? blackWins : whiteWins
        }
      });
      
      wx.showModal({
        title: '游戏结束',
        content: winner === 'black' ? '恭喜！你获胜了！' : 'AI获胜了！',
        showCancel: false,
        confirmText: '再来一局'
      });
    } else if (player === 'black') {
      // 玩家下完，轮到AI
      this.setData({ isAITurn: true, currentPlayer: 'white' });
      setTimeout(() => {
        this.aiMove();
      }, 500); // 延迟500ms让玩家看到自己的棋子
    } else {
      // AI下完，轮到玩家
      this.setData({ isAITurn: false, currentPlayer: 'black' });
    }
  },

  // AI下棋
  aiMove: function () {
    const board = this.data.board;
    const size = this.data.boardSize;

    // 1. 检查AI是否能获胜（进攻）
    let move = this.findWinningMove(board, 'white');
    if (move) {
      this.makeMove(move.row, move.col, 'white');
      return;
    }

    // 2. 检查玩家是否能获胜（防守）
    move = this.findWinningMove(board, 'black');
    if (move) {
      this.makeMove(move.row, move.col, 'white');
      return;
    }

    // 3. 寻找最佳位置（评估分数）
    move = this.findBestMove(board);
    if (move) {
      this.makeMove(move.row, move.col, 'white');
      return;
    }

    // 4. 随机下棋（如果找不到好位置）
    const emptyCells = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === '') {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.makeMove(randomMove.row, randomMove.col, 'white');
    }
  },

  // 查找获胜的走法
  findWinningMove: function (board, player) {
    const size = this.data.boardSize;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === '') {
          // 尝试在这个位置下棋
          board[i][j] = player;
          if (this.checkWinner(board, i, j, player)) {
            board[i][j] = ''; // 恢复
            return { row: i, col: j };
          }
          board[i][j] = ''; // 恢复
        }
      }
    }
    return null;
  },

  // 寻找最佳位置
  findBestMove: function (board) {
    const size = this.data.boardSize;
    let bestScore = -1;
    let bestMove = null;

    // 只考虑中心区域和已有棋子周围的区域
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === '') {
          // 检查周围是否有棋子
          if (this.hasNearbyPiece(board, i, j)) {
            const score = this.evaluatePosition(board, i, j);
            if (score > bestScore) {
              bestScore = score;
              bestMove = { row: i, col: j };
            }
          }
        }
      }
    }

    return bestMove;
  },

  // 检查周围是否有棋子
  hasNearbyPiece: function (board, row, col) {
    const size = this.data.boardSize;
    for (let di = -2; di <= 2; di++) {
      for (let dj = -2; dj <= 2; dj++) {
        const ni = row + di;
        const nj = col + dj;
        if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
          if (board[ni][nj] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  },

  // 评估位置分数
  evaluatePosition: function (board, row, col) {
    let score = 0;
    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 主对角线
      [1, -1]   // 副对角线
    ];

    // 评估AI的进攻分数
    board[row][col] = 'white';
    for (let d = 0; d < directions.length; d++) {
      const pattern = this.getPattern(board, row, col, directions[d], 'white');
      score += this.patternScore(pattern);
    }
    board[row][col] = '';

    // 评估防守分数（阻止玩家）
    board[row][col] = 'black';
    for (let d = 0; d < directions.length; d++) {
      const pattern = this.getPattern(board, row, col, directions[d], 'black');
      score += this.patternScore(pattern) * 0.8; // 防守权重稍低
    }
    board[row][col] = '';

    return score;
  },

  // 获取某个方向的模式
  getPattern: function (board, row, col, direction, player) {
    const size = this.data.boardSize;
    let pattern = '';
    const [di, dj] = direction;

    // 向后查找
    for (let i = -4; i <= 4; i++) {
      const ni = row + di * i;
      const nj = col + dj * i;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
        if (board[ni][nj] === player) {
          pattern += '1';
        } else if (board[ni][nj] === '') {
          pattern += '0';
        } else {
          pattern += 'x';
        }
      }
    }

    return pattern;
  },

  // 模式评分
  patternScore: function (pattern) {
    // 五连
    if (pattern.includes('11111')) return 10000;
    // 活四
    if (pattern.includes('011110')) return 5000;
    // 冲四
    if (pattern.includes('01111') || pattern.includes('11110')) return 1000;
    // 活三
    if (pattern.includes('01110')) return 500;
    // 眠三
    if (pattern.includes('0111') || pattern.includes('1110')) return 100;
    // 活二
    if (pattern.includes('0110')) return 50;
    return 0;
  },

  // 检查是否获胜
  checkWinner: function (board, row, col, player) {
    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 主对角线
      [1, -1]   // 副对角线
    ];

    for (let d = 0; d < directions.length; d++) {
      const [di, dj] = directions[d];
      let count = 1; // 包括当前棋子

      // 正向查找
      for (let i = 1; i < 5; i++) {
        const ni = row + di * i;
        const nj = col + dj * i;
        if (ni >= 0 && ni < this.data.boardSize && 
            nj >= 0 && nj < this.data.boardSize && 
            board[ni][nj] === player) {
          count++;
        } else {
          break;
        }
      }

      // 反向查找
      for (let i = 1; i < 5; i++) {
        const ni = row - di * i;
        const nj = col - dj * i;
        if (ni >= 0 && ni < this.data.boardSize && 
            nj >= 0 && nj < this.data.boardSize && 
            board[ni][nj] === player) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 5) {
        return player;
      }
    }

    return null;
  },

  // 重新开始
  restart: function () {
    this.initGame();
  },

  // 重置战绩
  resetScore: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有战绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('gomoku_blackWins');
          wx.removeStorageSync('gomoku_whiteWins');
          this.setData({
            blackWins: 0,
            whiteWins: 0
          });
          wx.showToast({
            title: '战绩已重置',
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
