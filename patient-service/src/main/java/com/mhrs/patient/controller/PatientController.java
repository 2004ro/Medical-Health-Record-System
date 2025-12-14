package com.mhrs.patient.controller;

import com.mhrs.patient.dto.CreatePatientRequest;
import com.mhrs.patient.dto.PatientResponse;
import com.mhrs.patient.service.PatientService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {

    private static final Logger log = LoggerFactory.getLogger(PatientController.class);

    @Autowired
    private PatientService patientService;

    /**
     * Create a new patient
     * POST /api/v1/patients
     */
    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        log.info("POST request: Creating new patient");
        PatientResponse response = patientService.createPatient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get patient by ID
     * GET /api/v1/patients/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        log.info("GET request: Fetching patient by ID: {}", id);
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patient by unique ID
     * GET /api/v1/patients/unique/{uniqueId}
     */
    @GetMapping("/unique/{uniqueId}")
    public ResponseEntity<PatientResponse> getPatientByUniqueId(@PathVariable String uniqueId) {
        log.info("GET request: Fetching patient by unique ID: {}", uniqueId);
        PatientResponse response = patientService.getPatientByUniqueId(uniqueId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all patients
     * GET /api/v1/patients
     */
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        log.info("GET request: Fetching all patients");
        List<PatientResponse> response = patientService.getAllPatients();
        return ResponseEntity.ok(response);
    }

    /**
     * Search patients by name
     * GET /api/v1/patients/search?name=John
     */
    @GetMapping("/search")
    public ResponseEntity<List<PatientResponse>> searchPatients(@RequestParam String name) {
        log.info("GET request: Searching patients with name: {}", name);
        List<PatientResponse> response = patientService.searchPatientByName(name);
        return ResponseEntity.ok(response);
    }

    /**
     * Update patient
     * PUT /api/v1/patients/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody CreatePatientRequest request) {
        log.info("PUT request: Updating patient with ID: {}", id);
        PatientResponse response = patientService.updatePatient(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete patient
     * DELETE /api/v1/patients/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        log.info("DELETE request: Deleting patient with ID: {}", id);
        patientService.deletePatient(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }

    /**
     * Health check endpoint
     * GET /api/v1/patients/health/check
     */
    @GetMapping("/health/check")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Patient Service is running");
    }
}