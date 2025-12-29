package com.diamazhan.minigame.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diamazhan.minigame.entity.CustomUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 小程序用户 Mapper 接口
 *
 * @author ob
 */
@Mapper
public interface CustomUserMapper extends BaseMapper<CustomUser> {
    // 可以在这里添加自定义查询方法
}
