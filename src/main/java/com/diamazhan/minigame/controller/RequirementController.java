package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.Requirement;
import com.diamazhan.minigame.service.RequirementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 需求定制控制器
 *
 * @author daimazhan
 */
@Slf4j
@RestController
@RequestMapping("/requirement")
public class RequirementController {
    
    @Autowired
    private RequirementService requirementService;
    
    /**
     * 提交需求定制
     */
    @SaCheckLogin
    @PostMapping("/add")
    public Result<Requirement> addRequirement(@RequestBody Map<String, String> request) {
        try {
            String contactInfo = request.get("contactInfo");
            String content = request.get("content");
            
            if (!StringUtils.hasText(contactInfo)) {
                return Result.error("联系方式不能为空");
            }
            if (!StringUtils.hasText(content)) {
                return Result.error("需求内容不能为空");
            }
            
            // 获取当前登录用户ID（如果已登录）
            Long userId = null;
            try {
                if (StpUtil.isLogin()) {
                    userId = StpUtil.getLoginIdAsLong();
                }
            } catch (Exception e) {
                // 未登录用户也可以提交需求
                log.debug("用户未登录，允许匿名提交需求");
            }
            
            Requirement requirement = requirementService.addRequirement(contactInfo, content, userId);
            return Result.success(requirement);
        } catch (IllegalArgumentException e) {
            log.warn("提交需求失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("提交需求失败", e);
            return Result.error("提交失败: " + e.getMessage());
        }
    }
    
    /**
     * 兼容前端调用的接口路径
     */
    @SaCheckLogin
    @PostMapping("/addRequirement")
    public Result<Requirement> addRequirementCompat(@RequestBody Map<String, String> request) {
        return addRequirement(request);
    }
    
    /**
     * 分页查询需求列表（管理员或用户查看自己的需求）
     */
    @GetMapping("/list")
    public Result<Map<String, Object>> getRequirementList(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        try {
            Long userId = null;
            // 如果已登录，默认只查看自己的需求（管理员可以查看所有）
            try {
                if (StpUtil.isLogin()) {
                    userId = StpUtil.getLoginIdAsLong();
                    // TODO: 可以根据权限判断是否为管理员，如果是管理员则userId设为null查看所有
                }
            } catch (Exception e) {
                // 未登录用户不能查看需求列表
                return Result.error("请先登录");
            }
            
            Page<Requirement> page = new Page<>(pageNum, pageSize);
            IPage<Requirement> result = requirementService.pageQuery(page, status, userId);
            
            Map<String, Object> data = new HashMap<>();
            data.put("list", result.getRecords());
            data.put("total", result.getTotal());
            data.put("pageNum", result.getCurrent());
            data.put("pageSize", result.getSize());
            
            return Result.success(data);
        } catch (Exception e) {
            log.error("查询需求列表失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID查询需求详情
     */
    @GetMapping("/detail/{id}")
    public Result<Requirement> getRequirementDetail(@PathVariable Long id) {
        try {
            Requirement requirement = requirementService.getById(id);
            if (requirement == null) {
                return Result.error("需求记录不存在");
            }
            
            // 检查权限：只能查看自己的需求或管理员可以查看所有
            try {
                if (StpUtil.isLogin()) {
                    Long userId = StpUtil.getLoginIdAsLong();
                    // TODO: 可以根据权限判断是否为管理员
                    // 如果不是管理员且不是自己的需求，则不允许查看
                    if (requirement.getUserId() != null && !requirement.getUserId().equals(userId)) {
                        return Result.error("无权查看该需求");
                    }
                } else {
                    return Result.error("请先登录");
                }
            } catch (Exception e) {
                return Result.error("请先登录");
            }
            
            return Result.success(requirement);
        } catch (Exception e) {
            log.error("查询需求详情失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 回复需求（管理员功能）
     */
    @PostMapping("/reply/{id}")
    public Result<Boolean> replyRequirement(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String reply = request.get("reply");
            if (!StringUtils.hasText(reply)) {
                return Result.error("回复内容不能为空");
            }
            
            // 检查登录状态
            if (!StpUtil.isLogin()) {
                return Result.error("请先登录");
            }
            
            Long replyUserId = StpUtil.getLoginIdAsLong();
            // TODO: 可以添加管理员权限检查
            
            boolean result = requirementService.replyRequirement(id, reply, replyUserId);
            return Result.success(result);
        } catch (IllegalArgumentException e) {
            log.warn("回复需求失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("回复需求失败", e);
            return Result.error("回复失败: " + e.getMessage());
        }
    }
}
