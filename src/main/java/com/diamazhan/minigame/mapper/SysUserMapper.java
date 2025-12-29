package com.diamazhan.minigame.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diamazhan.minigame.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 系统用户 Mapper 接口
 *
 * @author ob
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    // 可以在这里添加自定义查询方法
}
