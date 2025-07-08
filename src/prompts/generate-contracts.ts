/**
 * Prompts for contract generation
 * 
 * These prompts guide AI to create TypeScript interfaces with ContractResult<T> patterns
 */

export const GENERATE_CONTRACTS_PROMPT = `You are a TypeScript expert creating SDD-compliant contracts.

THINK LIKE THIS: Each contract is a promise between two components. Make that promise explicit, unbreakable, and self-documenting.

Your task is to generate TypeScript interfaces for each seam in the project as JSON output.

SELF-VALIDATION CHECKLIST:
□ Can this handle null/undefined inputs gracefully?
□ Are all possible error states represented?
□ Is the success path unambiguous?
□ Would a junior developer understand this contract?

CORE RULES:
1. All cross-component functions return Promise<ContractResult<T>>
2. ContractResult = { success: boolean, data?: T, error?: string, metadata?: Record<string, any> }
3. Input/Output interfaces must be explicit and comprehensive
4. Include proper validation requirements in interface comments
5. Use clear, descriptive names that reflect business purpose

INTERFACE PATTERNS:

// For input data:
export interface [SeamName]Input {
  // Add JSDoc comments for validation rules
  /** @minLength 3 @maxLength 100 */
  fieldName: string;
  
  /** @minimum 0 @maximum 1000000 */
  amount?: number;
  
  // Use union types for constrained values
  status: 'active' | 'inactive' | 'pending';
}

// For output data:
export interface [SeamName]Output {
  id: string;
  result: ComplexType;
  timestamp: Date;
}

// For the seam contract:
export interface [SeamName]Contract {
  /**
   * [Business purpose description]
   * @param input - [What the input represents]
   * @returns ContractResult with [what the output represents]
   * @throws Never - all errors returned in ContractResult
   */
  [methodName](input: [SeamName]Input): Promise<ContractResult<[SeamName]Output>>;
}

ADDITIONAL CONSIDERATIONS:
- Include domain-specific types (Money, PatientId, OrderStatus, etc.)
- Add validation decorators as comments
- Consider async patterns and event-driven scenarios
- Include error type enums for each seam
- Add metadata types for audit trails

OUTPUT FORMAT:
Generate a complete TypeScript file with:
1. Import statements for ContractResult and domain types
2. Error type enums
3. Input/Output interfaces
4. Contract interfaces
5. Helper type definitions`;

export const CONTRACT_TEMPLATES = {
  base: `/**
 * Auto-generated SDD Contract
 * Seam: {seamName}
 * Generated: {timestamp}
 */

import { ContractResult } from '../types/sdd';

`,

  errorEnum: `export enum {SeamName}Errors {
  VALIDATION_FAILED = '{SEAM_NAME}_VALIDATION_FAILED',
  NOT_FOUND = '{SEAM_NAME}_NOT_FOUND',
  UNAUTHORIZED = '{SEAM_NAME}_UNAUTHORIZED',
  BUSINESS_RULE_VIOLATION = '{SEAM_NAME}_BUSINESS_RULE_VIOLATION',
  EXTERNAL_SERVICE_ERROR = '{SEAM_NAME}_EXTERNAL_SERVICE_ERROR',
}

`,

  domainTypes: {
    healthcare: `// Healthcare domain types
export type PatientId = string & { __brand: 'PatientId' };
export type ProviderId = string & { __brand: 'ProviderId' };
export type MedicalRecordNumber = string & { __brand: 'MRN' };

export interface PatientData {
  id: PatientId;
  mrn: MedicalRecordNumber;
  demographics: PatientDemographics;
  // HIPAA: Only include necessary fields
}

`,

    ecommerce: `// E-commerce domain types
export type ProductId = string & { __brand: 'ProductId' };
export type OrderId = string & { __brand: 'OrderId' };
export type CustomerId = string & { __brand: 'CustomerId' };

export interface Money {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface Product {
  id: ProductId;
  name: string;
  price: Money;
  inventory: number;
}

`,

    fintech: `// Financial domain types
export type AccountId = string & { __brand: 'AccountId' };
export type TransactionId = string & { __brand: 'TransactionId' };

export interface Money {
  amount: bigint; // Use bigint for financial precision
  currency: string; // ISO 4217 code
}

export interface Transaction {
  id: TransactionId;
  fromAccount: AccountId;
  toAccount: AccountId;
  amount: Money;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
}

`,
  },
};