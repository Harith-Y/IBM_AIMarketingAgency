package com.ibm.marketingAI.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ibm.marketingAI.model.CampaignResponse;

@Repository
public interface ResponseRepo extends JpaRepository<CampaignResponse, Long>  {
    
}
