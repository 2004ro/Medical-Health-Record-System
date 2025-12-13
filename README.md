# Medical Health Record System

A microservice-based sample project containing:
- auth-service
- patient-service
- doctor-service
- appointment-service
- medical-record-service

Quick start
1. Ensure the service directories exist:
   mkdir -p auth-service patient-service doctor-service appointment-service medical-record-service
2. Implement each service (API, data store, and Dockerfile as needed).
3. Run services individually or orchestrate with Docker Compose / Kubernetes.

Project structure
- auth-service/ — authentication and authorization
- patient-service/ — patient management
- doctor-service/ — doctor profiles and schedules
- appointment-service/ — booking and appointments
- medical-record-service/ — patient medical records

Notes
- Add README and implementation details inside each service folder.
- Secure sensitive data and follow healthcare compliance when storing records.
