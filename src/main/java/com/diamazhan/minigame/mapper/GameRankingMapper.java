package com.diamazhan.minigame.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diamazhan.minigame.entity.GameRanking;
import org.apache.ibatis.annotations.Mapper;

/**
 * 游戏排行 Mapper 接口
 *
 * @author ob
 */
@Mapper
public interface GameRankingMapper extends BaseMapper<GameRanking> {
    // 可以在这里添加自定义查询方法
}
