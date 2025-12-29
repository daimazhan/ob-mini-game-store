package com.diamazhan.minigame.controller;

import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private IpUtil ipUtil;

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("服务运行正常");
    }

    /**
     * 获取 IP 信息
     */
    @GetMapping("/ip")
    public Result<Map<String, String>> getIpInfo(HttpServletRequest request) {
        String ip = ipUtil.getClientIp(request);
        String region = ipUtil.getRegionByIp(ip);

        Map<String, String> data = new HashMap<>();
        data.put("ip", ip);
        data.put("region", region);

        return Result.success(data);
    }
}
