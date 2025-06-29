package com.ibm.marketingAI.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ibm.marketingAI.model.Version;
import java.util.List;


@Repository
public interface VersionRepo extends JpaRepository<Version, Long>  {
    @Query("SELECT v.v_id FROM Version v WHERE v.twitter_id = :twitterId")
    Long findIdByTwitterId(@Param("twitterId") String twitterId);
    @Query("SELECT v.twitter_id FROM Version v WHERE v.v_id = :vid")
    String getTwitterId(@Param("vid") Long vid);

}