const API_BASE_URL = 'http://localhost:8082/api/v1/patients';

// State
let allPatients = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPatients();
    fetchAppointments();
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

// Update Dashboard Stats
function updateDashboardStats(patients) {
    if (patients) document.getElementById('totalPatientsCount').innerText = patients.length;
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
                <button class="action-btn" title="View Details"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn" title="Edit Patient"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" title="Delete Patient" onclick="deletePatient(${patient.patientId})" style="color: #ef4444; border-color: #fee2e2; background: #fef2f2;">
                    <i class="fa-solid fa-trash"></i>
                </button>
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


const APPT_API_URL = 'http://localhost:8082/api/v1/appointments';
const PATIENT_API_URL = 'http://localhost:8082/api/v1/patients';

// Fetch Appointments
async function fetchAppointments() {
    try {
        const response = await fetch(APPT_API_URL);
        const appointments = await response.json();
        allAppointments = appointments; // Store appointments in state
        renderAppointments(appointments);
        updateDashboardStats(allPatients, allAppointments); // Update with both patients and appointments
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

// Render Appointments
function renderAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = '';

    appointments.forEach(appt => {
        const datetime = new Date(appt.appointmentTime).toLocaleString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${appt.id}</td>
            <td>${appt.patientName}</td>
            <td>${appt.doctorName}</td>
            <td>${datetime}</td>
            <td>${appt.reason}</td>
            <td><span class="status-badge" style="background: #e0f2fe; color: #0284c7;">${appt.status}</span></td>
            <td>
                <button class="action-btn" onclick="deleteAppointment(${appt.id})" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add Appointment Modal Logic
function openAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.add('active');
}
function closeAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.remove('active');
}

// Fetch Patient Name for Modal
async function fetchPatientName() {
    const id = document.getElementById('appPatientId').value;
    const nameField = document.getElementById('appPatientName');

    if (!id) return;

    try {
        const response = await fetch(`${PATIENT_API_URL}/${id}`);
        if (response.ok) {
            const patient = await response.json();
            nameField.value = `${patient.firstName} ${patient.lastName}`;
        } else {
            nameField.value = "Patient Not Found";
        }
    } catch (e) {
        nameField.value = "Error fetching patient";
    }
}

// Handle Add Appointment Submit
document.getElementById('addAppointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Add default status
    data.status = "SCHEDULED";

    try {
        const response = await fetch(APPT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Appointment Booked!');
            closeAppointmentModal();
            fetchAppointments();
            e.target.reset();
        } else {
            alert('Failed to book appointment');
        }
    } catch (error) {
        alert('Error booking appointment');
    }
});

// Delete Appointment
async function deleteAppointment(id) {
    if (confirm('Cancel this appointment?')) {
        await fetch(`${APPT_API_URL}/${id}`, { method: 'DELETE' });
        fetchAppointments();
    }
}

// Global Search
document.getElementById('globalSearch').addEventListener('keyup', (e) => {
    const query = e.target.value.toLowerCase();

    // Switch to patients tab if not active
    if (!document.getElementById('patients').classList.contains('active')) {
        showSection('patients');
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.nav-item')[1].classList.add('active'); // 2nd item is Patients
    }

    const filtered = allPatients.filter(p =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.patientUniqueId.toLowerCase().includes(query)
    );
    renderAllPatients(filtered);
});
