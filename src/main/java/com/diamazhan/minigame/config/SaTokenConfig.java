package com.diamazhan.minigame.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 配置类
 *
 * @author ob
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    /**
     * 注册 Sa-Token 拦截器，校验规则为除了登录、注册等接口外，其他接口都需要登录
     * 注意：由于设置了 context-path: /api，拦截器匹配的路径不包含 /api 前缀
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            // 指定拦截的路由与排除的路由（路径不包含 context-path 前缀）
            SaRouter.match("/**")
                    .notMatch("/auth/wxLogin", "/auth/logout", "/sys/auth/login", "/sys/auth/logout", "/wx/**", "/public/**", "/test/**")
                    .check(r -> StpUtil.checkLogin());
        })).addPathPatterns("/**");
    }

}
