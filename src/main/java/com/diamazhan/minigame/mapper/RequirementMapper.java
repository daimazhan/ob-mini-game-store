package com.diamazhan.minigame.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diamazhan.minigame.entity.Requirement;
import org.apache.ibatis.annotations.Mapper;

/**
 * 需求定制Mapper接口
 *
 * @author daimazhan
 */
@Mapper
public interface RequirementMapper extends BaseMapper<Requirement> {
}
