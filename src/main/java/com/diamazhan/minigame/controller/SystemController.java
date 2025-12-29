package com.diamazhan.minigame.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.diamazhan.minigame.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 系统管理控制器（管理后台）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/sys/system")
@SaCheckLogin
public class SystemController {

    /**
     * 获取系统信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        
        // Java版本
        info.put("javaVersion", System.getProperty("java.version"));
        
        // 系统名称
        info.put("osName", System.getProperty("os.name"));
        
        // 系统版本
        info.put("osVersion", System.getProperty("os.version"));
        
        // JVM内存信息
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();
        
        Map<String, Object> memory = new HashMap<>();
        memory.put("total", totalMemory);
        memory.put("used", usedMemory);
        memory.put("free", freeMemory);
        memory.put("max", maxMemory);
        memory.put("usedPercent", Math.round((double) usedMemory / maxMemory * 10000) / 100.0);
        info.put("memory", memory);
        
        return Result.success(info);
    }

    /**
     * 获取系统配置（可以扩展为从数据库读取）
     */
    @GetMapping("/config")
    public Result<Map<String, Object>> getSystemConfig() {
        Map<String, Object> config = new HashMap<>();
        
        // 这里可以添加从数据库读取的系统配置
        config.put("appName", "小程序游戏商店");
        config.put("version", "1.0.0");
        config.put("maintenance", false);
        config.put("maintenanceMessage", "");
        
        return Result.success(config);
    }
}
