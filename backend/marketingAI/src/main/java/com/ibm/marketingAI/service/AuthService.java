package com.ibm.marketingAI.service;

import org.springframework.stereotype.Service;

import com.ibm.marketingAI.dto.AuthResponse;

@Service
public class AuthService {
    
    public AuthResponse createAuthReponse(String email,String firstName,String token){
        return new AuthResponse(email,firstName,token);
    }
}
