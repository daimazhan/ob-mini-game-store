package com.diamazhan.minigame.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.diamazhan.minigame.entity.SysUser;

/**
 * 系统用户服务接口
 *
 * @author ob
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 根据用户名查询用户
     */
    SysUser getByUsername(String username);

    /**
     * 系统用户登录
     */
    SysUser login(String username, String password);

    /**
     * 创建系统用户
     */
    SysUser createSysUser(SysUser sysUser);

    /**
     * 更新系统用户
     */
    SysUser updateSysUser(SysUser sysUser);
}
