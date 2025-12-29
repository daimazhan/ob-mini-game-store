package com.diamazhan.minigame.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.diamazhan.minigame.entity.Requirement;
import com.diamazhan.minigame.mapper.RequirementMapper;
import com.diamazhan.minigame.service.RequirementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 需求定制服务实现类
 *
 * @author daimazhan
 */
@Slf4j
@Service
public class RequirementServiceImpl extends ServiceImpl<RequirementMapper, Requirement> implements RequirementService {
    
    @Override
    public Requirement addRequirement(String contactInfo, String content, Long userId) {
        if (!StringUtils.hasText(contactInfo)) {
            throw new IllegalArgumentException("联系方式不能为空");
        }
        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException("需求内容不能为空");
        }
        
        // 防重复提交：检查最近30秒内是否有相同用户和相同内容的提交
        LocalDateTime checkTime = LocalDateTime.now().minusSeconds(30);
        LambdaQueryWrapper<Requirement> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(Requirement::getContactInfo, contactInfo.trim())
                .eq(Requirement::getContent, content.trim())
                .ge(Requirement::getCreateTime, checkTime)
                .orderByDesc(Requirement::getCreateTime)
                .last("LIMIT 1");
        
        // 如果用户已登录，也检查用户ID
        if (userId != null) {
            checkWrapper.eq(Requirement::getUserId, userId);
        }
        
        List<Requirement> recentRequirements = this.list(checkWrapper);
        if (!recentRequirements.isEmpty()) {
            log.warn("检测到重复提交，用户ID: {}, 联系方式: {}", userId, contactInfo);
            throw new IllegalArgumentException("请勿重复提交，您刚才已经提交过相同内容的需求");
        }
        
        Requirement requirement = new Requirement();
        requirement.setUserId(userId);
        requirement.setContactInfo(contactInfo.trim());
        requirement.setContent(content.trim());
        requirement.setStatus(0); // 待处理
        
        this.save(requirement);
        log.info("新增需求定制，ID: {}, 用户ID: {}", requirement.getId(), userId);
        
        return requirement;
    }
    
    @Override
    public IPage<Requirement> pageQuery(Page<Requirement> page, Integer status, Long userId) {
        LambdaQueryWrapper<Requirement> wrapper = new LambdaQueryWrapper<>();
        
        if (status != null) {
            wrapper.eq(Requirement::getStatus, status);
        }
        
        if (userId != null) {
            wrapper.eq(Requirement::getUserId, userId);
        }
        
        // 按创建时间倒序排列
        wrapper.orderByDesc(Requirement::getCreateTime);
        
        return this.page(page, wrapper);
    }
    
    @Override
    public boolean replyRequirement(Long id, String reply, Long replyUserId) {
        Requirement requirement = this.getById(id);
        if (requirement == null) {
            throw new IllegalArgumentException("需求记录不存在");
        }
        
        if (!StringUtils.hasText(reply)) {
            throw new IllegalArgumentException("回复内容不能为空");
        }
        
        requirement.setReply(reply.trim());
        requirement.setReplyTime(LocalDateTime.now());
        requirement.setReplyUserId(replyUserId);
        requirement.setStatus(2); // 已完成
        
        boolean result = this.updateById(requirement);
        if (result) {
            log.info("回复需求，ID: {}, 回复人ID: {}", id, replyUserId);
        }
        
        return result;
    }
}
