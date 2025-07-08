/**
 * Domain Module Index
 * 
 * Exports all domain-specific modules for use in SDD tools
 */

export { healthcareDomain } from './healthcare.js';
export { ecommerceDomain } from './ecommerce.js';
export { fintechDomain } from './fintech.js';

export interface DomainModule {
  name: string;
  patterns: {
    components: Array<{
      pattern: string;
      suggestions: {
        name: string;
        responsibilities: string[];
        compliance?: string[];
      };
    }>;
    seams: Array<{
      name: string;
      trigger: string[];
      template: {
        description: string;
        businessRules: string[];
        errorScenarios?: Array<{
          condition: string;
          errorType: string;
          handling: string;
        }>;
      };
    }>;
    dataTypes: Record<string, {
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
        description?: string;
      }>;
    }>;
    validationRules: Array<{
      field: string;
      rule: string;
      errorMessage: string;
    }>;
    securityRequirements?: string[];
    regulatoryRequirements?: string[];
    performanceRequirements?: string[];
    auditRequirements?: string[];
  };
  prompts: {
    analysisAdditions: string;
    contractAdditions: string;
    stubAdditions: string;
  };
}

import { healthcareDomain } from './healthcare.js';
import { ecommerceDomain } from './ecommerce.js';
import { fintechDomain } from './fintech.js';

export const domainModules: Record<string, DomainModule> = {
  healthcare: healthcareDomain as DomainModule,
  ecommerce: ecommerceDomain as DomainModule,
  fintech: fintechDomain as DomainModule,
};

export function getDomainModule(domain?: string): DomainModule | undefined {
  if (!domain) return undefined;
  return domainModules[domain.toLowerCase()];
}

export function getAllDomains(): string[] {
  return Object.keys(domainModules);
}