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
    private Version versionA;
    private Version versionB;
}
 