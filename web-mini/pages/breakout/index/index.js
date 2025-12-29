var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    
    canvasWidth: 0,
    canvasHeight: 0,
    paddleX: 0, // 挡板X位置
    ballX: 0, // 球X位置
    ballY: 0, // 球Y位置
    ballVx: 0, // 球X速度
    ballVy: 0, // 球Y速度
    bricks: [], // 砖块数组
    score: 0,
    bestScore: 0,
    gameOver: false,
    gameStarted: false,
    gameLoop: null,
    paddleWidth: 80,
    paddleHeight: 10,
    ballRadius: 8,
    brickRows: 5,
    brickCols: 8,
    brickWidth: 0,
    brickHeight: 20,
    modalName: null // 模态框名称
  },

  onLoad: function () {
    this.setData({
      bestScore: wx.getStorageSync('breakout_bestScore') || 0
    });
  },

  onReady: function () {
    const that = this;
    // 获取系统信息
    const systemInfo = wx.getWindowInfo();
    // 计算canvas宽度：考虑padding(20rpx*2)和最大宽度限制(500rpx)
    // rpx转px: 1rpx = windowWidth / 750
    const rpxToPx = systemInfo.windowWidth / 750;
    const maxWidthRpx = 500;
    const paddingRpx = 40; // 左右padding各20rpx
    const maxWidthPx = maxWidthRpx * rpxToPx;
    const availableWidthPx = systemInfo.windowWidth - (paddingRpx * rpxToPx);
    let canvasWidth = Math.min(availableWidthPx, maxWidthPx);
    const canvasHeight = 400;
    
    // 计算砖块宽度：总宽度 - 左右边距(10*2) - 间距总数((brickCols-1)*4)
    const totalSpacing = (that.data.brickCols - 1) * 4; // 7个间距，每个4px
    const usableWidth = canvasWidth - 20; // 减去左右边距10*2
    let brickWidth = Math.floor((usableWidth - totalSpacing) / that.data.brickCols);
    
    // 验证并调整：确保最后一个砖块不会超出画布
    const lastBrickRight = 10 + (that.data.brickCols - 1) * (brickWidth + 4) + brickWidth;
    if (lastBrickRight >= canvasWidth) {
      // 如果超出，重新计算：确保最后一个砖块在画布内
      // 可用宽度 = canvasWidth - 10(左边距) - 10(右边距) - 总间距
      const adjustedUsableWidth = canvasWidth - 20 - totalSpacing;
      brickWidth = Math.floor(adjustedUsableWidth / that.data.brickCols);
    }
    
    that.setData({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      brickWidth: brickWidth
    });
    
    // 延迟初始化，确保canvas已创建
    setTimeout(() => {
      that.initGame();
    }, 100);
  },

  onUnload: function () {
    this.stopGame();
  },

  // 初始化游戏
  initGame: function () {
    const width = this.data.canvasWidth;
    const height = this.data.canvasHeight;

    // 初始化挡板位置（居中）
    this.setData({
      paddleX: (width - this.data.paddleWidth) / 2,
      ballX: width / 2,
      ballY: height - 50,
      ballVx: 3,
      ballVy: -3,
      score: 0,
      gameOver: false,
      gameStarted: false
    });

    // 生成砖块
    this.generateBricks();
    this.draw();
  },

  // 生成砖块
  generateBricks: function () {
    const bricks = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5'];
    const brickWidth = this.data.brickWidth;
    const brickHeight = this.data.brickHeight;
    const startX = 10;
    const startY = 50;
    const spacing = 4;

    for (let row = 0; row < this.data.brickRows; row++) {
      for (let col = 0; col < this.data.brickCols; col++) {
        bricks.push({
          x: startX + col * (brickWidth + spacing),
          y: startY + row * (brickHeight + spacing),
          width: brickWidth,
          height: brickHeight,
          color: colors[row % colors.length],
          visible: true
        });
      }
    }

    this.setData({ bricks: bricks });
  },

  // 开始游戏
  startGame: function () {
    if (this.data.gameStarted) return;

    this.setData({ gameStarted: true });
    this.gameLoop = setInterval(() => {
      this.update();
      this.draw();
    }, 16); // 约60fps
  },

  // 停止游戏
  stopGame: function () {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.setData({ gameStarted: false });
  },

  // 更新游戏状态
  update: function () {
    if (this.data.gameOver) {
      this.stopGame();
      return;
    }

    const width = this.data.canvasWidth;
    const height = this.data.canvasHeight;
    let ballX = this.data.ballX + this.data.ballVx;
    let ballY = this.data.ballY + this.data.ballVy;
    let ballVx = this.data.ballVx;
    let ballVy = this.data.ballVy;
    const radius = this.data.ballRadius;

    // 左右边界反弹
    if (ballX - radius <= 0 || ballX + radius >= width) {
      ballVx = -ballVx;
      ballX = ballX - radius <= 0 ? radius : width - radius;
    }

    // 上边界反弹
    if (ballY - radius <= 0) {
      ballVy = -ballVy;
      ballY = radius;
    }

    // 下边界（游戏结束）
    if (ballY + radius >= height) {
      this.gameOver();
      return;
    }

    // 检测与挡板碰撞
    const paddleX = this.data.paddleX;
    const paddleY = height - 30;
    if (ballY + radius >= paddleY && 
        ballY - radius <= paddleY + this.data.paddleHeight &&
        ballX >= paddleX && 
        ballX <= paddleX + this.data.paddleWidth) {
      ballVy = -Math.abs(ballVy); // 确保向上
      ballY = paddleY - radius;
      // 根据击中挡板的位置调整角度
      const hitPos = (ballX - paddleX) / this.data.paddleWidth;
      ballVx = (hitPos - 0.5) * 6;
    }

    // 检测与砖块碰撞
    const bricks = this.data.bricks;
    let score = this.data.score;
    let allBricksGone = true;

    for (let i = 0; i < bricks.length; i++) {
      if (!bricks[i].visible) continue;
      
      allBricksGone = false;
      const brick = bricks[i];

      if (ballX + radius >= brick.x &&
          ballX - radius <= brick.x + brick.width &&
          ballY + radius >= brick.y &&
          ballY - radius <= brick.y + brick.height) {
        // 碰撞了
        bricks[i].visible = false;
        score += 10;
        ballVy = -ballVy;
        break;
      }
    }

    // 检查是否所有砖块都被消除
    if (allBricksGone) {
      this.levelComplete();
      return;
    }

    this.setData({
      ballX: ballX,
      ballY: ballY,
      ballVx: ballVx,
      ballVy: ballVy,
      score: score,
      bricks: bricks
    });

    // 更新最佳成绩
    if (score > this.data.bestScore) {
      this.setData({ bestScore: score });
      wx.setStorageSync('breakout_bestScore', score);
    }
  },

  // 绘制
  draw: function () {
    const ctx = wx.createCanvasContext('gameCanvas', this);
    const width = this.data.canvasWidth;
    const height = this.data.canvasHeight;

    // 清空画布
    ctx.setFillStyle('#000');
    ctx.fillRect(0, 0, width, height);

    // 绘制砖块
    const bricks = this.data.bricks;
    for (let i = 0; i < bricks.length; i++) {
      if (bricks[i].visible) {
        ctx.setFillStyle(bricks[i].color);
        ctx.fillRect(bricks[i].x, bricks[i].y, bricks[i].width, bricks[i].height);
        ctx.setStrokeStyle('#fff');
        ctx.strokeRect(bricks[i].x, bricks[i].y, bricks[i].width, bricks[i].height);
      }
    }

    // 绘制挡板
    ctx.setFillStyle('#4caf50');
    ctx.fillRect(this.data.paddleX, height - 30, this.data.paddleWidth, this.data.paddleHeight);

    // 绘制球
    ctx.setFillStyle('#fff');
    ctx.beginPath();
    ctx.arc(this.data.ballX, this.data.ballY, this.data.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.draw();
  },

  // 移动挡板
  movePaddle: function (e) {
    if (this.data.gameOver || !this.data.gameStarted) {
      if (!this.data.gameStarted) {
        this.startGame();
      }
      return;
    }

    const touch = e.touches[0];
    const query = wx.createSelectorQuery().in(this);
    query.select('.canvas-container').boundingClientRect((rect) => {
      if (rect) {
        const x = touch.clientX - rect.left;
        const paddleX = Math.max(0, Math.min(x - this.data.paddleWidth / 2, this.data.canvasWidth - this.data.paddleWidth));
        this.setData({ paddleX: paddleX });
      }
    }).exec();
  },

  // 游戏结束
  gameOver: function () {
    this.setData({ gameOver: true });
    this.stopGame();

    // 上传游戏数据
    gameUpload.uploadGameScore({
      gameName: 'breakout',
      score: this.data.score
    });

    wx.showModal({
      title: '游戏结束',
      content: `得分：${this.data.score}`,
      showCancel: false,
      confirmText: '再来一局'
    });
  },

  // 关卡完成
  levelComplete: function () {
    this.setData({ gameOver: true });
    this.stopGame();

    // 上传游戏数据
    gameUpload.uploadGameScore({
      gameName: 'breakout',
      score: this.data.score,
      extraData: {
        completed: true
      }
    });

    wx.showModal({
      title: '恭喜！',
      content: `你消除了所有砖块！得分：${this.data.score}`,
      showCancel: false,
      confirmText: '再来一局'
    });
  },

  // 重新开始
  restart: function () {
    this.stopGame();
    this.initGame();
  },

  // 重置最佳成绩
  resetBest: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('breakout_bestScore');
          this.setData({ bestScore: 0 });
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
