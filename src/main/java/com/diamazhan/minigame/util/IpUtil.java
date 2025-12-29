package com.diamazhan.minigame.util;

import jakarta.servlet.http.HttpServletRequest;
import org.lionsoul.ip2region.xdb.Searcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * IP 工具类
 *
 * @author ob
 */
@Component
public class IpUtil {

    @Autowired(required = false)
    private Searcher ipSearcher;

    /**
     * 获取客户端真实 IP
     */
    public String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
            // 多次反向代理后会有多个 IP 值，第一个 IP 才是真实 IP
            int index = ip.indexOf(',');
            if (index != -1) {
                return ip.substring(0, index);
            } else {
                return ip;
            }
        }
        ip = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }
        return request.getRemoteAddr();
    }

    /**
     * 根据 IP 获取地区信息
     */
    public String getRegionByIp(String ip) {
        try {
            if (ipSearcher == null) {
                return "未知地区";
            }
            return ipSearcher.search(ip);
        } catch (Exception e) {
            return "未知地区";
        }
    }

    /**
     * 根据请求获取地区信息
     */
    public String getRegionByRequest(HttpServletRequest request) {
        String ip = getClientIp(request);
        return getRegionByIp(ip);
    }

    /**
     * 解析地区信息，返回国家、省份、城市
     * ip2region返回格式：国家|区域|省份|城市|ISP
     * 例如：中国|0|广东省|深圳市|电信
     */
    public RegionInfo parseRegion(String regionStr) {
        RegionInfo regionInfo = new RegionInfo();
        if (regionStr == null || regionStr.isEmpty() || "未知地区".equals(regionStr)) {
            return regionInfo;
        }
        
        String[] parts = regionStr.split("\\|");
        if (parts.length >= 1) {
            regionInfo.setCountry(parts[0]);
        }
        if (parts.length >= 2) {
            regionInfo.setProvince(parts[1]);
        }
        if (parts.length >= 3) {
            regionInfo.setCity(parts[2]);
        }
        
        return regionInfo;
    }

    /**
     * 根据请求解析地区信息
     */
    public RegionInfo parseRegionByRequest(HttpServletRequest request) {
        String regionStr = getRegionByRequest(request);
        return parseRegion(regionStr);
    }

    /**
     * 地区信息内部类
     */
    public static class RegionInfo {
        private String country;
        private String province;
        private String city;

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }
    }
}
