package com.ibm.marketingAI.model;



import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Data
@Entity
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

}
