package com.mhrs.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePatientRequest {

    @NotBlank(message = "First name cannot be blank")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotNull(message = "Date of birth cannot be null")
    @PastOrPresent(message = "Date of birth must be in past or present")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender cannot be blank")
    private String gender;

    @NotBlank(message = "Address cannot be blank")
    private String address;

    @NotBlank(message = "City cannot be blank")
    private String city;

    @NotBlank(message = "State cannot be blank")
    private String state;

    @NotBlank(message = "Zip code cannot be blank")
    @Pattern(regexp = "^\\d{5,6}$", message = "Zip code must be 5-6 digits")
    private String zipCode;

    @NotBlank(message = "Blood group cannot be blank")
    private String bloodGroup;

    private String allergies;
    private String medicalHistory;
}
