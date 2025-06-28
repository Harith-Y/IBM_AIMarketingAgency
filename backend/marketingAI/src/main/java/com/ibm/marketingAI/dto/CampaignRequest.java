package com.ibm.marketingAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CampaignRequest {
    public String tone;
    public String brandName;
    public String audienceCategory;
    public String audienceType;
    public String productName;
    public int minAge;
    public int maxAge;
}
