package com.mhrs.patient.repository;

import com.mhrs.patient.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientUniqueId(String patientUniqueId);
    Optional<Patient> findByEmail(String email);
    List<Patient> findByActiveTrue();
    List<Patient> findByFirstNameContainingIgnoreCase(String firstName);
}