package com.ibm.marketingAI.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ibm.marketingAI.dto.CampaignRequest;
import com.ibm.marketingAI.model.CampaignResponse;
import com.ibm.marketingAI.model.Metrics;
import com.ibm.marketingAI.model.Version;
import com.ibm.marketingAI.repo.ResponseRepo;

@Service
public class DashBoardService {

    @Autowired
    private ResponseRepo responseRepo;
    
    public CampaignResponse generateCampaign(CampaignRequest request) {
    CampaignResponse response = new CampaignResponse();

    // Version A
    Version versionA = new Version();
    versionA.setTitle(String.format("%s %s Campaign - Version A", request.getTone(), request.getBrandName()));
    versionA.setContent(String.format(
        "🎯 Exclusive for %s!\n\nDiscover %s's latest collection designed specifically for %s aged %d-%d.\n\n%s\n\n✨ Special Launch Offer: 25%% OFF\n🚚 Free shipping on orders over $50\n💝 Exclusive member perks\n\nShop now and transform your %s experience!",
        request.getAudienceCategory(),
        request.getBrandName(),
        request.getAudienceType().equals("All") ? "everyone" : request.getAudienceType().toLowerCase(),
        request.getMinAge(),
        request.getMaxAge(),
        switch (request.getTone()) {
            case "Professional" -> "Experience premium quality and exceptional service.";
            case "Friendly" -> "Join our community and enjoy amazing benefits!";
            default -> "Don't miss out on this limited-time opportunity!";
        },
        request.getAudienceCategory().toLowerCase()
    ));
    versionA.setMetrics(generateRandomMetrics());

    // Version B
    Version versionB = new Version();
    versionB.setTitle(String.format("%s %s Campaign - Version B", request.getTone(), request.getBrandName()));
    versionB.setContent(String.format(
        "🔥 %s Presents: The Ultimate %s Experience!\n\nTailored for %s in the %d-%d age range.\n\n%s\n\n🎁 What's included:\n• Premium %s products\n• Priority customer support\n• Exclusive member discounts\n• Early access to new releases\n\nClaim your %s advantage today!",
        request.getBrandName(),
        request.getAudienceCategory(),
        request.getAudienceType().equals("All") ? "all our valued customers" : request.getAudienceType().toLowerCase() + " customers",
        request.getMinAge(),
        request.getMaxAge(),
        switch (request.getTone()) {
            case "Professional" -> "Elevate your standards with our premium solutions.";
            case "Friendly" -> "We're excited to share something special with you!";
            default -> "Act fast - this deal won't last long!";
        },
        request.getBrandName(),
        request.getTone().toLowerCase()
    ));
    versionB.setMetrics(generateRandomMetrics());

    // Link versions to campaign response
    response.setVersionA(versionA);
    response.setVersionB(versionB);

    // Save campaign (cascade will also save versions)
    return responseRepo.save(response);
}


    private Metrics generateRandomMetrics() {
        Metrics metrics = new Metrics();
        metrics.setOpenRate((int) (Math.random() * 20 + 65));
        metrics.setClickThroughRate((int) (Math.random() * 8 + 12));
        metrics.setConversionRate((int) (Math.random() * 5 + 8));
        return metrics;
    }

}
