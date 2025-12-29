package com.diamazhan.minigame.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * MinIO服务接口
 *
 * @author ob
 */
public interface MinIOService {

    /**
     * 检查bucket是否存在，不存在则创建
     *
     * @param bucketName bucket名称
     * @return 是否创建成功或已存在
     */
    boolean ensureBucketExists(String bucketName);

    /**
     * 上传文件
     *
     * @param bucketName bucket名称
     * @param objectName 对象名称（文件路径）
     * @param inputStream 文件输入流
     * @param contentType 文件类型
     * @return 文件访问URL
     */
    String uploadFile(String bucketName, String objectName, InputStream inputStream, String contentType);

    /**
     * 上传文件（MultipartFile）
     *
     * @param bucketName bucket名称
     * @param objectName 对象名称（文件路径）
     * @param file 文件
     * @return 文件访问URL
     */
    String uploadFile(String bucketName, String objectName, MultipartFile file);

    /**
     * 删除文件
     *
     * @param bucketName bucket名称
     * @param objectName 对象名称（文件路径）
     * @return 是否删除成功
     */
    boolean deleteFile(String bucketName, String objectName);

    /**
     * 获取文件访问URL
     *
     * @param bucketName bucket名称
     * @param objectName 对象名称（文件路径）
     * @return 文件访问URL
     */
    String getFileUrl(String bucketName, String objectName);

    /**
     * 检查文件是否存在
     *
     * @param bucketName bucket名称
     * @param objectName 对象名称（文件路径）
     * @return 是否存在
     */
    boolean fileExists(String bucketName, String objectName);
}
