//获取应用实例
var app = getApp();

var config = {
    data: {
      StatusBar: app.globalData.StatusBar,
      userInfo: wx.getStorageSync('userInfo'),
        disable: false,
        gameList: [
            { id: '2048', name: '2048' },
            { id: 'tictactoe', name: '井字棋' },
            { id: 'memory', name: '记忆翻牌' },
            { id: 'puzzle15', name: '数字华容道' },
            { id: 'spotdiff', name: '找不同' },
            { id: 'numberelim', name: '数字消除' },
            { id: 'gomoku', name: '五子棋' },
            { id: 'shooter', name: '射击游戏' },
            { id: 'breakout', name: '打砖块' },
            { id: 'sokoban', name: '推箱子' }
        ]
    },

    onLoad: function() {
        var that = this
            //调用应用实例的方法获取全局数据
        // app.getUserInfo(function(userInfo) {
        //     //更新数据
        //     that.setData({
        //         userInfo: userInfo
        //     })
        // })
    }
};

config.data.gameList.forEach(function(game) {
    config['start' + game.id] = function() {
        config.data.disable = true;

        // 这里需要注意每个游戏文件夹名称需和js名称保持一致
        wx.navigateTo({
            url: '../' + game.id + '/index/index'
        })
    }
});

Page(config);
