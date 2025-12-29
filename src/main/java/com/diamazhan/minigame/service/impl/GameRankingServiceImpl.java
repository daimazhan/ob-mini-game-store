package com.diamazhan.minigame.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.diamazhan.minigame.entity.CustomUser;
import com.diamazhan.minigame.entity.GameRanking;
import com.diamazhan.minigame.mapper.GameRankingMapper;
import com.diamazhan.minigame.service.CustomUserService;
import com.diamazhan.minigame.service.GameRankingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 游戏排行服务实现类
 *
 * @author ob
 */
@Slf4j
@Service
public class GameRankingServiceImpl extends ServiceImpl<GameRankingMapper, GameRanking> implements GameRankingService {

    @Autowired
    private CustomUserService customUserService;

    @Override
    public GameRanking submitScore(String gameName, String openid, Integer score, Integer duration, String difficulty, String extraData) {
        // 获取用户信息
        CustomUser user = customUserService.getByOpenid(openid);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 创建排行记录
        GameRanking ranking = new GameRanking();
        ranking.setGameName(gameName);
        ranking.setUserId(user.getId());
        ranking.setOpenid(openid);
        ranking.setNickname(user.getNickname());
        ranking.setAvatarUrl(user.getAvatarUrl());
        ranking.setScore(score);
        ranking.setDuration(duration != null ? duration : 0);
        ranking.setDifficulty(difficulty);
        ranking.setExtraData(extraData);
        ranking.setSubmitTime(LocalDateTime.now());

        // 保存记录
        this.save(ranking);

        log.info("用户 {} 提交游戏 {} 成绩：分数={}, 时长={}秒", openid, gameName, score, duration);
        return ranking;
    }

    @Override
    public List<GameRanking> getRankingList(String gameName, String difficulty, Integer limit) {
        LambdaQueryWrapper<GameRanking> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GameRanking::getGameName, gameName);
        
        if (StringUtils.hasText(difficulty)) {
            wrapper.eq(GameRanking::getDifficulty, difficulty);
        }
        
        // 按分数降序排列，分数相同则按提交时间升序（先提交的排名靠前）
        wrapper.orderByDesc(GameRanking::getScore)
               .orderByAsc(GameRanking::getSubmitTime);
        
        if (limit != null && limit > 0) {
            wrapper.last("LIMIT " + limit);
        }
        
        return this.list(wrapper);
    }

    @Override
    public GameRanking getUserBestScore(String gameName, String openid, String difficulty) {
        LambdaQueryWrapper<GameRanking> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GameRanking::getGameName, gameName)
               .eq(GameRanking::getOpenid, openid);
        
        if (StringUtils.hasText(difficulty)) {
            wrapper.eq(GameRanking::getDifficulty, difficulty);
        }
        
        wrapper.orderByDesc(GameRanking::getScore)
               .orderByAsc(GameRanking::getSubmitTime)
               .last("LIMIT 1");
        
        return this.getOne(wrapper);
    }

    @Override
    public IPage<GameRanking> pageQuery(Page<GameRanking> page, String gameName, String openid, String difficulty) {
        LambdaQueryWrapper<GameRanking> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(gameName)) {
            wrapper.eq(GameRanking::getGameName, gameName);
        }
        
        if (StringUtils.hasText(openid)) {
            wrapper.eq(GameRanking::getOpenid, openid);
        }
        
        if (StringUtils.hasText(difficulty)) {
            wrapper.eq(GameRanking::getDifficulty, difficulty);
        }
        
        wrapper.orderByDesc(GameRanking::getSubmitTime);
        
        return this.page(page, wrapper);
    }

    @Override
    public Map<String, Object> getGameStatistics(String gameName) {
        LambdaQueryWrapper<GameRanking> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(gameName)) {
            wrapper.eq(GameRanking::getGameName, gameName);
        }
        
        long totalCount = this.count(wrapper);
        
        // 获取最高分
        wrapper.clear();
        if (StringUtils.hasText(gameName)) {
            wrapper.eq(GameRanking::getGameName, gameName);
        }
        wrapper.orderByDesc(GameRanking::getScore)
               .last("LIMIT 1");
        GameRanking topRecord = this.getOne(wrapper);
        
        // 获取平均分
        wrapper.clear();
        if (StringUtils.hasText(gameName)) {
            wrapper.eq(GameRanking::getGameName, gameName);
        }
        List<GameRanking> allRecords = this.list(wrapper);
        double avgScore = 0.0;
        if (!allRecords.isEmpty()) {
            int totalScore = allRecords.stream().mapToInt(GameRanking::getScore).sum();
            avgScore = (double) totalScore / allRecords.size();
        }
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCount", totalCount);
        statistics.put("maxScore", topRecord != null ? topRecord.getScore() : 0);
        statistics.put("avgScore", Math.round(avgScore * 100.0) / 100.0);
        statistics.put("topRecord", topRecord);
        
        return statistics;
    }
}
