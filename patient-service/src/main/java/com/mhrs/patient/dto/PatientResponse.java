package com.mhrs.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Long patientId;
    private String patientUniqueId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String bloodGroup;
    private String allergies;
    private String medicalHistory;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
