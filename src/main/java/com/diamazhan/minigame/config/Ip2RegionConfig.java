package com.diamazhan.minigame.config;

import lombok.extern.slf4j.Slf4j;
import org.lionsoul.ip2region.xdb.Searcher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;

/**
 * ip2region 配置类
 *
 * @author ob
 */
@Slf4j
@Configuration
public class Ip2RegionConfig {

    @Value("${ip2region.db-path:classpath:ip2region.xdb}")
    private Resource dbResource;

    @Bean
    public Searcher ipSearcher() {
        try {
            // 检查资源文件是否存在
            if (dbResource == null || !dbResource.exists()) {
                log.warn("ip2region 数据库文件不存在：{}，IP 定位功能将不可用", dbResource);
                // 返回一个空的 Searcher，避免启动失败
                return null;
            }
            // 从资源文件加载 ip2region 数据库
            byte[] cBuff = dbResource.getInputStream().readAllBytes();
            log.info("ip2region 数据库加载成功");
            return Searcher.newWithBuffer(cBuff);
        } catch (IOException e) {
            log.error("加载 ip2region 数据库失败，IP 定位功能将不可用：", e);
            // 返回 null，避免启动失败
            return null;
        }
    }
}
