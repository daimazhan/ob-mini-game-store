package com.diamazhan.minigame.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 系统用户实体类（后台管理用户）
 *
 * @author ob
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码（加密后）
     */
    private String password;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 头像 URL
     */
    private String avatarUrl;

    /**
     * 状态（0-禁用，1-启用）
     */
    private Integer status;

    /**
     * 角色（admin-管理员，operator-运营人员）
     */
    private String role;

    /**
     * 备注
     */
    private String remark;
}
