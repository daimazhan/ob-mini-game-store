package com.diamazhan.minigame.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.diamazhan.minigame.entity.GameRanking;

import java.util.List;
import java.util.Map;

/**
 * 游戏排行服务接口
 *
 * @author ob
 */
public interface GameRankingService extends IService<GameRanking> {

    /**
     * 提交游戏成绩
     *
     * @param gameName 游戏名称
     * @param openid 用户openid
     * @param score 分数
     * @param duration 游戏时长（秒）
     * @param difficulty 难度等级（可选）
     * @param extraData 额外数据（JSON格式，可选）
     * @return 排行记录
     */
    GameRanking submitScore(String gameName, String openid, Integer score, Integer duration, String difficulty, String extraData);

    /**
     * 获取游戏排行榜（按分数降序）
     *
     * @param gameName 游戏名称
     * @param difficulty 难度等级（可选）
     * @param limit 返回数量限制
     * @return 排行榜列表
     */
    List<GameRanking> getRankingList(String gameName, String difficulty, Integer limit);

    /**
     * 获取用户在该游戏中的最佳成绩
     *
     * @param gameName 游戏名称
     * @param openid 用户openid
     * @param difficulty 难度等级（可选）
     * @return 最佳成绩记录
     */
    GameRanking getUserBestScore(String gameName, String openid, String difficulty);

    /**
     * 分页查询排行记录（管理后台使用）
     *
     * @param page 分页参数
     * @param gameName 游戏名称（可选）
     * @param openid 用户openid（可选）
     * @param difficulty 难度等级（可选）
     * @return 分页结果
     */
    IPage<GameRanking> pageQuery(Page<GameRanking> page, String gameName, String openid, String difficulty);

    /**
     * 获取游戏统计信息
     *
     * @param gameName 游戏名称（可选，为空则统计所有游戏）
     * @return 统计信息
     */
    Map<String, Object> getGameStatistics(String gameName);
}
