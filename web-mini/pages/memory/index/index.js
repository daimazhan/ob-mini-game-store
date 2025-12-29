var app = getApp();
const gameUpload = require('../../../utils/gameUpload.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cards: [], // 卡片数组
    flippedCards: [], // 已翻开的卡片索引
    matchedPairs: [], // 已匹配的卡片对
    moves: 0, // 移动次数
    pairs: 0, // 已匹配的对数
    gameOver: false,
    bestScore: 0, // 最佳成绩
    cardSize: 4, // 4x4 = 16张卡片，8对
    canFlip: true // 是否可以翻牌（防止快速连续点击）
  },

  onLoad: function () {
    // 从本地存储加载最佳成绩
    this.setData({
      bestScore: wx.getStorageSync('memory_bestScore') || 0
    });
    this.initGame();
  },

  // 初始化游戏
  initGame: function () {
    const size = this.data.cardSize;
    const totalPairs = (size * size) / 2;
    
    // 生成卡片对（使用emoji作为图案）
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', 
                     '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                     '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺'];
    
    let cardValues = [];
    for (let i = 0; i < totalPairs; i++) {
      cardValues.push(symbols[i]);
      cardValues.push(symbols[i]);
    }
    
    // 打乱顺序
    cardValues = this.shuffleArray(cardValues);
    
    // 创建卡片对象
    const cards = cardValues.map((value, index) => ({
      id: index,
      value: value,
      flipped: false,
      matched: false
    }));

    this.setData({
      cards: cards,
      flippedCards: [],
      matchedPairs: [],
      moves: 0,
      pairs: 0,
      gameOver: false,
      canFlip: true
    });
  },

  // 打乱数组
  shuffleArray: function (array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // 点击卡片
  onCardTap: function (e) {
    if (!this.data.canFlip || this.data.gameOver) {
      return;
    }

    const cardId = e.currentTarget.dataset.id;
    const card = this.data.cards[cardId];

    // 如果卡片已翻开或已匹配，则不允许操作
    if (card.flipped || card.matched) {
      return;
    }

    // 如果已经翻开了两张卡片，需要先处理
    if (this.data.flippedCards.length >= 2) {
      return;
    }

    // 翻开卡片
    const cards = this.data.cards;
    cards[cardId].flipped = true;
    const flippedCards = [...this.data.flippedCards, cardId];

    this.setData({
      cards: cards,
      flippedCards: flippedCards
    });

    // 如果翻开了两张卡片，检查是否匹配
    if (flippedCards.length === 2) {
      this.checkMatch(flippedCards);
    }
  },

  // 检查两张卡片是否匹配
  checkMatch: function (flippedCards) {
    this.setData({ canFlip: false });

    const [id1, id2] = flippedCards;
    const card1 = this.data.cards[id1];
    const card2 = this.data.cards[id2];
    const moves = this.data.moves + 1;

    if (card1.value === card2.value) {
      // 匹配成功
      const cards = this.data.cards;
      cards[id1].matched = true;
      cards[id2].matched = true;
      
      const pairs = this.data.pairs + 1;
      const totalPairs = (this.data.cardSize * this.data.cardSize) / 2;
      const gameOver = pairs === totalPairs;

      // 更新最佳成绩
      let bestScore = this.data.bestScore;
      if (gameOver && (bestScore === 0 || moves < bestScore)) {
        bestScore = moves;
        wx.setStorageSync('memory_bestScore', bestScore);
        wx.showToast({
          title: '新纪录！',
          icon: 'success',
          duration: 2000
        });
      }

      this.setData({
        cards: cards,
        flippedCards: [],
        matchedPairs: [...this.data.matchedPairs, id1, id2],
        moves: moves,
        pairs: pairs,
        gameOver: gameOver,
        bestScore: bestScore,
        canFlip: true
      });

      if (gameOver) {
        // 上传游戏数据
        gameUpload.uploadGameScore({
          gameName: 'memory',
          score: pairs, // 匹配的对数作为分数
          extraData: {
            moves: moves,
            pairs: pairs
          }
        });
        
        setTimeout(() => {
          wx.showModal({
            title: '恭喜！',
            content: `你用了 ${moves} 步完成了游戏！`,
            showCancel: false,
            confirmText: '再来一局'
          });
        }, 500);
      }
    } else {
      // 不匹配，延迟后翻回
      setTimeout(() => {
        const cards = this.data.cards;
        cards[id1].flipped = false;
        cards[id2].flipped = false;

        this.setData({
          cards: cards,
          flippedCards: [],
          moves: moves,
          canFlip: true
        });
      }, 1000);
    }
  },

  // 重新开始游戏
  restart: function () {
    this.initGame();
  },

  // 重置最佳成绩
  resetBestScore: function () {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置最佳成绩吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('memory_bestScore');
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
