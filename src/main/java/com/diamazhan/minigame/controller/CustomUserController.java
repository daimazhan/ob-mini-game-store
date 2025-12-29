package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.CustomUser;
import com.diamazhan.minigame.service.CustomUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

/**
 * 客户管理控制器（管理后台）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/customer")
@SaCheckLogin
public class CustomUserController {

    @Autowired
    private CustomUserService customUserService;

    /**
     * 分页查询客户列表
     */
    @GetMapping("/page")
    public Result<IPage<CustomUser>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<CustomUser> page = new Page<>(current, size);
        LambdaQueryWrapper<CustomUser> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(CustomUser::getNickname, keyword)
                             .or()
                             .like(CustomUser::getOpenid, keyword));
        }
        
        wrapper.orderByDesc(CustomUser::getCreateTime);
        
        IPage<CustomUser> result = customUserService.page(page, wrapper);
        return Result.success(result);
    }

    /**
     * 根据ID获取客户详情
     */
    @GetMapping("/{id}")
    public Result<CustomUser> getById(@PathVariable Long id) {
        CustomUser user = customUserService.getById(id);
        if (user == null) {
            return Result.error("客户不存在");
        }
        return Result.success(user);
    }

    /**
     * 根据openid获取客户详情
     */
    @GetMapping("/openid/{openid}")
    public Result<CustomUser> getByOpenid(@PathVariable String openid) {
        CustomUser user = customUserService.getByOpenid(openid);
        if (user == null) {
            return Result.error("客户不存在");
        }
        return Result.success(user);
    }

    /**
     * 更新客户信息
     */
    @PutMapping("/{id}")
    public Result<CustomUser> update(@PathVariable Long id, @RequestBody CustomUser user) {
        user.setId(id);
        customUserService.updateById(user);
        return Result.success(customUserService.getById(id));
    }

    /**
     * 删除客户（逻辑删除）
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        customUserService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量删除客户
     */
    @DeleteMapping("/batch")
    public Result<String> batchDelete(@RequestBody BatchDeleteRequest request) {
        customUserService.removeByIds(request.getIds());
        return Result.success("批量删除成功");
    }

    @lombok.Data
    public static class BatchDeleteRequest {
        private java.util.List<Long> ids;
    }
}
