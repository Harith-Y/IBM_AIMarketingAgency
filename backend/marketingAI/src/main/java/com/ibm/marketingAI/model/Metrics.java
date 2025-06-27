package com.ibm.marketingAI.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class Metrics {
    private int openRate;
    private int clickThroughRate;
    private int conversionRate;
}
