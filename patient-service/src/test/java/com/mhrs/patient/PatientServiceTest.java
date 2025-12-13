package com.mhrs.patient;

import com.mhrs.patient.dto.CreatePatientRequest;
import com.mhrs.patient.dto.PatientResponse;
import com.mhrs.patient.exception.PatientNotFoundException;
import com.mhrs.patient.model.Patient;
import com.mhrs.patient.repository.PatientRepository;
import com.mhrs.patient.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("Patient Service Unit Tests")
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private CreatePatientRequest createPatientRequest;
    private Patient patient;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        createPatientRequest = new CreatePatientRequest();
        createPatientRequest.setFirstName("John");
        createPatientRequest.setLastName("Doe");
        createPatientRequest.setEmail("john.doe@example.com");
        createPatientRequest.setPhoneNumber("9876543210");
        createPatientRequest.setDateOfBirth(LocalDate.of(1990, 5, 15));
        createPatientRequest.setGender("Male");
        createPatientRequest.setAddress("123 Main St");
        createPatientRequest.setCity("New York");
        createPatientRequest.setState("NY");
        createPatientRequest.setZipCode("10001");
        createPatientRequest.setBloodGroup("O+");
        createPatientRequest.setAllergies("None");
        createPatientRequest.setMedicalHistory("No major illnesses");

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setPatientUniqueId("PAT-123456789");
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("john.doe@example.com");
        patient.setPhoneNumber("9876543210");
        patient.setDateOfBirth(LocalDate.of(1990, 5, 15));
        patient.setGender("Male");
        patient.setAddress("123 Main St");
        patient.setCity("New York");
        patient.setState("NY");
        patient.setZipCode("10001");
        patient.setBloodGroup("O+");
        patient.setAllergies("None");
        patient.setMedicalHistory("No major illnesses");
        patient.setActive(true);
        patient.setCreatedAt(LocalDate.now());
        patient.setUpdatedAt(LocalDate.now());
    }

    @Test
    @DisplayName("Should create patient successfully")
    void testCreatePatient() {
        when(patientRepository.findByEmail(createPatientRequest.getEmail())).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        PatientResponse response = patientService.createPatient(createPatientRequest);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("john.doe@example.com", response.getEmail());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("Should get patient by ID successfully")
    void testGetPatientById() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientResponse response = patientService.getPatientById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getPatientId());
        assertEquals("John", response.getFirstName());
    }

    @Test
    @DisplayName("Should throw exception when patient not found")
    void testGetPatientByIdNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class, () -> patientService.getPatientById(999L));
    }
}
```
