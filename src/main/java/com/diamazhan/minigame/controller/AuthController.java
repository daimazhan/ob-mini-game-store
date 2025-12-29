package com.diamazhan.minigame.controller;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.diamazhan.minigame.common.Result;
import com.diamazhan.minigame.entity.CustomUser;
import com.diamazhan.minigame.service.CustomUserService;
import com.diamazhan.minigame.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器（微信小程序登录）
 *
 * @author ob
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private WxMaService wxMaService;

    @Autowired
    private CustomUserService customUserService;

    @Autowired
    private IpUtil ipUtil;

    @Autowired
    private com.diamazhan.minigame.service.MinIOService minIOService;

    @Autowired
    private com.diamazhan.minigame.config.MinIOConfig minIOConfig;

    /**
     * 微信小程序登录
     */
    @PostMapping("/wxLogin")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> requestBody, HttpServletRequest request) {
        String code = requestBody.get("code");
        if (code == null || code.isEmpty()) {
            return Result.error("code不能为空");
        }
        try {
            // 通过 code 获取 openid 和 session_key
            WxMaJscode2SessionResult session = wxMaService.getUserService().getSessionInfo(code);
            String openid = session.getOpenid();
            String unionid = session.getUnionid();

            // 查询或创建用户
            CustomUser user = customUserService.getByOpenid(openid);
            if (user == null) {
                // 创建新用户
                user = new CustomUser();
                user.setOpenid(openid);
                user.setUnionid(unionid);
                
                // 设置昵称：微信用户 + openid后6位
                String nicknameSuffix = openid.length() > 6 ? openid.substring(openid.length() - 6) : openid;
                user.setNickname("微信用户" + nicknameSuffix);
            }
            // 获取IP地址并解析地区信息
            IpUtil.RegionInfo regionInfo = ipUtil.parseRegionByRequest(request);
            if (regionInfo.getCountry() != null && !regionInfo.getCountry().isEmpty()) {
                user.setCountry(regionInfo.getCountry());
            }
            if (regionInfo.getProvince() != null && !regionInfo.getProvince().isEmpty()) {
                user.setProvince(regionInfo.getProvince());
            }
            if (regionInfo.getCity() != null && !regionInfo.getCity().isEmpty()) {
                user.setCity(regionInfo.getCity());
            }
            
            user = customUserService.createOrUpdate(user);

            // 使用 Sa-Token 进行登录
            StpUtil.login(openid);

            // 返回 token 和完整的用户信息
            Map<String, Object> data = new HashMap<>();
            data.put("token", StpUtil.getTokenValue());
            data.put("userInfo", user);

            return Result.success("登录成功", data);
        } catch (Exception e) {
            log.error("微信登录失败：", e);
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<String> logout() {
        StpUtil.logout();
        return Result.success("退出成功");
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/getUserInfo")
    public Result<CustomUser> getUserInfo() {
        // 获取当前登录用户 ID（openid）
        String openid = (String) StpUtil.getLoginId();
        CustomUser user = customUserService.getByOpenid(openid);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }

    /**
     * 更新当前用户头像（文件上传）
     */
    @SaCheckLogin
    @PostMapping("/updateAvatar")
    public Result<CustomUser> updateAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return Result.error("请选择要上传的头像文件");
            }

            // 验证文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return Result.error("只能上传图片文件");
            }

            // 验证文件大小（限制为5MB）
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                return Result.error("头像文件大小不能超过5MB");
            }

            String openid = StpUtil.getLoginIdAsString();
            CustomUser user = customUserService.getByOpenid(openid);
            if (user == null) {
                return Result.error("用户不存在");
            }

            // 获取avatar bucket名称
            String bucketName = minIOConfig.getAvatarBucket();
            
            // 生成唯一的文件名：使用openid和UUID确保唯一性
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = openid + "/" + System.currentTimeMillis() + extension;

            // 如果用户已有头像，删除旧头像
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                try {
                    // 从URL中提取objectName（格式：endpoint/bucket/objectName）
                    String oldObjectName = user.getAvatarUrl();
                    if (oldObjectName.contains(bucketName + "/")) {
                        oldObjectName = oldObjectName.substring(oldObjectName.indexOf(bucketName + "/") + bucketName.length() + 1);
                        minIOService.deleteFile(bucketName, oldObjectName);
                    }
                } catch (Exception e) {
                    log.warn("删除旧头像失败，继续上传新头像: {}", e.getMessage());
                }
            }

            // 上传文件到MinIO
            String avatarUrl = minIOService.uploadFile(bucketName, objectName, file);
            
            // 更新用户头像URL
            user.setAvatarUrl(avatarUrl);
            customUserService.updateById(user);

            log.info("用户 {} 头像更新成功: {}", openid, avatarUrl);

            // 返回更新后的用户信息
            return Result.success(customUserService.getByOpenid(openid));
        } catch (IllegalArgumentException e) {
            log.warn("头像上传失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("头像上传失败", e);
            return Result.error("头像上传失败: " + e.getMessage());
        }
    }

    /**
     * 更新当前用户昵称
     */
    @SaCheckLogin
    @PostMapping("/updateNickname")
    public Result<CustomUser> updateNickname(@RequestBody CustomUser user) {
        try {
            if (user.getNickname() == null || user.getNickname().trim().isEmpty()) {
                return Result.error("昵称不能为空");
            }

            // 验证昵称长度（可选，根据业务需求调整）
            String trimmedNickname = user.getNickname().trim();
            if (trimmedNickname.length() > 50) {
                return Result.error("昵称长度不能超过50个字符");
            }

            String openid = (String) StpUtil.getLoginId();
            CustomUser currentUser = customUserService.getByOpenid(openid);
            if (currentUser == null) {
                return Result.error("用户不存在");
            }

            // 更新用户昵称
            currentUser.setNickname(trimmedNickname);
            customUserService.updateById(currentUser);

            log.info("用户 {} 更新昵称为: {}", openid, trimmedNickname);

            // 返回更新后的用户信息
            return Result.success(currentUser);
        } catch (Exception e) {
            log.error("更新昵称失败", e);
            return Result.error("更新昵称失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户签到
     */
    @SaCheckLogin
    @PostMapping("/signIn")
    public Result<SignInResponse> signIn() {
        try {
            String openid = (String) StpUtil.getLoginId();
            CustomUser user = customUserService.signIn(openid);
            
            SignInResponse response = new SignInResponse();
            response.setUser(user);
            response.setPoints(user.getPoints());
            response.setMessage("签到成功，获得10积分");
            
            return Result.success(response);
        } catch (RuntimeException e) {
            log.warn("签到失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("签到失败", e);
            return Result.error("签到失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户今日是否已签到
     */
    @SaCheckLogin
    @GetMapping("/checkSignIn")
    public Result<Boolean> checkSignIn() {
        try {
            String openid = StpUtil.getLoginIdAsString();
            boolean isSignedIn = customUserService.isSignedInToday(openid);
            return Result.success(isSignedIn);
        } catch (Exception e) {
            log.error("检查签到状态失败", e);
            return Result.error("检查签到状态失败: " + e.getMessage());
        }
    }

    /**
     * 登录请求对象
     */
    @Data
    public static class LoginRequest {
        private String jsCode;
    }

    /**
     * 登录响应对象
     */
    @Data
    public static class LoginResponse {
        private CustomUser user;
        private String token;
        private String tokenName;
    }
    
    /**
     * 签到响应对象
     */
    @Data
    public static class SignInResponse {
        private CustomUser user;
        private Integer points;
        private String message;
    }
}
