package com.ibm.marketingAI.controller;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ibm.marketingAI.dto.CampaignRequest;
import com.ibm.marketingAI.model.CampaignResponse;
import com.ibm.marketingAI.service.DashBoardService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashBoardService dashBoardService;

    
    @PostMapping("/post")
    public ResponseEntity<CampaignResponse> generateCampaign(@RequestBody CampaignRequest request) {
        return ResponseEntity.ok(dashBoardService.generateCampaign(request));
    }

    // @GetMapping("/get")
    // public ResponseEntity<?> getCampaign(@RequestParam String userId) {
        
    //     return ResponseEntity.ok(dashBoardService.getAllCampaign());
    // }
    


    
    
    
}
