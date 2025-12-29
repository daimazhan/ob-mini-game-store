var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    board: [['', '', ''], ['', '', ''], ['', '', '']], // 3x3棋盘
    currentPlayer: 'X', // 当前玩家，X先手
    gameOver: false,
    winner: '',
    moves: 0, // 总步数
    xWins: 0, // X获胜次数
    oWins: 0  // O获胜次数
  },

  onLoad: function () {
    // 从本地存储加载历史战绩
    this.setData({
      xWins: wx.getStorageSync('tictactoe_xWins') || 0,
      oWins: wx.getStorageSync('tictactoe_oWins') || 0
    });
  },

  // 处理点击格子
  onCellTap: function (e) {
    if (this.data.gameOver) {
      return;
    }

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;
    const board = this.data.board;

    // 如果该位置已有棋子，则不允许下
    if (board[row][col] !== '') {
      wx.showToast({
        title: '该位置已有棋子',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    // 更新棋盘
    board[row][col] = this.data.currentPlayer;
    const moves = this.data.moves + 1;

    // 检查是否获胜
    const winner = this.checkWinner(board, row, col);
    let gameOver = false;
    let xWins = this.data.xWins;
    let oWins = this.data.oWins;

    if (winner) {
      gameOver = true;
      if (winner === 'X') {
        xWins += 1;
        wx.setStorageSync('tictactoe_xWins', xWins);
      } else {
        oWins += 1;
        wx.setStorageSync('tictactoe_oWins', oWins);
      }
      
      // 上传游戏数据
      gameUpload.uploadGameScore({
        gameName: 'tictactoe',
        score: winner === 'X' ? 1 : 0,
        extraData: {
          winner: winner,
          moves: moves,
          xWins: xWins,
          oWins: oWins
        }
      });
      
      wx.showModal({
        title: '游戏结束',
        content: winner === 'X' ? 'X 获胜！' : 'O 获胜！',
        showCancel: false,
        confirmText: '再来一局'
      });
    } else if (moves === 9) {
      // 平局
      gameOver = true;
      
      // 上传游戏数据（平局）
      gameUpload.uploadGameScore({
        gameName: 'tictactoe',
        score: 0,
        extraData: {
          winner: 'draw',
          moves: moves
        }
      });
      
      wx.showModal({
        title: '游戏结束',
        content: '平局！',
        showCancel: false,
        confirmText: '再来一局'
      });
    }

    // 切换玩家
    const nextPlayer = this.data.currentPlayer === 'X' ? 'O' : 'X';

    this.setData({
      board: board,
      currentPlayer: nextPlayer,
      gameOver: gameOver,
      winner: winner,
      moves: moves,
      xWins: xWins,
      oWins: oWins
    });
  },

  // 检查是否获胜
  checkWinner: function (board, row, col) {
    const player = board[row][col];

    // 检查行
    if (board[row][0] === player && board[row][1] === player && board[row][2] === player) {
      return player;
    }

    // 检查列
    if (board[0][col] === player && board[1][col] === player && board[2][col] === player) {
      return player;
    }

    // 检查主对角线
    if (row === col && board[0][0] === player && board[1][1] === player && board[2][2] === player) {
      return player;
    }

    // 检查副对角线
    if (row + col === 2 && board[0][2] === player && board[1][1] === player && board[2][0] === player) {
      return player;
    }

    return null;
  },

  // 重新开始游戏
  restart: function () {
    this.setData({
      board: [['', '', ''], ['', '', ''], ['', '', '']],
      currentPlayer: 'X',
      gameOver: false,
      winner: '',
      moves: 0
    });
  },

  // 重置战绩
  resetScore: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有战绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('tictactoe_xWins');
          wx.removeStorageSync('tictactoe_oWins');
          this.setData({
            xWins: 0,
            oWins: 0
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
