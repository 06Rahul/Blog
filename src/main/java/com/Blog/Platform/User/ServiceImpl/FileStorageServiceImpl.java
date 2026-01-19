package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Config.StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class FileStorageServiceImpl {

    private final StorageProperties storageProperties;

    public String saveImage(MultipartFile file) {
        try {
            String storageDir = storageProperties.getImageDir();
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Files.createDirectories(Path.of(storageDir));
            Path path = Path.of(storageDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return path.toString();
        } catch (IOException e) {
            log.error("Error saving image file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save image file", e);
        }
    }

    public void deleteImage(String imagePath) {
        try {
            if (imagePath != null && !imagePath.isBlank()) {
                Path path = Path.of(imagePath);
                if (Files.exists(path)) {
                    Files.delete(path);
                    log.debug("Deleted image file: {}", imagePath);
                }
            }
        } catch (IOException e) {
            log.warn("Failed to delete image file: {}", imagePath, e);
            // Don't throw exception - deletion failure shouldn't block the operation
        }
    }

    /**
     * Save image to temporary directory during registration
     */
    public String saveTempImage(MultipartFile file) {
        try {
            String tempDir = storageProperties.getImageDir() + "temp/";
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Files.createDirectories(Path.of(tempDir));
            Path path = Path.of(tempDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Saved temporary image: {}", path);
            return path.toString();
        } catch (IOException e) {
            log.error("Error saving temporary image file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save temporary image file", e);
        }
    }

    /**
     * Move temporary image to permanent location after OTP verification
     */
    public String moveTempToPermanent(String tempPath) {
        try {
            if (tempPath == null || tempPath.isBlank()) {
                return null;
            }

            Path sourcePath = Path.of(tempPath);
            if (!Files.exists(sourcePath)) {
                log.warn("Temporary image not found: {}", tempPath);
                return null;
            }

            String permanentDir = storageProperties.getImageDir();
            String fileName = sourcePath.getFileName().toString();
            Files.createDirectories(Path.of(permanentDir));
            Path targetPath = Path.of(permanentDir + fileName);

            Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Moved image from temp to permanent: {} -> {}", tempPath, targetPath);
            return targetPath.toString();
        } catch (IOException e) {
            log.error("Error moving temporary image to permanent location: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to move image to permanent location", e);
        }
    }

    /**
     * Delete temporary image file
     */
    public void deleteTempImage(String tempPath) {
        try {
            if (tempPath != null && !tempPath.isBlank()) {
                Path path = Path.of(tempPath);
                if (Files.exists(path)) {
                    Files.delete(path);
                    log.debug("Deleted temporary image file: {}", tempPath);
                }
            }
        } catch (IOException e) {
            log.warn("Failed to delete temporary image file: {}", tempPath, e);
            // Don't throw exception - deletion failure shouldn't block the operation
        }
    }
}
