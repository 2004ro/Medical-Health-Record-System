const API_BASE_URL = 'http://localhost:8082/api/v1/patients';

// State
let allPatients = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPatients();
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Modal Functions
function openModal() {
    document.getElementById('addPatientModal').classList.add('active');
}

function closeModal() {
    document.getElementById('addPatientModal').classList.remove('active');
}

// Fetch Patients
async function fetchPatients() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch patients');

        const data = await response.json();
        allPatients = data;

        updateDashboardStats(data);
        renderRecentPatients(data);
        renderAllPatients(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading patient data. Ensure the backend is running.');
    }
}

// Render Functions
function updateDashboardStats(patients) {
    document.getElementById('totalPatientsCount').innerText = patients.length;
}

function renderRecentPatients(patients) {
    const tbody = document.getElementById('recentPatientsTableBody');
    tbody.innerHTML = '';

    // Show last 5 patients
    const recent = patients.slice(-5).reverse();

    recent.forEach(patient => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${patient.patientId}</td>
            <td>
                <div style="font-weight: 500">${patient.firstName} ${patient.lastName}</div>
                <div style="font-size: 0.8rem; color: #64748b">${patient.email}</div>
            </td>
            <td>${patient.gender}</td>
            <td>${patient.phoneNumber}</td>
            <td><span class="status-badge active-status">Active</span></td>
            <td>
                <button class="action-btn" onclick="deletePatient(${patient.patientId})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAllPatients(patients) {
    const tbody = document.getElementById('allPatientsTableBody');
    tbody.innerHTML = '';

    patients.forEach(patient => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.patientUniqueId}</td>
            <td>
                <div style="font-weight: 500">${patient.firstName} ${patient.lastName}</div>
            </td>
            <td>
                <div>${calculateAge(patient.dateOfBirth)} yrs</div>
                <div style="font-size: 0.8rem; color: #64748b">${new Date(patient.dateOfBirth).toLocaleDateString()}</div>
            </td>
            <td>${patient.gender}</td>
            <td>${patient.phoneNumber}</td>
            <td>${patient.email}</td>
            <td><span style="font-weight: 600; color: #ef4444">${patient.bloodGroup}</span></td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Utility
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Search
function searchPatients() {
    const query = document.getElementById('patientSearchInput').value.toLowerCase();
    const filtered = allPatients.filter(p =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query)
    );
    renderAllPatients(filtered);
}

// Add Patient
document.getElementById('addPatientForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const patientData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        if (response.ok) {
            alert('Patient added successfully!');
            closeModal();
            e.target.reset();
            fetchPatients();
        } else {
            const errorData = await response.json();
            alert('Error: ' + (errorData.message || 'Failed to add patient'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error occurred');
    }
});

// Delete Patient
async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            fetchPatients();
        } catch (error) {
            alert('Failed to delete');
        }
    }
}
