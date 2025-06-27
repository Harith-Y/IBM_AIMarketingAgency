package com.ibm.marketingAI.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Metrics {
    private int openRate;
    private int clickThroughRate;
    private int conversionRate;
}
