/**
 * Tests for domain-specific modules
 */

import { describe, it, expect } from '@jest/globals';
import { getDomainModule, getAllDomains } from '../src/domain-modules';
import { healthcareDomain } from '../src/domain-modules/healthcare';
import { ecommerceDomain } from '../src/domain-modules/ecommerce';
import { fintechDomain } from '../src/domain-modules/fintech';

describe('Domain Modules', () => {
  describe('getDomainModule', () => {
    it('should return healthcare domain module', () => {
      const module = getDomainModule('healthcare');
      expect(module).toBeDefined();
      expect(module?.name).toBe('healthcare');
      expect(module?.patterns).toBeDefined();
      expect(module?.prompts).toBeDefined();
    });

    it('should return ecommerce domain module', () => {
      const module = getDomainModule('ecommerce');
      expect(module).toBeDefined();
      expect(module?.name).toBe('ecommerce');
    });

    it('should return fintech domain module', () => {
      const module = getDomainModule('fintech');
      expect(module).toBeDefined();
      expect(module?.name).toBe('fintech');
    });

    it('should handle case insensitive domain names', () => {
      const module = getDomainModule('HEALTHCARE');
      expect(module).toBeDefined();
      expect(module?.name).toBe('healthcare');
    });

    it('should return undefined for unknown domain', () => {
      const module = getDomainModule('unknown');
      expect(module).toBeUndefined();
    });

    it('should return undefined for no domain', () => {
      const module = getDomainModule();
      expect(module).toBeUndefined();
    });
  });

  describe('getAllDomains', () => {
    it('should return all available domains', () => {
      const domains = getAllDomains();
      expect(domains).toContain('healthcare');
      expect(domains).toContain('ecommerce');
      expect(domains).toContain('fintech');
      expect(domains.length).toBe(3);
    });
  });

  describe('Healthcare Domain', () => {
    it('should have required pattern structures', () => {
      expect(healthcareDomain.patterns.components).toBeInstanceOf(Array);
      expect(healthcareDomain.patterns.seams).toBeInstanceOf(Array);
      expect(healthcareDomain.patterns.dataTypes).toBeDefined();
      expect(healthcareDomain.patterns.validationRules).toBeInstanceOf(Array);
    });

    it('should have healthcare-specific components', () => {
      const componentNames = healthcareDomain.patterns.components.map(c => c.pattern);
      expect(componentNames.some(n => n.includes('patient'))).toBe(true);
      expect(componentNames.some(n => n.includes('ehr'))).toBe(true);
    });

    it('should have compliance requirements', () => {
      expect(healthcareDomain.patterns.securityRequirements).toContain('All PHI must be encrypted in transit (TLS 1.2+)');
      expect(healthcareDomain.patterns.auditRequirements).toBeDefined();
    });
  });

  describe('E-commerce Domain', () => {
    it('should have e-commerce specific components', () => {
      const componentNames = ecommerceDomain.patterns.components.map(c => c.pattern);
      expect(componentNames.some(n => n.includes('cart'))).toBe(true);
      expect(componentNames.some(n => n.includes('product'))).toBe(true);
      expect(componentNames.some(n => n.includes('payment'))).toBe(true);
    });

    it('should have performance requirements', () => {
      expect(ecommerceDomain.patterns.performanceRequirements).toBeDefined();
      expect(ecommerceDomain.patterns.performanceRequirements).toContain('Cart operations < 200ms response time');
    });
  });

  describe('Fintech Domain', () => {
    it('should have fintech specific components', () => {
      const componentNames = fintechDomain.patterns.components.map(c => c.pattern);
      expect(componentNames.some(n => n.includes('kyc'))).toBe(true);
      expect(componentNames.some(n => n.includes('transaction'))).toBe(true);
    });

    it('should emphasize precision in money handling', () => {
      const moneyType = fintechDomain.patterns.dataTypes.Money;
      expect(moneyType.fields.find(f => f.name === 'amount')?.type).toBe('bigint');
    });

    it('should have regulatory requirements', () => {
      expect(fintechDomain.patterns.regulatoryRequirements).toBeDefined();
      expect(fintechDomain.patterns.regulatoryRequirements).toContain('SOX compliance for financial reporting');
    });
  });
});