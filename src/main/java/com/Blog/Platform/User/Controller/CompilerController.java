package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.CompilerExecuteRequest;
import com.Blog.Platform.User.Service.CompilerProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compiler")
public class CompilerController {

    private final CompilerProxyService compilerProxyService;

    public CompilerController(CompilerProxyService compilerProxyService) {
        this.compilerProxyService = compilerProxyService;
    }

    @GetMapping("/runtimes")
    public ResponseEntity<List<Map<String, Object>>> getRuntimes() {
        return ResponseEntity.ok(compilerProxyService.getRuntimes());
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> execute(@RequestBody CompilerExecuteRequest request) {
        return ResponseEntity.ok(compilerProxyService.execute(request));
    }
}
