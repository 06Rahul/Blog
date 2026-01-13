package com.Blog.UserService.ServiceImpl;

import com.Blog.UserService.Config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@RequiredArgsConstructor @Service
public class FileStorageServiceImpl {

    private  final StorageProperties storageProperties;

    public String saveImage(MultipartFile file){
        try {
            String storageDir = storageProperties.getImageDir();
            String fileName = file.getOriginalFilename();
            Files.createDirectories(Path.of(storageDir));
            Path path = Path.of(storageDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return  path.toString();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
