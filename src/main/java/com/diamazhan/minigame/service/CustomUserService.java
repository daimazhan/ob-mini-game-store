package com.diamazhan.minigame.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.diamazhan.minigame.entity.CustomUser;

/**
 * 小程序用户服务接口
 *
 * @author ob
 */
public interface CustomUserService extends IService<CustomUser> {

    /**
     * 根据 openid 查询用户
     */
    CustomUser getByOpenid(String openid);

    /**
     * 创建或更新用户
     */
    CustomUser createOrUpdate(CustomUser user);

        /**
     * 用户签到
     *
     * @param openid 用户openid
     * @return 签到后的用户信息
     */
        CustomUser signIn(String openid);
    
        /**
         * 检查用户今日是否已签到
         *
         * @param openid 用户openid
         * @return true-已签到，false-未签到
         */
        boolean isSignedInToday(String openid);
}
