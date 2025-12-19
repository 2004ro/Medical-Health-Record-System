package com.mhrs.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private String patientName; // Storing for display simplicity

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // PAID, PENDING, UNPAID

    private String description;

    private LocalDate billDate;
}
