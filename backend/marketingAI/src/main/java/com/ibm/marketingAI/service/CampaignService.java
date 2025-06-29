package com.ibm.marketingAI.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ibm.marketingAI.dto.CampaignRequest;
import com.ibm.marketingAI.dto.CampaignResponseDto;
import com.ibm.marketingAI.dto.TwitterAnalyticsDTO;
import com.ibm.marketingAI.dto.TwitterDTO;
import com.ibm.marketingAI.dto.TwitterPostDTO;
import com.ibm.marketingAI.dto.VersionDto;
import com.ibm.marketingAI.model.AppUser;
import com.ibm.marketingAI.model.CampaignResponse;
import com.ibm.marketingAI.model.Metrics;
import com.ibm.marketingAI.model.Version;
import com.ibm.marketingAI.repo.ResponseRepo;
import com.ibm.marketingAI.repo.UserRepository;
import com.ibm.marketingAI.repo.VersionRepo;



import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;



@Service
public class CampaignService {

    @Value("${twitter.bearer.token}")
    private String bearerToken;

    @Autowired
    private ResponseRepo campaignRepo;

    @Autowired
    private VersionRepo versionRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ResponseRepo responseRepo;

    @Autowired
    private GraniteIntegrationService graniteIntegrationService;

    public CampaignResponse generateCampaign(CampaignRequest input,String email) {
        // Call Node.js Granite service
        CampaignResponse graniteResponse = graniteIntegrationService.callGranite(input);

        // Map Version A
        Version versionA = new Version();
        versionA.setTitle(graniteResponse.getVersionA().getTitle());
        versionA.setContent(graniteResponse.getVersionA().getContent());

        Metrics metrics = new Metrics();  
        metrics.setOpenRate(graniteResponse.getVersionA().getMetrics().getOpenRate());
        metrics.setClickThroughRate(graniteResponse.getVersionA().getMetrics().getClickThroughRate());
        metrics.setConversionRate(graniteResponse.getVersionA().getMetrics().getConversionRate());

        versionA.setMetrics(metrics);

        // Map Version B
        Version versionB = new Version();

        Metrics anotherMetrics = new Metrics();
        versionB.setTitle(graniteResponse.getVersionB().getTitle());
        versionB.setContent(graniteResponse.getVersionB().getContent());
        anotherMetrics.setOpenRate(graniteResponse.getVersionB().getMetrics().getOpenRate());
        anotherMetrics.setClickThroughRate(graniteResponse.getVersionB().getMetrics().getClickThroughRate());
        anotherMetrics.setConversionRate(graniteResponse.getVersionB().getMetrics().getConversionRate());

        versionB.setMetrics(anotherMetrics);
        // Save both versions
        versionRepo.save(versionA);
        versionRepo.save(versionB);

        // Create and save CampaignResponse
        AppUser user = userRepo.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

        CampaignResponse response = new CampaignResponse();
        response.setVersionA(versionA);
        response.setVersionB(versionB);
        response.setOwner(user);

        response.setAudienceCategory(input.getAudienceCategory());
        response.setAudienceType(input.getAudienceType());
        response.setBrandName(input.getBrandName());
        response.setMaxAge(input.getMaxAge());
        response.setMinAge(input.getMinAge());
        response.setProductName(input.getProductName());
        response.setTone(input.getTone());

        return campaignRepo.save(response);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponseDto> getAllCampaignForUser(String email) {
        AppUser user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<CampaignResponse> campaigns = responseRepo.findByOwner(user);

        return campaigns.stream()
    .map(c -> {
        CampaignResponseDto dto = new CampaignResponseDto();
        dto.setId(c.getId());
        dto.setTone(c.getTone());
        dto.setBrandName(c.getBrandName());
        dto.setAudienceCategory(c.getAudienceCategory());
        dto.setAudienceType(c.getAudienceType());
        dto.setProductName(c.getProductName());
        dto.setMinAge(c.getMinAge());
        dto.setMaxAge(c.getMaxAge());
        dto.setVersionA(new VersionDto(c.getVersionA().getV_id(),c.getVersionA().getTitle(), c.getVersionA().getContent()));
        dto.setVersionB(new VersionDto(c.getVersionB().getV_id(),c.getVersionA().getTitle(), c.getVersionB().getContent()));
        return dto;
    })
    .collect(Collectors.toList());

    }

    public void saveTwitterPost(TwitterPostDTO dto) {
        Version version = versionRepo.findById(dto.getV_id())
                .orElseThrow(() -> new IllegalArgumentException("Version not found with id: " + dto.getV_id()));

        version.setTwitter_id(dto.getTwitterId());
        version.setTwitter_link(dto.getPostUrl());

        versionRepo.save(version);
    }



    private final RestTemplate restTemplate = new RestTemplate();

    public TwitterAnalyticsDTO fetchTweetAnalytics(String tweetId) {
        String url = "https://api.twitter.com/2/tweets/" + tweetId + "?tweet.fields=public_metrics";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(bearerToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<TwitterDTO> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                TwitterDTO.class
        );

        return response.getBody().getData();
    }





}
