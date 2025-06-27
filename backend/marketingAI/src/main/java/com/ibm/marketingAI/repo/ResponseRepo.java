package com.ibm.marketingAI.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ibm.marketingAI.model.AppUser;
import com.ibm.marketingAI.model.CampaignResponse;

@Repository
public interface ResponseRepo extends JpaRepository<CampaignResponse, Long>  {

    List<CampaignResponse> findByOwner(AppUser user);
    
}
