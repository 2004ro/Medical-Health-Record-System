package com.mhrs.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "lab_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private String patientName; // Storing for display simplicity

    @Column(nullable = false)
    private String testName;

    private String result; // e.g., "Normal", "High", or numeric value

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED

    private LocalDate testDate;

    private String notes;
}
