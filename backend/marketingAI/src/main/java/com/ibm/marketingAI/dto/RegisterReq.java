package com.ibm.marketingAI.dto;

import lombok.Data;

@Data
public class RegisterReq {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
