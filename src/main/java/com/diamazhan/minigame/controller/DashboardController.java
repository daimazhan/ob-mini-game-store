package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.CustomUser;
import com.diamazhan.minigame.entity.GameRanking;
import com.diamazhan.minigame.service.CustomUserService;
import com.diamazhan.minigame.service.GameRankingService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘控制器（管理后台）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/dashboard")
@SaCheckLogin
public class DashboardController {

    @Autowired
    private CustomUserService customUserService;

    @Autowired
    private GameRankingService gameRankingService;

    /**
     * 获取仪表盘数据
     */
    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverview() {
        Map<String, Object> data = new HashMap<>();

        // 总用户数
        long totalUsers = customUserService.count();
        data.put("totalUsers", totalUsers);

        // 今日新增用户数
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LambdaQueryWrapper<CustomUser> todayWrapper = new LambdaQueryWrapper<>();
        todayWrapper.ge(CustomUser::getCreateTime, todayStart);
        long todayNewUsers = customUserService.count(todayWrapper);
        data.put("todayNewUsers", todayNewUsers);

        // 总游戏记录数
        long totalGameRecords = gameRankingService.count();
        data.put("totalGameRecords", totalGameRecords);

        // 今日游戏记录数
        LambdaQueryWrapper<GameRanking> todayGameWrapper = new LambdaQueryWrapper<>();
        todayGameWrapper.ge(GameRanking::getSubmitTime, todayStart);
        long todayGameRecords = gameRankingService.count(todayGameWrapper);
        data.put("todayGameRecords", todayGameRecords);

        // 活跃用户数（最近7天有游戏记录的用户）
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<GameRanking> activeWrapper = new LambdaQueryWrapper<>();
        activeWrapper.ge(GameRanking::getSubmitTime, sevenDaysAgo)
                     .select(GameRanking::getOpenid);
        List<GameRanking> activeRecords = gameRankingService.list(activeWrapper);
        long activeUsers = activeRecords.stream()
                .map(GameRanking::getOpenid)
                .distinct()
                .count();
        data.put("activeUsers", activeUsers);

        return Result.success(data);
    }

    /**
     * 获取用户增长趋势（最近30天）
     */
    @GetMapping("/userGrowth")
    public Result<List<UserGrowthData>> getUserGrowth(@RequestParam(defaultValue = "30") Integer days) {
        List<UserGrowthData> growthData = new ArrayList<>();
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            
            LambdaQueryWrapper<CustomUser> wrapper = new LambdaQueryWrapper<>();
            wrapper.ge(CustomUser::getCreateTime, dayStart)
                   .lt(CustomUser::getCreateTime, dayEnd);
            
            long count = customUserService.count(wrapper);
            
            UserGrowthData data = new UserGrowthData();
            data.setDate(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            data.setCount(count);
            growthData.add(data);
        }
        
        return Result.success(growthData);
    }

    /**
     * 获取游戏数据统计
     */
    @GetMapping("/gameStatistics")
    public Result<Map<String, Object>> getGameStatistics() {
        Map<String, Object> result = new HashMap<>();
        
        // 按游戏名称统计
        List<GameRanking> allRecords = gameRankingService.list();
        Map<String, GameStatistic> gameStats = new HashMap<>();
        
        for (GameRanking record : allRecords) {
            String gameName = record.getGameName();
            GameStatistic stat = gameStats.getOrDefault(gameName, new GameStatistic());
            stat.setGameName(gameName);
            stat.setTotalCount(stat.getTotalCount() + 1);
            stat.setTotalScore(stat.getTotalScore() + record.getScore());
            if (stat.getMaxScore() == null || record.getScore() > stat.getMaxScore()) {
                stat.setMaxScore(record.getScore());
            }
            gameStats.put(gameName, stat);
        }
        
        // 计算平均分
        List<GameStatistic> statistics = new ArrayList<>(gameStats.values());
        for (GameStatistic stat : statistics) {
            if (stat.getTotalCount() > 0) {
                stat.setAvgScore(Math.round((double) stat.getTotalScore() / stat.getTotalCount() * 100.0) / 100.0);
            }
        }
        
        result.put("gameStatistics", statistics);
        result.put("totalGames", statistics.size());
        
        return Result.success(result);
    }

    /**
     * 获取最近游戏记录
     */
    @GetMapping("/recentRecords")
    public Result<List<GameRanking>> getRecentRecords(@RequestParam(defaultValue = "10") Integer limit) {
        LambdaQueryWrapper<GameRanking> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(GameRanking::getSubmitTime)
               .last("LIMIT " + limit);
        
        List<GameRanking> records = gameRankingService.list(wrapper);
        return Result.success(records);
    }

    @Data
    public static class UserGrowthData {
        private String date;
        private Long count;
    }

    @Data
    public static class GameStatistic {
        private String gameName;
        private Long totalCount;
        private Long totalScore;
        private Integer maxScore;
        private Double avgScore;

        public GameStatistic() {
            this.totalCount = 0L;
            this.totalScore = 0L;
        }
    }
}
