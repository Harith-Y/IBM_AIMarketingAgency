package com.ibm.marketingAI.dto;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VersionDto {

    private Long v_id;
    private String title;
    private String content;
}
