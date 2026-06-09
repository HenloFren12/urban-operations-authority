# Architecture Overview  
Urban Operations Authority – Government of Karnataka  

---

## 1. System Design Philosophy

The system is designed around a complaint-driven operational lifecycle rather than a sector-driven dashboard model. Each citizen complaint is treated as an operational entity that moves through a structured workflow with enforced state transitions, priority logic, and SLA accountability.

The architecture prioritizes:

- Deterministic lifecycle management  
- Clear separation of concerns  
- Governance-ready audit traceability  
- Modular extensibility  
- Stateless API communication  

---

## 2. High-Level Architecture

The platform follows a decoupled full-stack architecture:

Frontend (Administrative Interface)  
?  
REST API Layer (FastAPI)  
?  
Database (Supabase / PostgreSQL)  

The frontend and backend communicate via JSON-based HTTP APIs. No business logic is embedded in the frontend.

---

## 3. Backend Architecture

### 3.1 Framework

- FastAPI (Python)
- RESTful endpoints
- Modular agent-based structure

### 3.2 Core Modules (Agents)

The backend is structured as a set of functional agents:

1. Complaint Intelligence Agent  
   - NLP-based classification  
   - Structured JSON extraction  
   - Category and urgency assignment  

2. Risk & SLA Engine  
   - Weighted scoring logic  
   - Deterministic priority calculation  
   - SLA deadline computation  

3. Work Order Generation Agent  
   - Structured checklist generation  
   - Cost estimation  
   - Operational conversion of complaint to work order  

4. Crew Allocation Agent  
   - Department-based assignment  
   - Fallback allocation logic  

5. Resolution Validation Agent  
   - SLA compliance evaluation  
   - Timezone-aware validation  
   - Lifecycle state enforcement  

6. Audit Logging Agent  
   - Immutable event logging  
   - Entity-based tracking  
   - Governance traceability  

---

## 4. Lifecycle Model

Each complaint follows a controlled state transition model:

Submitted  
? In Progress  
? Resolved  

Parallel entity:

Work Order  
? Assigned  
? Completed  

State transitions are enforced through backend logic and not client-controlled.

---

## 5. Database Schema Design

Primary Tables:

- complaints  
- work_orders  
- profiles  
- audit_logs  

Key design principles:

- UUID-based primary keys  
- Explicit foreign relationships  
- RLS disabled for demo environment  
- Timezone-consistent timestamps  
- Lifecycle status fields for traceability  

Audit logs capture:

- entity_type  
- entity_id  
- action  
- timestamp  

This ensures accountability and post-incident review capability.

---

## 6. SLA Enforcement Logic

SLA compliance is calculated using:

- Complaint creation timestamp  
- Computed SLA deadline  
- Resolution timestamp  

Compliance result:

- met  
- breached  

This is validated during work order completion.

---

## 7. Analytics Layer

The analytics endpoint aggregates:

- Complaint volume  
- Resolution count  
- In-progress workload  
- SLA compliance metrics  
- Category distribution  
- Average priority scoring  

Aggregation logic resides in backend to maintain single source of truth.

---

## 8. Frontend Architecture

The frontend is structured as:

- Global navigation layer  
- Dashboard layout system  
- Modular page components  
- Controlled navigation hierarchy  

UI strictly consumes backend APIs.  
No business logic is duplicated in the client.

---

## 9. Security Model (Prototype Level)

- Fixed credential-based login for demonstration  
- Audit logging of critical lifecycle actions  
- Role-based extensibility ready for future implementation  

Production-ready authentication and RBAC are planned for the next stage.

---

## 10. Deployment Model

Current Submission:
- Backend demonstrated locally via Swagger
- Frontend prototype deployed separately
- Decoupled architecture ensures easy production deployment

Next Phase:
- Cloud deployment (FastAPI on managed service)
- Integrated frontend-backend deployment
- Role-based access enforcement
- Map-based real-time visualization

---

## 11. Extensibility

The modular agent design allows:

- Additional infrastructure categories  
- Predictive maintenance integration  
- Department-level dashboards  
- Inter-agency routing  
- Historical performance modeling  

The system is designed for horizontal expansion without architectural refactoring.

---

End of Architecture Document.
