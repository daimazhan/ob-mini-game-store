// 游戏数据上传工具
const http = require('./http.js');

/**
 * 上传游戏成绩
 * @param {Object} params 游戏数据
 * @param {String} params.gameName 游戏名称（如：'2048', 'shooter', 'gomoku'等）
 * @param {Number} params.score 分数（可选）
 * @param {Number} params.duration 游戏时长（秒，可选）
 * @param {String} params.difficulty 难度（可选）
 * @param {Object} params.extraData 额外数据（可选，会被转换为JSON字符串）
 * @returns {Promise} 上传结果
 */
function uploadGameScore(params) {
  const { gameName, score, duration, difficulty, extraData } = params;
  
  // 构建请求数据
  const requestData = {
    gameName: gameName
  };
  
  if (score !== undefined && score !== null) {
    requestData.score = score;
  }
  
  if (duration !== undefined && duration !== null) {
    requestData.duration = duration;
  }
  
  if (difficulty) {
    requestData.difficulty = difficulty;
  }
  
  if (extraData) {
    requestData.extraData = typeof extraData === 'string' ? extraData : JSON.stringify(extraData);
  }
  
  // 调用上传接口
  return http.post('/game/submitScore', requestData)
    .then(res => {
      console.log('游戏成绩上传成功:', res);
      return res;
    })
    .catch(err => {
      console.error('游戏成绩上传失败:', err);
      // 静默失败，不影响游戏体验
      return null;
    });
}

module.exports = {
  uploadGameScore
};

