package com.mhrs.patient.controller;

import com.mhrs.patient.model.LabResult;
import com.mhrs.patient.repository.LabResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-results")
@CrossOrigin(origins = "*")
public class LabResultController {

    @Autowired
    private LabResultRepository labResultRepository;

    @GetMapping
    public List<LabResult> getAllLabResults() {
        return labResultRepository.findAll();
    }

    @PostMapping
    public LabResult createLabResult(@RequestBody LabResult labResult) {
        return labResultRepository.save(labResult);
    }

    @GetMapping("/pending-count")
    public long getPendingCount() {
        return labResultRepository.findByStatus("PENDING").size();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabResult(@PathVariable Long id) {
        labResultRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
