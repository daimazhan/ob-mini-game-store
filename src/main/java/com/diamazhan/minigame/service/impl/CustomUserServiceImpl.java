package com.diamazhan.minigame.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.diamazhan.minigame.entity.CustomUser;
import com.diamazhan.minigame.mapper.CustomUserMapper;
import com.diamazhan.minigame.service.CustomUserService;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 小程序用户服务实现类
 *
 * @author ob
 */
@Slf4j
@Service
public class CustomUserServiceImpl extends ServiceImpl<CustomUserMapper, CustomUser> implements CustomUserService {

    @Override
    public CustomUser getByOpenid(String openid) {
        LambdaQueryWrapper<CustomUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CustomUser::getOpenid, openid);
        return this.getOne(wrapper);
    }

    @Override
    public CustomUser createOrUpdate(CustomUser user) {
        CustomUser existUser = getByOpenid(user.getOpenid());
        if (existUser != null) {
            // 更新用户信息
            user.setId(existUser.getId());
            this.updateById(user);
            return this.getById(user.getId());
        } else {
            // 创建新用户
            this.save(user);
            return user;
        }
    }


    @Override
    public CustomUser signIn(String openid) {
        CustomUser user = this.getByOpenid(openid);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 检查今日是否已签到
        if (isSignedInToday(openid)) {
            throw new RuntimeException("今日已签到，请明天再来");
        }
        
        // 签到：增加10积分，更新签到时间
        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        user.setPoints(currentPoints + 10);
        user.setLastSigninTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        
        this.updateById(user);
        log.info("用户 {} 签到成功，获得10积分，当前积分：{}", openid, user.getPoints());
        
        return this.getByOpenid(openid);
    }
    
    @Override
    public boolean isSignedInToday(String openid) {
        CustomUser user = this.getByOpenid(openid);
        if (user == null || user.getLastSigninTime() == null) {
            return false;
        }
        
        // 获取最后签到时间的日期
        LocalDate lastSigninDate = user.getLastSigninTime().toLocalDate();
        // 获取今天的日期
        LocalDate today = LocalDate.now();
        
        // 比较日期，如果最后签到日期等于今天，说明今日已签到
        return lastSigninDate.equals(today);
    }
}
