package com.ibm.marketingAI.dto;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwitterPostDTO {
    private String twitterId;
    private String postUrl;
    private Long v_id;
}