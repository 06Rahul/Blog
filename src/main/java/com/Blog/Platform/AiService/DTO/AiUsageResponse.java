package com.Blog.Platform.AiService.DTO;

public class AiUsageResponse {
    private int used;
    private int limit;
    private int remaining;

    public AiUsageResponse(int used, int limit, int remaining) {
        this.used = used;
        this.limit = limit;
        this.remaining = remaining;
    }

    public int getUsed() {
        return used;
    }

    public void setUsed(int used) {
        this.used = used;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }
}
