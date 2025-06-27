package com.ibm.marketingAI.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ibm.marketingAI.model.Version;

@Repository
public interface VersionRepo extends JpaRepository<Version, Long>  {
    
}