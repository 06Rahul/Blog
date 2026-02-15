package com.Blog.Platform.Blog.Controller;


import com.Blog.Platform.Blog.Util.DailyThoughtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/thought")
@RequiredArgsConstructor
public class DailyThoughtController {

    private final DailyThoughtService dailyThoughtService;

    @GetMapping("/today")
    public ResponseEntity<String> getTodaysThought() {
        return ResponseEntity.ok(dailyThoughtService.getRandomThought());
    }
}
