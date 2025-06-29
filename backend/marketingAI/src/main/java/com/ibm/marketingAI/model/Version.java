package com.ibm.marketingAI.model;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Version {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long v_id;
    @Column(length = 200)
    private String title;
    @Lob
    @Basic(fetch = FetchType.EAGER)
    @Column(columnDefinition = "text")
    private String content;
    @Embedded
    private Metrics metrics;
    @JsonSerialize(using = ToStringSerializer.class)
    private String twitter_id;
    private String twitter_link;
}
