package com.mhrs.patient.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long patientId;

    @NotBlank
    @Column(nullable = false)
    private String patientName;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    @NotBlank
    @Column(nullable = false)
    private String doctorName;

    @NotBlank
    @Column(nullable = false)
    private String reason;

    @NotBlank
    @Column(nullable = false)
    private String status; // SCHEDULED, COMPLETED, CANCELLED

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)
            status = "SCHEDULED";
    }
}
