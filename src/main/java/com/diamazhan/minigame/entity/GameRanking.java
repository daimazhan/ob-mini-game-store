package com.diamazhan.minigame.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 游戏排行实体类
 *
 * @author ob
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("game_ranking")
public class GameRanking extends BaseEntity {

    /**
     * 游戏名称（如：shooter、sudoku、2048等）
     */
    private String gameName;

    /**
     * 用户ID（关联custom_user表）
     */
    private Long userId;

    /**
     * 用户openid（冗余字段，方便查询）
     */
    private String openid;

    /**
     * 用户昵称（冗余字段，方便展示）
     */
    private String nickname;

    /**
     * 用户头像（冗余字段，方便展示）
     */
    private String avatarUrl;

    /**
     * 游戏分数/成绩
     */
    private Integer score;

    /**
     * 游戏时长（秒）
     */
    private Integer duration;

    /**
     * 游戏难度/等级（可选，如数独的难度等级）
     */
    private String difficulty;

    /**
     * 额外数据（JSON格式，存储游戏特定的数据）
     */
    private String extraData;

    /**
     * 提交时间
     */
    private LocalDateTime submitTime;
}
