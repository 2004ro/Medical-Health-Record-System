package com.mhrs.patient.service;

import com.mhrs.patient.dto.CreatePatientRequest;
import com.mhrs.patient.dto.PatientResponse;
import com.mhrs.patient.exception.PatientAlreadyExistsException;
import com.mhrs.patient.exception.PatientNotFoundException;
import com.mhrs.patient.model.Patient;
import com.mhrs.patient.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // Create new patient
    public PatientResponse createPatient(CreatePatientRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Create patient request cannot be null");
        }
        log.info("Creating new patient: {}", request.getEmail());

        // Check if patient already exists
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new PatientAlreadyExistsException("Patient with email " + request.getEmail() + " already exists");
        }

        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setZipCode(request.getZipCode());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setActive(true);

        // Generate unique patient ID
        long timestamp = System.currentTimeMillis();
        patient.setPatientUniqueId("PAT-" + timestamp);

        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient created successfully with ID: {}", savedPatient.getPatientUniqueId());

        return convertToResponse(savedPatient);
    }

    // Get patient by ID
    public PatientResponse getPatientById(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        log.info("Fetching patient with ID: {}", patientId);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));
        return convertToResponse(patient);
    }

    // Get patient by unique ID
    public PatientResponse getPatientByUniqueId(String patientUniqueId) {
        if (patientUniqueId == null || patientUniqueId.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient unique ID cannot be null or empty");
        }
        log.info("Fetching patient with unique ID: {}", patientUniqueId);
        Patient patient = patientRepository.findByPatientUniqueId(patientUniqueId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientUniqueId));
        return convertToResponse(patient);
    }

    // Get all active patients
    public List<PatientResponse> getAllPatients() {
        log.info("Fetching all active patients");
        return patientRepository.findByActiveTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Search patients by name
    public List<PatientResponse> searchPatientByName(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty");
        }
        log.info("Searching patients with name: {}", firstName);
        return patientRepository.findByFirstNameContainingIgnoreCase(firstName).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Update patient
    public PatientResponse updatePatient(Long patientId, CreatePatientRequest request) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        log.info("Updating patient with ID: {}", patientId);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));

        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setZipCode(request.getZipCode());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setDateOfBirth(request.getDateOfBirth());
        
        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient updated successfully");
        return convertToResponse(updatedPatient);
    }

    // Delete patient (soft delete)
    public void deletePatient(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        log.info("Deleting patient with ID: {}", patientId);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));
        patient.setActive(false);
        patientRepository.save(patient);
        log.info("Patient deleted successfully");
    }

    // Helper method to convert Patient to Response
    private PatientResponse convertToResponse(Patient patient) {
        return new PatientResponse(
                patient.getPatientId(),
                patient.getPatientUniqueId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhoneNumber(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getAddress(),
                patient.getCity(),
                patient.getState(),
                patient.getZipCode(),
                patient.getBloodGroup(),
                patient.getAllergies(),
                patient.getMedicalHistory(),
                patient.getActive(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}