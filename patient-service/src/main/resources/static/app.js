const API_BASE_URL = '/api/v1/patients';

// State
let allPatients = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPatients();
    fetchAppointments();
    fetchLabResults();
    fetchBills();
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
// Update Dashboard Stats
function updateDashboardStats(patients, appointments) {
    if (patients) document.getElementById('totalPatientsCount').innerText = patients.length;

    if (appointments) {
        const today = new Date().toISOString().split('T')[0];
        const todaysVisits = appointments.filter(app => app.appointmentTime.startsWith(today)).length;
        document.getElementById('todayVisitsCount').innerText = todaysVisits;
    }
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
                <button class="action-btn" title="View Details" onclick="viewPatientDetails(${patient.patientId})"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn" title="Edit Patient" onclick="openEditModal(${patient.patientId})"><i class="fa-solid fa-pen"></i></button>
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


const APPT_API_URL = '/api/v1/appointments';
const PATIENT_API_URL = '/api/v1/patients';

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

// Theme Switching
function toggleTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        // Optional: Save preference to localStorage
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Check for saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    // Ensure selector matches if it exists on load
    // This part is tricky if the DOM isn't ready, but CSS handles the class.
}

// Fetch Patient Name by Unique ID
async function fetchPatientName() {
    const searchInput = document.getElementById('appPatientSearchInput');
    const uniqueId = searchInput.value.trim();
    const nameField = document.getElementById('appPatientName');
    const hiddenIdField = document.getElementById('appHiddenPatientId');

    if (!uniqueId) {
        nameField.value = '';
        if (hiddenIdField) hiddenIdField.value = '';
        return;
    }

    // Since we have all patients loaded, we can filter client-side first for speed
    const patient = allPatients.find(p => p.patientUniqueId === uniqueId);

    if (patient) {
        nameField.value = `${patient.firstName} ${patient.lastName}`;
        if (hiddenIdField) hiddenIdField.value = patient.patientId;
    } else {
        nameField.value = "Patient Not Found";
        if (hiddenIdField) hiddenIdField.value = '';
    }
}

// Open Edit Modal
function openEditModal(id) {
    const patient = allPatients.find(p => p.patientId === id);
    if (!patient) return;

    document.getElementById('editPatientId').value = patient.patientId;
    document.getElementById('editFirstName').value = patient.firstName;
    document.getElementById('editLastName').value = patient.lastName;
    document.getElementById('editEmail').value = patient.email;
    document.getElementById('editPhoneNumber').value = patient.phoneNumber;
    document.getElementById('editDateOfBirth').value = patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '';
    document.getElementById('editGender').value = patient.gender;
    document.getElementById('editBloodGroup').value = patient.bloodGroup;
    document.getElementById('editZipCode').value = patient.zipCode || ''; // Handle potential nulls
    document.getElementById('editAddress').value = patient.address || '';
    document.getElementById('editCity').value = patient.city || '';
    document.getElementById('editState').value = patient.state || '';
    document.getElementById('editAllergies').value = patient.allergies || '';
    document.getElementById('editMedicalHistory').value = patient.medicalHistory || '';

    document.getElementById('editPatientModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editPatientModal').classList.remove('active');
}

// View Details (Reusing Edit Modal in Read-Only Mode for simplicity, or creating a separate one)
function viewPatientDetails(id) {
    const patient = allPatients.find(p => p.patientId === id);
    if (!patient) return;

    // Use specific view modal or alert for now as per simplicity
    alert(`
        Patient Details:
        ID: ${patient.patientUniqueId}
        Name: ${patient.firstName} ${patient.lastName}
        Email: ${patient.email}
        Phone: ${patient.phoneNumber}
        DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}
        Gender: ${patient.gender}
        Blood Group: ${patient.bloodGroup}
        Address: ${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}
        Allergies: ${patient.allergies || 'None'}
        History: ${patient.medicalHistory || 'None'}
    `);
}

// Handle Edit Submit
document.getElementById('editPatientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editPatientId').value;
    const formData = new FormData(e.target);
    const patientData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        if (response.ok) {
            alert('Patient updated successfully!');
            closeEditModal();
            fetchPatients();
        } else {
            alert('Failed to update patient');
        }
    } catch (error) {
        alert('Error updating patient');
    }
});


// Handle Add Appointment Submit
document.getElementById('addAppointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Add default status
    data.status = "SCHEDULED";

    // Ensure appointmentTime is in proper format if needed
    // But datetime-local usually works fine with standard Spring boot ISO handling if localdatetime is used.

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
            console.error(await response.text()); // Log server error for debugging
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
const globalSearchInput = document.getElementById('globalSearch');
if (globalSearchInput) {
    globalSearchInput.addEventListener('keyup', (e) => {
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
}

const LAB_API_URL = '/api/v1/lab-results';
const BILL_API_URL = '/api/v1/bills';

async function fetchLabResults() {
    try {
        const res = await fetch(LAB_API_URL);
        const data = await res.json();
        renderLabResults(data);

        // Update Dashboard Stat
        const pending = data.filter(d => d.status === 'PENDING').length;
        document.getElementById('labResultsCount').innerText = `${pending} Pending`;
    } catch (e) { console.error(e); }
}

async function fetchBills() {
    try {
        const res = await fetch(BILL_API_URL);
        const data = await res.json();
        renderBills(data);

        // Update Dashboard Stat
        const total = data.filter(d => d.status === 'PAID').reduce((sum, item) => sum + item.amount, 0);
        document.getElementById('revenueAmount').innerText = `$${total.toLocaleString()}`;
    } catch (e) { console.error(e); }
}

function renderLabResults(data) {
    const tbody = document.getElementById('labResultsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.patientName || 'Unknown'}</td>
            <td>${item.testName}</td>
            <td>${item.result || '-'}</td>
            <td>${item.testDate}</td>
            <td><span class="status-badge ${item.status === 'COMPLETED' ? 'active-status' : ''}">${item.status}</span></td>
            <td><button class="action-btn" onclick="deleteLab(${item.id})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderBills(data) {
    const tbody = document.getElementById('revenueTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.patientName || 'Unknown'}</td>
            <td>${item.description}</td>
            <td>$${item.amount}</td>
            <td><span class="status-badge ${item.status === 'PAID' ? 'active-status' : ''}">${item.status}</span></td>
            <td>${item.billDate}</td>
            <td><button class="action-btn" onclick="deleteBill(${item.id})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal Logic
function openLabModal() {
    populatePatientSelects();
    document.getElementById('addLabModal').classList.add('active');
}
function closeLabModal() {
    document.getElementById('addLabModal').classList.remove('active');
}

function openBillModal() {
    populatePatientSelects();
    document.getElementById('addBillModal').classList.add('active');
}
function closeBillModal() {
    document.getElementById('addBillModal').classList.remove('active');
}

function populatePatientSelects() {
    const labSelect = document.getElementById('labPatientSelect');
    const billSelect = document.getElementById('billPatientSelect');

    // Safety check if allPatients isn't loaded yet
    const patients = allPatients || [];

    const options = '<option value="">Select Patient</option>' +
        patients.map(p => `<option value="${p.patientId}" data-name="${p.firstName} ${p.lastName}">${p.firstName} ${p.lastName} (${p.patientUniqueId})</option>`).join('');

    if (labSelect) labSelect.innerHTML = options;
    if (billSelect) billSelect.innerHTML = options;
}

function setPatientName(type) {
    const select = document.getElementById(type === 'lab' ? 'labPatientSelect' : 'billPatientSelect');
    const name = select.options[select.selectedIndex].getAttribute('data-name');
    document.getElementById(type === 'lab' ? 'labPatientNameHidden' : 'billPatientNameHidden').value = name;
}

// Form Submit Handlers
const labForm = document.getElementById('addLabForm');
if (labForm) {
    labForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        await fetch(LAB_API_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        closeLabModal();
        fetchLabResults();
        e.target.reset();
    });
}

const billForm = document.getElementById('addBillForm');
if (billForm) {
    billForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        await fetch(BILL_API_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        closeBillModal();
        fetchBills();
        e.target.reset();
    });
}

async function deleteLab(id) {
    if (confirm('Delete this result?')) {
        await fetch(`${LAB_API_URL}/${id}`, { method: 'DELETE' });
        fetchLabResults();
    }
}

async function deleteBill(id) {
    if (confirm('Delete this transaction?')) {
        await fetch(`${BILL_API_URL}/${id}`, { method: 'DELETE' });
        fetchBills();
    }
}
