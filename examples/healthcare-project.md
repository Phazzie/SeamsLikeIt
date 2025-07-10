# Example: Healthcare Project with Seam-Driven Development

This example shows how to build a HIPAA-compliant patient management system using Seam-Driven Development.

## Step 1: Requirements

```
Build a patient management system for a medical clinic:
- Patient registration with insurance verification
- Appointment scheduling with provider availability
- Electronic health records integration
- Prescription management
- Lab results tracking
- Billing and claims processing
- HIPAA-compliant audit trails
```

## Step 2: Seam-Driven Development Analysis with Healthcare Domain

```
Use seam_orchestrate_simple with:
- requirements: "Patient management system with registration, appointments, EHR integration, prescriptions, lab results, billing, and HIPAA compliance"
- domain: "healthcare"
- outputPath: "./patient-management-system"
```

## Step 3: Generated Healthcare-Specific Architecture

### Components with Compliance

1. **Patient Service** (HIPAA Compliant)
   - Patient demographics (encrypted PHI)
   - Consent management
   - Insurance verification
   - Access control and audit logging

2. **Appointment Service**
   - Provider schedule management
   - Appointment booking with conflicts detection
   - Reminder notifications
   - No-show tracking

3. **Clinical Service** (HL7/FHIR Compatible)
   - Medical history
   - Clinical notes
   - Lab orders and results
   - Prescription management

4. **Billing Service** (X12 EDI Compliant)
   - Claims generation
   - Insurance submission
   - Payment posting
   - Patient statements

### Healthcare-Specific Seams

1. **Access Patient Record**
   ```typescript
   export interface AccessPatientRecordInput {
     patientId: PatientId;
     requesterId: ProviderId;
     accessReason: 'treatment' | 'payment' | 'operations';
     /** Break-glass emergency access */
     isEmergency?: boolean;
   }
   ```

2. **Order Lab Test**
   ```typescript
   export interface OrderLabTestInput {
     patientId: PatientId;
     orderingProvider: ProviderId;
     testCodes: LabTestCode[];
     priority: 'routine' | 'urgent' | 'stat';
     clinicalNotes?: string;
   }
   ```

## Step 4: HIPAA-Compliant Implementation Blueprint

```typescript
async accessPatientRecord(input: AccessPatientRecordInput): Promise<ContractResult<PatientRecord>> {
  // BLUEPRINT: HIPAA-compliant patient record access
  // 
  // STEP 1: Authenticate and authorize requester
  // - Verify provider credentials
  // - Check provider NPI status
  // - Validate session security
  //
  // STEP 2: Verify treatment relationship
  // - Check if provider has active relationship
  // - Verify access reason is legitimate
  // - Apply minimum necessary standard
  //
  // STEP 3: Check patient consent
  // - Load patient privacy preferences
  // - Check for opt-outs or restrictions
  // - Handle special categories (mental health, substance abuse)
  //
  // STEP 4: Handle emergency access if applicable
  // - Document break-glass reason
  // - Create elevated audit entry
  // - Notify privacy officer
  //
  // STEP 5: Retrieve patient data
  // - Load only authorized sections
  // - Apply data minimization
  // - Decrypt PHI fields
  //
  // STEP 6: Create comprehensive audit trail
  // - Log: who, what, when, why
  // - Include data elements accessed
  // - Make audit tamper-evident
  //
  // SECURITY REQUIREMENTS:
  // - All PHI must be encrypted at rest and in transit
  // - Session must use MFA authentication
  // - Implement automatic timeout after 15 minutes
  //
  // ERROR SCENARIOS:
  // - No treatment relationship: Return UNAUTHORIZED_ACCESS
  // - Patient opted out: Return CONSENT_DENIED
  // - Invalid provider: Return AUTHENTICATION_FAILED
  
  throw new NotImplementedError('Follow HIPAA-compliant blueprint above');
}
```

## Step 5: Healthcare-Specific Contracts

### Audit Trail Contract
```typescript
export interface AuditEntry {
  timestamp: Date;
  userId: string;
  userRole: 'physician' | 'nurse' | 'admin' | 'billing';
  patientId: PatientId;
  action: 'view' | 'create' | 'update' | 'delete';
  dataCategory: 'demographics' | 'clinical' | 'billing' | 'medications';
  /** Specific fields accessed */
  fieldsAccessed: string[];
  /** IP and location info */
  accessLocation: AccessLocation;
  /** Reason for access */
  accessReason: string;
  /** Emergency override used */
  isBreakGlass: boolean;
}
```

### Prescription Contract with DEA Compliance
```typescript
export interface PrescriptionInput {
  patientId: PatientId;
  prescriberId: ProviderId;
  /** DEA number for controlled substances */
  deaNumber?: string;
  medication: {
    name: string;
    strength: string;
    /** DEA schedule if controlled */
    deaSchedule?: 'II' | 'III' | 'IV' | 'V';
  };
  sig: string; // Directions
  quantity: number;
  refills: number;
  /** Required for e-prescribing */
  digitalSignature: string;
}
```

## Step 6: Compliance Validation

Generated tests ensure:

```typescript
describe('HIPAA Compliance Tests', () => {
  it('should enforce minimum necessary access', async () => {
    // Verify only authorized data is returned
  });

  it('should create complete audit trail', async () => {
    // Check all required audit fields are captured
  });

  it('should respect patient consent preferences', async () => {
    // Test opt-out scenarios
  });

  it('should handle break-glass emergency access', async () => {
    // Verify emergency override with proper logging
  });
});
```

## Step 7: Security Implementation Patterns

The Seam-Driven Development generator includes:

1. **Encryption Helpers**
   ```typescript
   private async encryptPHI(data: any): Promise<string> {
     // AES-256 encryption for PHI fields
   }
   ```

2. **Audit Logger**
   ```typescript
   private async logAccess(entry: AuditEntry): Promise<void> {
     // Tamper-evident audit logging
   }
   ```

3. **Consent Checker**
   ```typescript
   private async checkConsent(patientId: string, dataType: string): Promise<boolean> {
     // Verify patient consent status
   }
   ```

## Benefits for Healthcare

1. **Built-in Compliance** - HIPAA patterns included
2. **Audit Trail Automation** - Every access logged
3. **Consent Management** - Patient preferences respected
4. **Security by Design** - Encryption everywhere
5. **Interoperability** - HL7/FHIR ready

## Deployment Considerations

- Use HIPAA-compliant hosting (AWS HIPAA BAA)
- Enable encryption at rest for databases
- Configure automatic backups with encryption
- Set up security monitoring and alerts
- Regular security audits and penetration testing

The generated system is ready for HIPAA compliance certification with all required security controls implemented by design.