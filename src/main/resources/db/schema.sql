-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mini_game_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `mini_game_store`;

-- 小程序用户表（普通用户）
CREATE TABLE IF NOT EXISTS `custom_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `openid` VARCHAR(64) NOT NULL COMMENT '微信openid',
    `unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信unionid',
    `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `gender` TINYINT DEFAULT 0 COMMENT '性别（0-未知，1-男，2-女）',
    `country` VARCHAR(32) DEFAULT NULL COMMENT '国家',
    `province` VARCHAR(32) DEFAULT NULL COMMENT '省份',
    `city` VARCHAR(32) DEFAULT NULL COMMENT '城市',
    `language` VARCHAR(16) DEFAULT NULL COMMENT '语言',
    `points` INT DEFAULT 0 COMMENT '积分',
    `last_signin_time` DATETIME DEFAULT NULL COMMENT '最后签到时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除（0-未删除，1-已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_openid` (`openid`),
    KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='小程序用户表';

-- 系统用户表（后台管理用户）
CREATE TABLE IF NOT EXISTS `sys_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(32) NOT NULL COMMENT '用户名',
    `password` VARCHAR(64) NOT NULL COMMENT '密码（加密后）',
    `real_name` VARCHAR(32) DEFAULT NULL COMMENT '真实姓名',
    `phone` VARCHAR(16) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(64) DEFAULT NULL COMMENT '邮箱',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `role` VARCHAR(16) DEFAULT 'operator' COMMENT '角色（admin-管理员，operator-运营人员）',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除（0-未删除，1-已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_status` (`status`),
    KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统用户表';

-- 插入默认管理员账号（用户名：admin，密码：admin123）
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `status`, `role`, `remark`) 
VALUES ('admin', '0192023a7bbd73250516f069df18b500', '系统管理员', 1, 'admin', '默认管理员账号') 
ON DUPLICATE KEY UPDATE `username`=`username`;

-- 游戏排行表
CREATE TABLE IF NOT EXISTS `game_ranking` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `game_name` VARCHAR(64) NOT NULL COMMENT '游戏名称（如：shooter、sudoku、2048等）',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID（关联custom_user表）',
    `openid` VARCHAR(64) NOT NULL COMMENT '用户openid（冗余字段，方便查询）',
    `nickname` VARCHAR(64) DEFAULT NULL COMMENT '用户昵称（冗余字段，方便展示）',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '用户头像（冗余字段，方便展示）',
    `score` INT NOT NULL DEFAULT 0 COMMENT '游戏分数/成绩',
    `duration` INT DEFAULT 0 COMMENT '游戏时长（秒）',
    `difficulty` VARCHAR(32) DEFAULT NULL COMMENT '游戏难度/等级（可选，如数独的难度等级）',
    `extra_data` TEXT DEFAULT NULL COMMENT '额外数据（JSON格式，存储游戏特定的数据）',
    `submit_time` DATETIME NOT NULL COMMENT '提交时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除（0-未删除，1-已删除）',
    PRIMARY KEY (`id`),
    KEY `idx_game_name` (`game_name`),
    KEY `idx_openid` (`openid`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_score` (`score`),
    KEY `idx_submit_time` (`submit_time`),
    KEY `idx_game_difficulty` (`game_name`, `difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='游戏排行表';
