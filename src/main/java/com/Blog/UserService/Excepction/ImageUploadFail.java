package com.Blog.UserService.Excepction;

public class ImageUploadFail extends RuntimeException{

    public ImageUploadFail(String message) {
        super(message);
    }
}
