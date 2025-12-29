package com.diamazhan.minigame.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.SysUser;
import com.diamazhan.minigame.service.SysUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 系统用户认证控制器（后台管理登录）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/auth")
public class SysAuthController {

    @Autowired
    private SysUserService sysUserService;

    /**
     * 系统用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");
            
            if (username == null || password == null) {
                return Result.error("用户名和密码不能为空");
            }
            
            SysUser sysUser = sysUserService.login(username, password);

            // 使用 Sa-Token 进行登录（使用 sys: 前缀区分系统用户）
            String loginId = "sys:" + sysUser.getId();
            StpUtil.login(loginId);

            // 返回 token 和用户信息
            Map<String, Object> data = new HashMap<>();
            data.put("token", StpUtil.getTokenValue());
            data.put("userId", sysUser.getId());
            data.put("username", sysUser.getUsername());
            data.put("realName", sysUser.getRealName());
            data.put("role", sysUser.getRole());

            return Result.success("登录成功", data);
        } catch (Exception e) {
            log.error("系统用户登录失败：", e);
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<String> logout() {
        StpUtil.logout();
        return Result.success("退出成功");
    }

    /**
     * 获取当前登录系统用户信息
     */
    @GetMapping("/userInfo")
    public Result<SysUser> getUserInfo() {
        // 获取当前登录用户 ID（sys:userId）
        String loginId = (String) StpUtil.getLoginId();
        Long userId = Long.parseLong(loginId.replace("sys:", ""));
        SysUser sysUser = sysUserService.getById(userId);
        if (sysUser == null) {
            return Result.error("用户不存在");
        }
        // 不返回密码
        sysUser.setPassword(null);
        return Result.success(sysUser);
    }
}
