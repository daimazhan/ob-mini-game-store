package com.diamazhan.minigame.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO配置类
 *
 * @author ob
 */
@Configuration
public class MinIOConfig {

    @Value("${oss.minio.endpoint}")
    private String endpoint;

    @Value("${oss.minio.access-key}")
    private String accessKey;

    @Value("${oss.minio.secret-key}")
    private String secretKey;

    @Value("${oss.avatar-bucket}")
    private String avatarBucket;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    public String getAvatarBucket() {
        return avatarBucket;
    }
}
