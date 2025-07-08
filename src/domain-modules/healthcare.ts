/**
 * Healthcare Domain Module
 * 
 * Provides healthcare-specific patterns and intelligence for SDD tools
 */

export const healthcareDomain = {
  name: 'healthcare',
  
  patterns: {
    components: [
      {
        pattern: 'patient.*management|patient.*service',
        suggestions: {
          name: 'Patient Management Service',
          responsibilities: [
            'Patient registration and demographics',
            'Medical history tracking',
            'Consent management',
            'Patient portal access',
          ],
          compliance: ['HIPAA', 'HITECH'],
        },
      },
      {
        pattern: 'ehr|electronic.*health.*record',
        suggestions: {
          name: 'EHR Service',
          responsibilities: [
            'Clinical documentation',
            'Medical record storage',
            'Interoperability (HL7/FHIR)',
            'Audit trail maintenance',
          ],
          compliance: ['HIPAA', 'HL7', 'FHIR'],
        },
      },
      {
        pattern: 'appointment|scheduling',
        suggestions: {
          name: 'Appointment Service',
          responsibilities: [
            'Provider availability management',
            'Patient scheduling',
            'Appointment reminders',
            'Waitlist management',
          ],
        },
      },
      {
        pattern: 'billing|claims|insurance',
        suggestions: {
          name: 'Medical Billing Service',
          responsibilities: [
            'Insurance verification',
            'Claims submission',
            'Payment processing',
            'Patient statements',
          ],
          compliance: ['HIPAA', 'X12 EDI'],
        },
      },
    ],
    
    seams: [
      {
        name: 'Patient Data Access',
        trigger: ['patient', 'provider', 'access'],
        template: {
          description: 'Secure access to patient medical information',
          businessRules: [
            'Verify provider has treatment relationship',
            'Check patient consent status',
            'Log access for audit trail',
            'Apply minimum necessary standard',
          ],
          errorScenarios: [
            {
              condition: 'No treatment relationship',
              errorType: 'UNAUTHORIZED_ACCESS',
              handling: 'Return authorization failure with audit log',
            },
            {
              condition: 'Patient opted out of data sharing',
              errorType: 'CONSENT_DENIED',
              handling: 'Return consent status with alternative options',
            },
          ],
        },
      },
      {
        name: 'Clinical Order Workflow',
        trigger: ['order', 'lab', 'prescription', 'referral'],
        template: {
          description: 'Clinical order placement and tracking',
          businessRules: [
            'Validate provider credentials',
            'Check for drug interactions or contraindications',
            'Route to appropriate fulfillment system',
            'Track order status and results',
          ],
        },
      },
    ],
    
    dataTypes: {
      PatientIdentifier: {
        fields: [
          { name: 'mrn', type: 'string', required: true, description: 'Medical Record Number' },
          { name: 'facility', type: 'string', required: true },
          { name: 'type', type: "'MRN' | 'TEMP' | 'EXTERNAL'", required: true },
        ],
      },
      ClinicalDocument: {
        fields: [
          { name: 'type', type: 'DocumentType', required: true },
          { name: 'authorId', type: 'ProviderId', required: true },
          { name: 'patientId', type: 'PatientId', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'metadata', type: 'DocumentMetadata', required: true },
        ],
      },
    },
    
    validationRules: [
      {
        field: 'ssn',
        rule: 'Should be encrypted at rest and in transit',
        errorMessage: 'SSN must be properly encrypted',
      },
      {
        field: 'dateOfBirth',
        rule: 'Must be a valid past date',
        errorMessage: 'Invalid date of birth',
      },
      {
        field: 'npi',
        rule: 'Must be 10-digit NPI number',
        errorMessage: 'Invalid NPI format',
      },
    ],
    
    securityRequirements: [
      'All PHI must be encrypted in transit (TLS 1.2+)',
      'Implement role-based access control (RBAC)',
      'Maintain comprehensive audit logs',
      'Support break-glass emergency access',
      'Implement automatic session timeout',
      'Support multi-factor authentication',
    ],
    
    auditRequirements: [
      'Log all patient data access with timestamp',
      'Record user identity and role',
      'Track data modifications with before/after values',
      'Maintain logs for minimum 6 years',
      'Make logs tamper-evident',
    ],
  },
  
  prompts: {
    analysisAdditions: `
Healthcare-Specific Analysis:
- Identify PHI (Protected Health Information) flows
- Map HIPAA compliance requirements to components
- Consider clinical workflows and provider needs
- Plan for interoperability standards (HL7, FHIR, DICOM)
- Include patient consent management
- Design for audit trail requirements`,
    
    contractAdditions: `
Healthcare Contract Considerations:
- Mark interfaces handling PHI
- Include consent verification in contracts
- Add audit trail metadata to responses
- Consider emergency access scenarios
- Include provider credential validation`,
    
    stubAdditions: `
Healthcare Implementation Notes:
- CRITICAL: All PHI must be encrypted
- CRITICAL: Verify user authorization before data access
- CRITICAL: Log all accesses to audit trail
- Include consent checks in data access methods
- Implement data minimization principle
- Handle break-glass emergency scenarios`,
  },
};