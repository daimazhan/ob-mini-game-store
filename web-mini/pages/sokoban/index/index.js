var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

// 地图参考：https://www.bilibili.com/list/396430505/
Page({
  data: {
    CustomBar: app.globalData.CustomBar,

    level: 1, // 当前关卡
    board: [], // 游戏棋盘
    player: { row: 0, col: 0 }, // 玩家位置
    boxes: [], // 箱子位置 [{row, col}]
    targets: [], // 目标位置 [{row, col}]
    moves: 0, // 移动次数
    gameWon: false,
    bestMoves: 0, // 最佳步数
    modalName: null // 模态框名称
  },

  onLoad: function () {
    this.setData({
      bestMoves: wx.getStorageSync('sokoban_bestMoves') || 0
    });
    this.initLevel();
  },

  // 初始化关卡
  initLevel: function () {
    // 简单的关卡设计（5x5）
    const levelData = this.getLevelData(this.data.level);
    
    this.setData({
      board: levelData.board,
      player: levelData.player,
      boxes: levelData.boxes,
      targets: levelData.targets,
      moves: 0,
      gameWon: false
    });
  },

  // 获取关卡数据
  getLevelData: function (level) {
    // 关卡1：入门 - 4个箱子，无障碍物
    if (level === 1) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', '.', '#', '#', '#', '#'],
          ['#', '#', '#', ' ', '#', '#', '#', '#'],
          ['#', '#', '#', '$', ' ', '$', '.', '#'],
          ['#', '.', ' ', '$', '@', '#', '#', '#'],
          ['#', '#', '#', '#', '$', '#', '#', '#'],
          ['#', '#', '#', '#', '.', '#', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 4, col: 4 },
        boxes: [{ row: 4, col: 3 }, { row: 3, col: 3 }, { row: 5, col: 4 }, { row: 3, col: 5 }],
        targets: [{ row: 1, col: 3 }, { row: 3, col: 6 }, { row: 4, col: 1 }, { row: 6, col: 4 }]
      };
    }
    // 关卡2：初级 - 3个箱子，增加简单障碍
    if (level === 2) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '@', ' ', ' ', '#', '#', '#', '#', '#'],
          ['#', ' ', '$', '$', '#', '#', '#', '#', '#'],
          ['#', ' ', '$', ' ', '#', '#', '#', '.', '#'],
          ['#', '#', '#', ' ', '#', '#', '#', '.', '#'],
          ['#', '#', '#', ' ', ' ', ' ', ' ', '.', '#'],
          ['#', ' ', ' ', ' ', ' ', '#', ' ', ' ', '#'],
          ['#', ' ', ' ', ' ', ' ', '#', ' ', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 1, col: 1 },
        boxes: [{ row: 3, col: 2 }, { row: 2, col:2 }, {row: 2, col: 3}],
        targets: [{ row: 3, col: 7 }, { row: 4, col: 7 }, {row: 5, col: 7}]
      };
    }
    // 关卡3：中级 - 4个箱子，需要绕行障碍
    if (level === 3) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
          ['#', '#', '$', '#', '#', '#', ' ', ' ', ' ', '#'],
          ['#', ' ', ' ', '@', ' ', ' ', ' ', '$', ' ', '#'],
          ['#', ' ', '.', '.', '#', ' ', '$', ' ', '#', '#'],
          ['#', '#', '.', '.', '#', ' ', ' ', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 3, col: 3 },
        boxes: [{ row: 2, col: 2 },{ row: 3, col: 4 },{ row: 3, col: 7 },{ row: 4, col: 6 }],
        targets: [{ row: 4, col: 2 },{ row: 4, col: 3 },{ row: 5, col: 2 },{ row: 5, col: 3 }]
      };
    }
    // 关卡4：中高级 - 5个箱子，增加障碍物形成通道
    if (level === 4) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#'],
          ['#', '#', ' ', ' ', '#', '#'],
          ['#', '@', '$', ' ', '#', '#'],
          ['#', '#', '$', ' ', '#', '#'],
          ['#', '#', ' ', '$', ' ', '#'],
          ['#', '.', '$', ' ', ' ', '#'],
          ['#', '.', '.', '.', '.', '#'],
          ['#', '#', '#', '#', '#', '#']
        ],
        player: { row: 2, col: 1 },
        boxes: [{ row: 3, col: 2 }, { row: 2, col:2 }, {row: 4, col: 3}, {row: 5, col: 2}, {row: 6, col: 3}],
        targets: [{ row: 5, col: 1 }, { row: 6, col: 1 }, {row: 6, col: 2}, {row: 6, col: 3}, {row: 6, col: 4}]
      };
    }
    // 关卡5：高级 - 3个箱子，复杂迷宫布局
    if (level === 5) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '@', ' ', '#', '#', '#', '#'],
          ['#', '#', ' ', '$', ' ', ' ', '#', '#'],
          ['#', '#', '#', ' ', '#', ' ', '#', '#'],
          ['#', '.', '#', ' ', '#', ' ', ' ', '#'],
          ['#', '.', '$', ' ', ' ', '#', ' ', '#'],
          ['#', '.', ' ', ' ', ' ', '$', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 1, col: 2 },
        boxes: [{ row: 2, col: 3 }, { row: 5, col: 2 },{ row: 6, col: 5 }],
        targets: [{ row: 4, col: 1 }, { row: 5, col: 1 },{ row: 6, col: 1 }]
      };
    }
    // 关卡6：高级+ - 5个箱子，狭窄通道
    if (level === 6) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', '#'],
          ['#', ' ', ' ', ' ', '.', '#', '#', '#', ' ', '#', '#', '#', '#'],
          ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', ' ', '#', '#', '#', '#'],
          ['#', ' ', '#', ' ', '$', ' ', '$', '#', '.', ' ', '#', '#', '#'],
          ['#', ' ', '#', ' ', ' ', '.', ' ', ' ', '#', ' ', '#', '#', '#'],
          ['#', ' ', '.', '#', '$', ' ', '$', ' ', '#', ' ', '#', '#', '#'],
          ['#', '#', ' ', ' ', ' ', ' ', '#', ' ', '#', ' ', '#', '#', '#'],
          ['#', '#', ' ', '#', '#', '#', '.', ' ', ' ', ' ', ' ', '@', '#'],
          ['#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 8, col: 11 },
        boxes: [{ row: 4, col: 4 }, { row: 4, col: 6 }, { row: 5, col: 5 }, { row: 6, col: 4 }, { row: 6, col: 6 }],
        targets: [{ row: 2, col: 4 }, { row: 4, col: 8 }, { row: 5, col: 5 }, { row: 6, col: 2 }, { row: 8, col: 6 }]
      };
    }
    // 关卡7：专家 - 5个箱子，复杂障碍布局
    if (level === 7) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', '#', ' ', ' ', '#', ' ', '@', '#'],
          ['#', '#', '#', ' ', ' ', ' ', '#', ' ', ' ', '#'],
          ['#', '#', '#', '$', ' ', '$', ' ', '$', ' ', '#'],
          ['#', '#', '#', ' ', '$', '#', '#', ' ', ' ', '#'],
          ['#', '#', '#', ' ', '$', ' ', '#', ' ', '#', '#'],
          ['#', '.', '.', '.', '.', '.', ' ', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 1, col: 8 },
        boxes: [{ row: 3, col: 3 }, { row: 3, col: 5 }, { row: 3, col: 7 }, { row: 4, col: 4 }, { row: 5, col: 4 }],
        targets: [{ row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }]
      };
    }
    // 关卡8：专家+ - 5个箱子，多重障碍
    if (level === 8) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', '#', ' ', ' ', ' ', ' ', '#', '#'],
          ['#', '#', '.', ' ', '$', '#', '#', ' ', '#', '#'],
          ['#', '.', '.', '$', ' ', '$', ' ', ' ', '@', '#'],
          ['#', '.', '.', ' ', '$', ' ', '$', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', ' ', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 3, col: 8 },
        boxes: [{ row: 2, col: 4 }, { row: 3, col: 3 },{ row: 3, col: 5 }, { row: 4, col: 4 },{ row: 4, col: 6 }],
        targets: [{ row: 2, col: 2 }, { row: 3, col: 1 },{ row: 3,col: 2 }, { row: 4, col: 1 },{ row: 4, col: 2 }]
      };
    }
    // 关卡9：大师 - 6个箱子，最复杂障碍
    if (level === 9) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', ' ', ' ', '#', '#', ' ', ' ', ' ', '#', '#'],
          ['#', '#', ' ', ' ', ' ', '$', ' ', ' ', ' ', '#', '#'],
          ['#', '#', '$', ' ', '#', '#', '#', ' ', '$', '#', '#'],
          ['#', '#', ' ', '#', '.', '.', '.', '#', ' ', '#', '#'],
          ['#', '#', ' ', '#', '.', '.', '.', '#', ' ', '#', '#'],
          ['#', ' ', '$', ' ', ' ', '$', ' ', ' ', '$', '#', '#'],
          ['#', ' ', ' ', ' ', ' ', ' ', '#', ' ', '@', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 7, col: 8 },
        boxes: [{ row: 2, col: 5 }, { row: 3, col: 2 }, { row: 3, col: 8 },{ row: 6, col: 2 }, { row: 6, col: 5 }, { row: 6, col: 8 }],
        targets: [{ row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },{ row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }]
      };
    }
    // 关卡10：终极挑战 - 5个箱子，最复杂迷宫
    if (level === 10) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', ' ', ' ', ' ', ' ', '#'],
          ['#', '#', '#', '$', '$', '$', ' ', '#'],
          ['#', '@', ' ', '$', '.', '.', ' ', '#'],
          ['#', ' ', '$', '.', '.', '.', '#', '#'],
          ['#', '#', '#', '#', ' ', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 3, col: 1 },
        boxes: [{ row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 3, col: 3 }, { row: 4, col: 2 }],
        targets: [{ row: 3, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }]
      };
    }
    // 关卡11：超难 - 4个箱子，多重狭窄通道
    if (level === 11) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', ' ', ' ', '#', '#', '#', '#', ' ', ' ', ' ', '#'],
          ['#', ' ', '$', ' ', '#', '#', '#', '#', '$', ' ', ' ', '#'],
          ['#', ' ', ' ', '$', '.', '.', '.', '.', ' ', '$', ' ', '#'],
          ['#', '#', ' ', ' ', ' ', ' ', '#', ' ', '@', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 4, col: 8 },
        boxes: [{ row: 2, col: 2 }, { row: 3, col: 3 },{ row: 2, col: 8 }, { row: 3, col: 9 }],
        targets: [{ row: 3, col: 4 }, { row: 3, col: 5 },{ row: 3, col: 6 }, { row: 3, col: 7 }]
      };
    }
    // 关卡12：超难+ - 4个箱子，复杂障碍网络
    if (level === 12) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', ' ', ' ', '@', '#', '#'],
          ['#', ' ', ' ', '$', '.', ' ', '#', '#'],
          ['#', ' ', ' ', '.', '$', '.', ' ', '#'],
          ['#', '#', '#', ' ', '.', '$', ' ', '#'],
          ['#', '#', '#', ' ', ' ', ' ', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#'],
        ],
        player: { row: 1, col: 5 },
        boxes: [{ row: 2, col: 3 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 4, col: 5 }],
        targets: [{ row: 2, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 4, col: 4 }]
      };
    }
    // 关卡13：地狱难度 - 4个箱子，极复杂迷宫
    if (level === 13) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', '#', '.', '.', '#', '#', '#'],
          ['#', '#', '#', ' ', '.', '#', '#', '#'],
          ['#', '#', ' ', ' ', '$', '.', '#', '#'],
          ['#', '#', ' ', '$', ' ', ' ', '#', '#'],
          ['#', ' ', ' ', '#', '$', '$', ' ', '#'],
          ['#', ' ', ' ', '@', ' ', ' ', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 6, col: 3 },
        boxes: [{ row: 3, col: 4 }, { row: 4, col: 3 },{ row: 5, col: 4 }, { row: 5, col: 5 }],
        targets: [{ row: 1, col: 3 }, { row: 1, col: 4 },{ row: 2, col: 4 }, { row: 3, col: 5 }]
      };
    }
    // 关卡14：地狱+ - 6个箱子，终极迷宫
    if (level === 14) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', ' ', ' ', '#', ' ', ' ', ' ', '#'],
          ['#', ' ', '$', '.', '.', '$', ' ', '#'],
          ['#', '@', '$', '.', '.', ' ', '#', '#'],
          ['#', ' ', '$', '.', '.', '$', ' ', '#'],
          ['#', ' ', ' ', '#', ' ', ' ', ' ', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 3, col: 1 },
        boxes: [{ row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 },{ row: 2, col: 5 }, { row: 3, col: 4 }, { row: 4, col: 5 }],
        targets: [{ row: 2, col: 3 }, { row: 2, col: 4 }, { row: 3, col: 3 },{ row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 }]
      };
    }
    // 关卡15：终极挑战 - 6个箱子，最复杂障碍布局
    if (level === 15) {
      return {
        board: [
          ['#', '#', '#', '#', '#', '#', '#', '#'],
          ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
          ['#', ' ', '$', ' ', '$', '$', ' ', '#'],
          ['#', '.', '.', '.', '.', '.', '.', '#'],
          ['#', ' ', '$', '$', ' ', '$', ' ', '#'],
          ['#', '#', '#', ' ', '@', '#', '#', '#'],
          ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        player: { row: 5, col: 4 },
        boxes: [{ row: 2, col: 2 }, { row: 2, col: 4 },{ row: 2, col: 5 }, { row: 4, col: 2 },{ row: 4, col: 3 }, { row: 4, col: 5 }],
        targets: [{ row: 3, col: 1 }, { row: 3, col: 2 },{ row: 3, col: 3 }, { row: 3, col: 4 },{ row: 3, col: 5 }, { row: 3, col: 6 }]
      };
    }
    // 默认返回关卡1
    return this.getLevelData(1);
  },

  // 移动
  move: function (direction) {
    if (this.data.gameWon) return;

    const player = { ...this.data.player };
    const boxes = this.data.boxes.map(b => ({ ...b }));
    const board = this.data.board.map(row => [...row]);
    const moves = this.data.moves + 1;

    let newRow = player.row;
    let newCol = player.col;

    // 计算新位置
    switch (direction) {
      case 'up':
        newRow--;
        break;
      case 'down':
        newRow++;
        break;
      case 'left':
        newCol--;
        break;
      case 'right':
        newCol++;
        break;
    }

    // 检查边界
    if (newRow < 0 || newRow >= board.length ||
        newCol < 0 || newCol >= board[0].length) {
      return;
    }

    // 检查墙壁
    if (board[newRow][newCol] === '#') {
      return;
    }

    // 检查是否有箱子
    const boxIndex = boxes.findIndex(b => b.row === newRow && b.col === newCol);
    if (boxIndex > -1) {
      // 有箱子，计算箱子新位置
      let boxNewRow = newRow;
      let boxNewCol = newCol;

      switch (direction) {
        case 'up':
          boxNewRow--;
          break;
        case 'down':
          boxNewRow++;
          break;
        case 'left':
          boxNewCol--;
          break;
        case 'right':
          boxNewCol++;
          break;
      }

      // 检查箱子新位置的边界
      if (boxNewRow < 0 || boxNewRow >= board.length ||
          boxNewCol < 0 || boxNewCol >= board[0].length) {
        return; // 箱子不能移动（超出边界）
      }

      // 检查箱子新位置是否是墙壁
      if (board[boxNewRow][boxNewCol] === '#') {
        return; // 箱子不能移动（撞墙）
      }

      // 检查箱子新位置是否有其他箱子（排除当前正在移动的箱子）
      const otherBoxIndex = boxes.findIndex((b, idx) => idx !== boxIndex && b.row === boxNewRow && b.col === boxNewCol);
      if (otherBoxIndex > -1) {
        return; // 有其他箱子，不能移动
      }

      // 可以推动箱子，移动箱子
      boxes[boxIndex] = { row: boxNewRow, col: boxNewCol };
    }

    // 移动玩家到新位置
    player.row = newRow;
    player.col = newCol;

    // 检查是否完成
    let allOnTarget = true;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const onTarget = this.data.targets.findIndex(t => t.row === box.row && t.col === box.col) > -1;
      if (!onTarget) {
        allOnTarget = false;
        break;
      }
    }

    this.setData({
      player: player,
      boxes: boxes,
      moves: moves,
      gameWon: allOnTarget
    });

    if (allOnTarget) {
      this.gameWin();
    }
  },

  // 游戏胜利
  gameWin: function () {
    let bestMoves = this.data.bestMoves;
    let newRecord = false;

    if (bestMoves === 0 || this.data.moves < bestMoves) {
      bestMoves = this.data.moves;
      wx.setStorageSync('sokoban_bestMoves', bestMoves);
      newRecord = true;
    }

    this.setData({ bestMoves: bestMoves });

    // 上传游戏数据（步数越少越好，但后端按分数降序排列，所以用10000-步数作为分数）
    gameUpload.uploadGameScore({
      gameName: 'sokoban',
      score: 10000 - this.data.moves, // 步数越少分数越高
      difficulty: `level${this.data.level}`,
      extraData: {
        level: this.data.level,
        moves: this.data.moves
      }
    });

    wx.showModal({
      title: '恭喜完成！',
      content: `用了 ${this.data.moves} 步${newRecord ? '\n🎉 新纪录！' : ''}`,
      showCancel: true,
      cancelText: '再来一局',
      confirmText: '下一关',
      success: (res) => {
        if (res.confirm) {
          this.nextLevel();
        } else if (res.cancel) {
          this.restart();
        }
      }
    });
  },

  // 下一关
  nextLevel: function () {
    const level = this.data.level + 1;
    this.setData({ level: level });
    this.initLevel();
  },

  // 重新开始
  restart: function () {
    this.initLevel();
  },

  // 方向控制
  onDirectionTap: function (e) {
    const direction = e.currentTarget.dataset.direction;
    this.move(direction);
  },

  // 重置最佳成绩
  resetBest: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('sokoban_bestMoves');
          this.setData({ bestMoves: 0 });
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  showModal: function (e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    });
  },

  hideModal: function () {
    this.setData({
      modalName: null
    });
  },
  goto(e){
    util.goto(e.currentTarget.dataset.url)
  }
});
