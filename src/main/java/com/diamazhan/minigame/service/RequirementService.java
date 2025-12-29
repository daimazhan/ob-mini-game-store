package com.diamazhan.minigame.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.diamazhan.minigame.entity.Requirement;

/**
 * 需求定制服务接口
 *
 * @author daimazhan
 */
public interface RequirementService extends IService<Requirement> {
    
    /**
     * 提交需求定制
     *
     * @param contactInfo 联系方式
     * @param content 需求内容
     * @param userId 用户ID（可选）
     * @return 需求记录
     */
    Requirement addRequirement(String contactInfo, String content, Long userId);
    
    /**
     * 分页查询需求列表（管理员使用）
     *
     * @param page 分页对象
     * @param status 状态（可选）
     * @param userId 用户ID（可选）
     * @return 分页结果
     */
    IPage<Requirement> pageQuery(Page<Requirement> page, Integer status, Long userId);
    
    /**
     * 回复需求
     *
     * @param id 需求ID
     * @param reply 回复内容
     * @param replyUserId 回复人ID
     * @return 是否成功
     */
    boolean replyRequirement(Long id, String reply, Long replyUserId);
}
