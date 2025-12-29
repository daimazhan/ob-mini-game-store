package com.diamazhan.minigame.entity;

import java.time.LocalDateTime;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 小程序用户实体类（普通用户）
 *
 * @author ob
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("custom_user")
public class CustomUser extends BaseEntity {

    /**
     * 微信 openid
     */
    private String openid;

    /**
     * 微信 unionid
     */
    private String unionid;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像 URL
     */
    private String avatarUrl;

    /**
     * 性别（0-未知，1-男，2-女）
     */
    private Integer gender;

    /**
     * 国家
     */
    private String country;

    /**
     * 省份
     */
    private String province;

    /**
     * 城市
     */
    private String city;

    /**
     * 语言
     */
    private String language;

    /**
     * 积分
     */
    @TableField("points")
    private Integer points;

    /**
     * 最后签到时间
     */
    @TableField("last_signin_time")
    private LocalDateTime lastSigninTime;
}
