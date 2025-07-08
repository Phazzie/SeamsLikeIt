/**
 * Fintech Domain Module
 * 
 * Provides fintech-specific patterns and intelligence for SDD tools
 */

export const fintechDomain = {
  name: 'fintech',
  
  patterns: {
    components: [
      {
        pattern: 'account|banking|ledger',
        suggestions: {
          name: 'Account Management Service',
          responsibilities: [
            'Account creation and closure',
            'Balance management',
            'Transaction ledger',
            'Account limits and restrictions',
            'Statement generation',
          ],
          compliance: ['SOX', 'Basel III'],
        },
      },
      {
        pattern: 'payment|transfer|transaction',
        suggestions: {
          name: 'Transaction Service',
          responsibilities: [
            'Fund transfers',
            'Payment processing',
            'Transaction validation',
            'Clearing and settlement',
            'Transaction reversal',
          ],
          compliance: ['PCI-DSS', 'AML', 'SWIFT'],
        },
      },
      {
        pattern: 'kyc|identity|verification',
        suggestions: {
          name: 'Identity Verification Service',
          responsibilities: [
            'Customer identity verification',
            'Document verification',
            'Sanctions screening',
            'PEP checking',
            'Risk scoring',
          ],
          compliance: ['KYC', 'AML', 'FATF'],
        },
      },
      {
        pattern: 'fraud|risk|compliance',
        suggestions: {
          name: 'Risk Management Service',
          responsibilities: [
            'Transaction monitoring',
            'Fraud detection',
            'Risk scoring',
            'Compliance reporting',
            'Alert generation',
          ],
          compliance: ['AML', 'CTF', 'OFAC'],
        },
      },
    ],
    
    seams: [
      {
        name: 'Execute Transaction',
        trigger: ['transfer', 'payment', 'transaction'],
        template: {
          description: 'Execute financial transaction with compliance checks',
          businessRules: [
            'Verify account ownership',
            'Check available balance',
            'Apply transaction limits',
            'Perform AML screening',
            'Execute double-entry bookkeeping',
            'Generate audit trail',
          ],
          errorScenarios: [
            {
              condition: 'Insufficient funds',
              errorType: 'INSUFFICIENT_BALANCE',
              handling: 'Reject transaction, notify customer',
            },
            {
              condition: 'AML flag triggered',
              errorType: 'COMPLIANCE_BLOCK',
              handling: 'Hold transaction, escalate to compliance',
            },
            {
              condition: 'Daily limit exceeded',
              errorType: 'LIMIT_EXCEEDED',
              handling: 'Return limit details and reset time',
            },
          ],
        },
      },
      {
        name: 'Verify Identity',
        trigger: ['kyc', 'verify', 'identity'],
        template: {
          description: 'Perform identity verification for KYC compliance',
          businessRules: [
            'Collect required documents',
            'Verify document authenticity',
            'Match against sanctions lists',
            'Calculate risk score',
            'Store verification proof',
          ],
          errorScenarios: [
            {
              condition: 'Sanctions match found',
              errorType: 'SANCTIONS_HIT',
              handling: 'Block onboarding, escalate to compliance',
            },
            {
              condition: 'Document verification failed',
              errorType: 'DOCUMENT_INVALID',
              handling: 'Request alternative documents',
            },
          ],
        },
      },
    ],
    
    dataTypes: {
      Money: {
        fields: [
          { name: 'amount', type: 'bigint', required: true, description: 'Amount in minor units for precision' },
          { name: 'currency', type: 'string', required: true, description: 'ISO 4217 currency code' },
        ],
      },
      Account: {
        fields: [
          { name: 'id', type: 'AccountId', required: true },
          { name: 'number', type: 'string', required: true, description: 'Encrypted account number' },
          { name: 'type', type: "'checking' | 'savings' | 'investment'", required: true },
          { name: 'status', type: "'active' | 'frozen' | 'closed'", required: true },
          { name: 'balance', type: 'Money', required: true },
        ],
      },
      Transaction: {
        fields: [
          { name: 'id', type: 'TransactionId', required: true },
          { name: 'type', type: "'debit' | 'credit' | 'transfer'", required: true },
          { name: 'amount', type: 'Money', required: true },
          { name: 'timestamp', type: 'Date', required: true },
          { name: 'status', type: "'pending' | 'completed' | 'failed' | 'reversed'", required: true },
        ],
      },
    },
    
    validationRules: [
      {
        field: 'accountNumber',
        rule: 'Must be encrypted and pass checksum validation',
        errorMessage: 'Invalid account number format',
      },
      {
        field: 'amount',
        rule: 'Must use bigint for financial precision',
        errorMessage: 'Amount must use precise decimal handling',
      },
      {
        field: 'swift',
        rule: 'Must be valid SWIFT/BIC code',
        errorMessage: 'Invalid SWIFT code format',
      },
    ],
    
    securityRequirements: [
      'End-to-end encryption for all financial data',
      'Hardware security module (HSM) for key management',
      'Multi-factor authentication mandatory',
      'Implement transaction signing',
      'Real-time fraud monitoring',
      'Immutable audit logs with cryptographic proof',
    ],
    
    regulatoryRequirements: [
      'SOX compliance for financial reporting',
      'PCI-DSS for card payments',
      'AML/CTF transaction monitoring',
      'GDPR/CCPA for data privacy',
      'Open Banking API standards',
      'Real-time reporting to regulators',
    ],
  },
  
  prompts: {
    analysisAdditions: `
Fintech-Specific Analysis:
- Design for financial precision (no floating point)
- Plan for regulatory reporting requirements
- Include real-time fraud detection
- Design for high-frequency transactions
- Consider multi-currency support
- Plan for audit and compliance workflows`,
    
    contractAdditions: `
Fintech Contract Considerations:
- Use bigint for all monetary values
- Include transaction idempotency keys
- Add compliance check results
- Include audit trail metadata
- Plan for async settlement processes
- Add rate limiting for API security`,
    
    stubAdditions: `
Fintech Implementation Notes:
- CRITICAL: Use bigint for money, never float/double
- CRITICAL: Implement idempotent transaction processing
- CRITICAL: All operations must be atomic
- Include comprehensive audit logging
- Implement optimistic concurrency control
- Use event sourcing for transaction history
- Plan for regulatory reporting requirements`,
  },
};