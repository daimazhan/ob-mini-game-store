package com.diamazhan.minigame.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.diamazhan.minigame.entity.SysUser;
import com.diamazhan.minigame.mapper.SysUserMapper;
import com.diamazhan.minigame.service.SysUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

/**
 * 系统用户服务实现类
 *
 * @author ob
 */
@Slf4j
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    /**
     * 密码加密（使用 MD5，实际项目中建议使用 BCrypt）
     */
    private String encryptPassword(String password) {
        return DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public SysUser getByUsername(String username) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        return this.getOne(wrapper);
    }

    @Override
    public SysUser login(String username, String password) {
        SysUser sysUser = getByUsername(username);
        if (sysUser == null) {
            throw new RuntimeException("用户不存在");
        }
        if (sysUser.getStatus() == 0) {
            throw new RuntimeException("用户已被禁用");
        }
        String encryptedPassword = encryptPassword(password);
        if (!encryptedPassword.equals(sysUser.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        return sysUser;
    }

    @Override
    public SysUser createSysUser(SysUser sysUser) {
        // 检查用户名是否已存在
        SysUser existUser = getByUsername(sysUser.getUsername());
        if (existUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        // 加密密码
        sysUser.setPassword(encryptPassword(sysUser.getPassword()));
        // 设置默认状态为启用
        if (sysUser.getStatus() == null) {
            sysUser.setStatus(1);
        }
        this.save(sysUser);
        return sysUser;
    }

    @Override
    public SysUser updateSysUser(SysUser sysUser) {
        // 如果密码不为空，则加密密码
        if (sysUser.getPassword() != null && !sysUser.getPassword().isEmpty()) {
            sysUser.setPassword(encryptPassword(sysUser.getPassword()));
        } else {
            // 如果密码为空，则不更新密码字段
            sysUser.setPassword(null);
        }
        this.updateById(sysUser);
        return this.getById(sysUser.getId());
    }
}
