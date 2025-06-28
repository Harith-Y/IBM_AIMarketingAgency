package com.ibm.marketingAI.model;



import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CampaignResponse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "version_a_id", referencedColumnName = "v_id")
    private Version versionA;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "version_b_id", referencedColumnName = "v_id")
    private Version versionB;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id")
    @JsonBackReference
    private AppUser owner;

    private String tone;
    private String brandName;
    private String audienceCategory;
    private String audienceType;
    private String productName;
    private int minAge;
    private int maxAge;

}
