var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    CustomBar: app.globalData.CustomBar,

    gameStarted: false,
    gameOver: false,
    score: 0,
    bestScore: 0,
    playerX: 0, // 玩家X坐标（百分比）
    bullets: [], // 子弹数组 [{x, y}]
    enemies: [], // 敌人数组 [{x, y, id}]
    gameLoop: null, // 游戏循环定时器
    enemySpawnTimer: null, // 敌人生成定时器
    bulletSpawnTimer: null, // 子弹自动发射定时器
    canvasWidth: 0,
    canvasHeight: 0,
    startTime: 0 // 游戏开始时间
  },

  onLoad: function() {
    // 获取最佳分数
    this.setData({
      bestScore: wx.getStorageSync('shooter_bestScore') || 0
    });
    
    // 获取系统信息，设置画布尺寸
    const deviceInfo = wx.getWindowInfo();
    const canvasWidth = deviceInfo.windowWidth - 40; // 减去左右padding
    const canvasHeight = Math.min(deviceInfo.windowHeight - 300, 500); // 留出UI空间，最大500px
    
    this.setData({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight
    });
  },

  onReady: function() {
    const that = this;
    
    // 确保尺寸已设置
    if (that.data.canvasWidth <= 0 || that.data.canvasHeight <= 0) {
      const deviceInfo = wx.getWindowInfo();
      const canvasWidth = deviceInfo.windowWidth - 40;
      const canvasHeight = Math.min(deviceInfo.windowHeight - 300, 500);
      that.setData({
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      }, () => {
        // 尺寸设置完成后再初始化Canvas
        that.initCanvas();
      });
    } else {
      that.initCanvas();
    }
  },

  // 初始化Canvas
  initCanvas: function() {
    const that = this;
    // 使用setTimeout确保DOM已渲染
    setTimeout(() => {
      try {
        that.ctx = wx.createCanvasContext('gameCanvas', that);
        // 立即绘制一次，确保Canvas可见
        that.draw();
      } catch (e) {
        console.error('Canvas init error:', e);
      }
    }, 100);
  },

  // 开始游戏
  startGame: function() {
    // 确保Canvas已初始化
    if (!this.ctx) {
      this.ctx = wx.createCanvasContext('gameCanvas', this);
    }

    this.setData({
      gameStarted: true,
      gameOver: false,
      score: 0,
      playerX: 50, // 初始位置居中
      bullets: [],
      enemies: [],
      startTime: Date.now()
    }, () => {
      // 数据设置完成后再开始游戏循环
      this.draw();
      // 延迟一下再开始循环，确保绘制完成
      setTimeout(() => {
        // 开始游戏循环
        this.startGameLoop();
        // 开始生成敌人
        this.startEnemySpawn();
        // 开始自动发射子弹
        this.startAutoShoot();
      }, 100);
    });
  },

  // 游戏主循环
  startGameLoop: function() {
    const loop = () => {
      if (!this.data.gameStarted || this.data.gameOver) {
        return;
      }

      this.updateGame();
      this.draw();
      
      this.data.gameLoop = setTimeout(loop, 16); // 约60fps
    };
    loop();
  },

  // 更新游戏状态
  updateGame: function() {
    let bullets = [...this.data.bullets];
    let enemies = [...this.data.enemies];
    let score = this.data.score;
    let gameOver = false;

    // 更新子弹位置（向上移动）
    bullets = bullets.map(bullet => ({
      ...bullet,
      y: bullet.y - 5
    })).filter(bullet => bullet.y > 0); // 移除超出屏幕的子弹

    // 更新敌人位置（向下移动）
    enemies = enemies.map(enemy => ({
      ...enemy,
      y: enemy.y + 2
    }));

    // 检测子弹与敌人碰撞
    bullets.forEach((bullet, bIndex) => {
      enemies.forEach((enemy, eIndex) => {
        const distance = Math.sqrt(
          Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        if (distance < 20) {
          // 碰撞发生
          bullets.splice(bIndex, 1);
          enemies.splice(eIndex, 1);
          score += 10;
        }
      });
    });

    // 检测玩家与敌人碰撞
    const playerY = this.data.canvasHeight - 30;
    enemies.forEach((enemy, index) => {
      const distance = Math.abs(enemy.x - this.data.playerX * this.data.canvasWidth / 100);
      if (enemy.y >= playerY - 20 && distance < 30) {
        gameOver = true;
      }
    });

    // 移除超出屏幕的敌人
    enemies = enemies.filter(enemy => enemy.y < this.data.canvasHeight + 20);

    // 检查游戏结束
    if (gameOver) {
      this.endGame();
    }

    this.setData({
      bullets: bullets,
      enemies: enemies,
      score: score
    });
  },

  // 开始生成敌人
  startEnemySpawn: function() {
    const spawn = () => {
      if (!this.data.gameStarted || this.data.gameOver) {
        return;
      }

      const enemies = [...this.data.enemies];
      enemies.push({
        x: Math.random() * (this.data.canvasWidth - 40) + 20,
        y: -20,
        id: Date.now() + Math.random()
      });

      this.setData({ enemies: enemies });

      // 根据分数调整生成速度（分数越高，生成越快）
      const spawnInterval = Math.max(800 - this.data.score * 2, 400);
      this.data.enemySpawnTimer = setTimeout(spawn, spawnInterval);
    };
    spawn();
  },

  // 开始自动发射子弹
  startAutoShoot: function() {
    const shoot = () => {
      if (!this.data.gameStarted || this.data.gameOver) {
        return;
      }

      const bullets = [...this.data.bullets];
      const playerX = this.data.playerX * this.data.canvasWidth / 100;
      const playerY = this.data.canvasHeight - 30;

      bullets.push({
        x: playerX,
        y: playerY
      });

      this.setData({ bullets: bullets });

      // 自动发射间隔（毫秒），可以根据需要调整
      const shootInterval = 200; // 每200ms发射一颗子弹
      this.data.bulletSpawnTimer = setTimeout(shoot, shootInterval);
    };
    shoot();
  },

  // 绘制游戏画面
  draw: function() {
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;
    const width = this.data.canvasWidth || 375;
    const height = this.data.canvasHeight || 500;
    
    if (width <= 0 || height <= 0) {
      return;
    }

    const playerX = this.data.playerX * width / 100;
    const playerY = height - 30;

    // 清空画布 - 使用实际尺寸
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    ctx.setFillStyle('#1a1a2e');
    ctx.fillRect(0, 0, width, height);

    // 只在游戏开始后绘制游戏元素
    if (this.data.gameStarted && !this.data.gameOver) {
      // 绘制玩家（三角形飞船）
      ctx.setFillStyle('#00ff00');
      ctx.beginPath();
      ctx.moveTo(playerX, playerY);
      ctx.lineTo(playerX - 15, playerY + 20);
      ctx.lineTo(playerX + 15, playerY + 20);
      ctx.closePath();
      ctx.fill();

      // 绘制子弹
      ctx.setFillStyle('#ffff00');
      this.data.bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 绘制敌人（红色方块）
      ctx.setFillStyle('#ff0000');
      this.data.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
      });
    } else {
      // 游戏未开始或已结束，只显示背景和玩家位置（如果已初始化）
      if (this.data.playerX > 0) {
        ctx.setFillStyle('#00ff00');
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(playerX - 15, playerY + 20);
        ctx.lineTo(playerX + 15, playerY + 20);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 必须调用draw()才能显示
    ctx.draw(false);
  },

  // 触摸移动（控制玩家）
  onTouchMove: function(e) {
    if (!this.data.gameStarted || this.data.gameOver) {
      return;
    }

    const touch = e.touches[0];
    // 使用触摸点的X坐标，转换为百分比
    const deviceInfo = wx.getWindowInfo();
    const x = (touch.clientX / deviceInfo.windowWidth) * 100;
    
    // 限制在屏幕范围内
    const playerX = Math.max(5, Math.min(95, x));
    
    this.setData({ playerX: playerX });
  },

  // 触摸开始（现在只用于移动，不再发射子弹，因为已改为自动发射）
  onTouchStart: function(e) {
    // 触摸开始事件保留，但不再发射子弹
    // 子弹现在由自动发射系统处理
  },

  // 结束游戏
  endGame: function() {
    // 清除定时器
    if (this.data.gameLoop) {
      clearTimeout(this.data.gameLoop);
    }
    if (this.data.enemySpawnTimer) {
      clearTimeout(this.data.enemySpawnTimer);
    }
    if (this.data.bulletSpawnTimer) {
      clearTimeout(this.data.bulletSpawnTimer);
    }

    // 计算游戏时长
    const duration = this.data.startTime > 0 ? Math.floor((Date.now() - this.data.startTime) / 1000) : 0;

    // 更新最佳分数
    let bestScore = this.data.bestScore;
    if (this.data.score > bestScore) {
      bestScore = this.data.score;
      wx.setStorageSync('shooter_bestScore', bestScore);
    }

    this.setData({
      gameOver: true,
      gameStarted: false,
      bestScore: bestScore
    });

    // 上传游戏数据
    gameUpload.uploadGameScore({
      gameName: 'shooter',
      score: this.data.score,
      duration: duration
    });

    wx.showModal({
      title: '游戏结束',
      content: `得分：${this.data.score}\n${this.data.score > this.data.bestScore ? '🎉 新纪录！' : ''}`,
      showCancel: false,
      confirmText: '再来一局',
      success: () => {
        this.setData({
          bullets: [],
          enemies: []
        });
        this.draw();
      }
    });
  },

  // 重新开始
  restart: function() {
    if (this.data.gameLoop) {
      clearTimeout(this.data.gameLoop);
    }
    if (this.data.enemySpawnTimer) {
      clearTimeout(this.data.enemySpawnTimer);
    }
    if (this.data.bulletSpawnTimer) {
      clearTimeout(this.data.bulletSpawnTimer);
    }

    this.setData({
      gameStarted: false,
      gameOver: false,
      bullets: [],
      enemies: []
    });
    this.draw();
  },

  // 重置最佳成绩
  resetBest: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('shooter_bestScore');
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

  onUnload: function() {
    // 页面卸载时清除定时器
    if (this.data.gameLoop) {
      clearTimeout(this.data.gameLoop);
    }
    if (this.data.enemySpawnTimer) {
      clearTimeout(this.data.enemySpawnTimer);
    }
    if (this.data.bulletSpawnTimer) {
      clearTimeout(this.data.bulletSpawnTimer);
    }
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
