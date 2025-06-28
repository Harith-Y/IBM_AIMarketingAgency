package com.ibm.marketingAI.dto;

import com.ibm.marketingAI.model.Version;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CampaignResponseDto {
    private Long id;
    private String tone;
    private String brandName;
    private String audienceCategory;
    private String audienceType;
    private String productName;
    private int minAge;
    private int maxAge;
    private Version versionA;
    private Version versionB;
}
 