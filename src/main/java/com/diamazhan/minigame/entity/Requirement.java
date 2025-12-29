package com.diamazhan.minigame.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求定制实体类
 *
 * @author daimazhan
 */
@Data
@TableName("requirement")
public class Requirement {
    
    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID（可选，未登录用户可为空）
     */
    private Long userId;
    
    /**
     * 联系方式（手机、微信、QQ等）
     */
    private String contactInfo;
    
    /**
     * 需求内容
     */
    private String content;
    
    /**
     * 处理状态：0-待处理，1-处理中，2-已完成，3-已关闭
     */
    private Integer status;
    
    /**
     * 回复内容
     */
    private String reply;
    
    /**
     * 回复时间
     */
    private LocalDateTime replyTime;
    
    /**
     * 回复人ID
     */
    private Long replyUserId;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
