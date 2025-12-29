package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.SysUser;
import com.diamazhan.minigame.service.SysUserService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

/**
 * 系统用户管理控制器（管理后台）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/user")
@SaCheckLogin
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    /**
     * 分页查询系统用户列表
     */
    @GetMapping("/page")
    public Result<IPage<SysUser>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer status) {
        Page<SysUser> page = new Page<>(current, size);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(SysUser::getUsername, keyword)
                             .or()
                             .like(SysUser::getRealName, keyword)
                             .or()
                             .like(SysUser::getPhone, keyword));
        }
        
        if (StringUtils.hasText(role)) {
            wrapper.eq(SysUser::getRole, role);
        }
        
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }
        
        wrapper.orderByDesc(SysUser::getCreateTime);
        
        IPage<SysUser> result = sysUserService.page(page, wrapper);
        
        // 不返回密码
        result.getRecords().forEach(user -> user.setPassword(null));
        
        return Result.success(result);
    }

    /**
     * 根据ID获取系统用户详情
     */
    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        SysUser user = sysUserService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setPassword(null);
        return Result.success(user);
    }

    /**
     * 创建系统用户
     */
    @PostMapping
    public Result<SysUser> create(@RequestBody SysUser user) {
        try {
            SysUser created = sysUserService.createSysUser(user);
            created.setPassword(null);
            return Result.success("创建成功", created);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新系统用户
     */
    @PutMapping("/{id}")
    public Result<SysUser> update(@PathVariable Long id, @RequestBody SysUser user) {
        try {
            user.setId(id);
            SysUser updated = sysUserService.updateSysUser(user);
            updated.setPassword(null);
            return Result.success("更新成功", updated);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除系统用户（逻辑删除）
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        sysUserService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量删除系统用户
     */
    @DeleteMapping("/batch")
    public Result<String> batchDelete(@RequestBody BatchDeleteRequest request) {
        sysUserService.removeByIds(request.getIds());
        return Result.success("批量删除成功");
    }

    /**
     * 启用/禁用系统用户
     */
    @PutMapping("/{id}/status")
    public Result<SysUser> updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        SysUser user = sysUserService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setStatus(request.getStatus());
        sysUserService.updateById(user);
        user.setPassword(null);
        return Result.success("状态更新成功", user);
    }

    @Data
    public static class BatchDeleteRequest {
        private java.util.List<Long> ids;
    }

    @Data
    public static class UpdateStatusRequest {
        private Integer status;
    }
}
