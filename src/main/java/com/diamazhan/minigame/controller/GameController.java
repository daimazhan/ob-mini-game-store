package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.GameRanking;
import com.diamazhan.minigame.service.GameRankingService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 游戏控制器（小程序端）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/game")
public class GameController {

    @Autowired
    private GameRankingService gameRankingService;

    /**
     * 提交游戏成绩
     */
    @SaCheckLogin
    @PostMapping("/submitScore")
    public Result<Map<String, Object>> submitScore(@RequestBody SubmitScoreRequest request) {
        try {
            String openid = StpUtil.getLoginIdAsString();
            
            if (request.getGameName() == null || request.getGameName().trim().isEmpty()) {
                return Result.error("游戏名称不能为空");
            }
            
            if (request.getScore() == null) {
                return Result.error("分数不能为空");
            }
            
            GameRanking ranking = gameRankingService.submitScore(
                    request.getGameName(),
                    openid,
                    request.getScore(),
                    request.getDuration(),
                    request.getDifficulty(),
                    request.getExtraData()
            );
            
            // 获取用户在该游戏中的排名
            List<GameRanking> rankingList = gameRankingService.getRankingList(
                    request.getGameName(),
                    request.getDifficulty(),
                    1000  // 获取足够多的记录来计算排名
            );
            
            int rank = 1;
            for (GameRanking r : rankingList) {
                if (r.getId().equals(ranking.getId())) {
                    break;
                }
                rank++;
            }
            
            // 获取用户最佳成绩
            GameRanking bestScore = gameRankingService.getUserBestScore(
                    request.getGameName(),
                    openid,
                    request.getDifficulty()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("ranking", ranking);
            result.put("rank", rank);
            result.put("bestScore", bestScore);
            result.put("isNewRecord", bestScore != null && bestScore.getId().equals(ranking.getId()));
            
            return Result.success("成绩提交成功", result);
        } catch (Exception e) {
            log.error("提交成绩失败", e);
            return Result.error("提交成绩失败：" + e.getMessage());
        }
    }

    /**
     * 获取游戏排行榜
     */
    @GetMapping("/ranking")
    public Result<List<GameRanking>> getRanking(
            @RequestParam String gameName,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "100") Integer limit) {
        List<GameRanking> list = gameRankingService.getRankingList(gameName, difficulty, limit);
        return Result.success(list);
    }

    /**
     * 获取用户最佳成绩
     */
    @SaCheckLogin
    @GetMapping("/bestScore")
    public Result<GameRanking> getBestScore(
            @RequestParam String gameName,
            @RequestParam(required = false) String difficulty) {
        String openid = StpUtil.getLoginIdAsString();
        GameRanking bestScore = gameRankingService.getUserBestScore(gameName, openid, difficulty);
        return Result.success(bestScore);
    }

    @Data
    public static class SubmitScoreRequest {
        private String gameName;
        private Integer score;
        private Integer duration;
        private String difficulty;
        private String extraData;
    }
}
