package com.diamazhan.minigame;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;

/**
 * 小程序游戏商店后端服务主应用类
 *
 * @author ob
 */
@SpringBootApplication(exclude = {RedisAutoConfiguration.class})
@MapperScan("com.diamazhan.minigame.mapper")
public class MiniGameStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniGameStoreApplication.class, args);
    }
}
