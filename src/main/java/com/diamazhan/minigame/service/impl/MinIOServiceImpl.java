package com.diamazhan.minigame.service.impl;

import com.diamazhan.minigame.service.MinIOService;
import io.minio.*;
import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

/**
 * MinIO服务实现类
 *
 * @author ob
 */
@Slf4j
@Service
public class MinIOServiceImpl implements MinIOService {

    @Autowired
    private MinioClient minioClient;

    @Value("${oss.minio.endpoint}")
    private String endpoint;

    @Override
    public boolean ensureBucketExists(String bucketName) {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
                log.info("创建bucket成功: {}", bucketName);
            }
            return true;
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("检查或创建bucket失败: {}", bucketName, e);
            return false;
        }
    }

    @Override
    public String uploadFile(String bucketName, String objectName, InputStream inputStream, String contentType) {
        try {
            // 确保bucket存在
            ensureBucketExists(bucketName);

            // 获取流的大小（如果可用）
            long objectSize = -1;
            try {
                if (inputStream.available() > 0) {
                    objectSize = inputStream.available();
                }
            } catch (IOException e) {
                // 如果无法获取大小，使用-1（未知大小）
                log.debug("无法获取输入流大小，使用未知大小上传");
            }

            // 上传文件
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, objectSize, -1)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build());

            // 构建文件访问URL
            String url = endpoint + "/" + bucketName + "/" + objectName;
            log.info("文件上传成功: {}", url);
            return url;
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("文件上传失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String uploadFile(String bucketName, String objectName, MultipartFile file) {
        try {
            // 确保bucket存在
            ensureBucketExists(bucketName);

            // 上传文件，使用MultipartFile的getSize()获取准确的文件大小
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .build());

            // 构建文件访问URL
            String url = endpoint + "/" + bucketName + "/" + objectName;
            log.info("文件上传成功: {}", url);
            return url;
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("文件上传失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String bucketName, String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            log.info("文件删除成功: bucket={}, object={}", bucketName, objectName);
            return true;
        } catch (ErrorResponseException | InsufficientDataException | InternalException |
                 InvalidKeyException | InvalidResponseException | IOException |
                 NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("文件删除失败: bucket={}, object={}", bucketName, objectName, e);
            return false;
        }
    }

    @Override
    public String getFileUrl(String bucketName, String objectName) {
        return endpoint + "/" + bucketName + "/" + objectName;
    }

    @Override
    public boolean fileExists(String bucketName, String objectName) {
        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            return true;
        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                return false;
            }
            log.error("检查文件是否存在失败: bucket={}, object={}", bucketName, objectName, e);
            return false;
        } catch (InsufficientDataException | InternalException | InvalidKeyException |
                 InvalidResponseException | IOException | NoSuchAlgorithmException |
                 ServerException | XmlParserException e) {
            log.error("检查文件是否存在失败: bucket={}, object={}", bucketName, objectName, e);
            return false;
        }
    }

    /**
     * 生成唯一的文件名
     *
     * @param originalFilename 原始文件名
     * @return 新的文件名
     */
    public String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString().replace("-", "") + extension;
    }
}
