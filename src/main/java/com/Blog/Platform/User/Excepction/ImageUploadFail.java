package com.Blog.Platform.User.Excepction;

public class ImageUploadFail extends RuntimeException{

    public ImageUploadFail(String message) {
        super(message);
    }
}
