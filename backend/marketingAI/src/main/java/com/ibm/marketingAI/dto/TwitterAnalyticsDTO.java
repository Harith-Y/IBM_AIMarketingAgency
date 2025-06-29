package com.ibm.marketingAI.dto;

import lombok.Data;

@Data
public class TwitterAnalyticsDTO {
    private String id;
    private String text;
    private PublicMetrics public_metrics;

    @Data
    public static class PublicMetrics {
        private int retweet_count;
        private int reply_count;
        private int like_count;
        private int quote_count;
        private int impression_count; // Only available to elevated API users
    }
}

