package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.GameRanking;
import com.diamazhan.minigame.service.GameRankingService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 游戏排行控制器（管理后台）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/ranking")
@SaCheckLogin
public class GameRankingController {

    @Autowired
    private GameRankingService gameRankingService;

    /**
     * 分页查询排行记录
     */
    @GetMapping("/page")
    public Result<IPage<GameRanking>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String gameName,
            @RequestParam(required = false) String openid,
            @RequestParam(required = false) String difficulty) {
        Page<GameRanking> page = new Page<>(current, size);
        IPage<GameRanking> result = gameRankingService.pageQuery(page, gameName, openid, difficulty);
        return Result.success(result);
    }

    /**
     * 获取游戏排行榜
     */
    @GetMapping("/list")
    public Result<List<GameRanking>> getRankingList(
            @RequestParam String gameName,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "100") Integer limit) {
        List<GameRanking> list = gameRankingService.getRankingList(gameName, difficulty, limit);
        return Result.success(list);
    }

    /**
     * 获取游戏统计信息
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(@RequestParam(required = false) String gameName) {
        Map<String, Object> statistics = gameRankingService.getGameStatistics(gameName);
        return Result.success(statistics);
    }

    /**
     * 删除排行记录
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        gameRankingService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量删除排行记录
     */
    @DeleteMapping("/batch")
    public Result<String> batchDelete(@RequestBody BatchDeleteRequest request) {
        gameRankingService.removeByIds(request.getIds());
        return Result.success("批量删除成功");
    }

    @Data
    public static class BatchDeleteRequest {
        private List<Long> ids;
    }
}
