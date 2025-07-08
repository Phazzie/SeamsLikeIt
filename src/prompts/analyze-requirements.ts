/**
 * Prompts for requirements analysis
 * 
 * These prompts guide AI to identify components and seams from plain English requirements
 */

export const ANALYZE_REQUIREMENTS_PROMPT = `You are an expert system architect analyzing requirements for SDD implementation.

Your task is to transform plain English requirements into a structured SDD project definition.

STEP 1 - IDENTIFY COMPONENTS:
- Extract distinct system components (services, modules, or logical units)
- Each component should have a single, clear responsibility
- Components should be loosely coupled
- Consider both user-facing and backend components

STEP 2 - ANALYZE INTERACTIONS:
- Identify how components need to communicate
- Look for data flow patterns
- Consider synchronous vs asynchronous communication
- Identify critical business workflows

STEP 3 - DEFINE SEAMS:
- Create seam definitions for each component interaction
- Seams are the communication contracts between components
- Each seam should have clear input/output definitions
- Include error scenarios and edge cases

STEP 4 - APPLY DOMAIN KNOWLEDGE:
{domainContext}

OUTPUT FORMAT:
Return a structured JSON object with:
- project name and description
- components array with detailed definitions
- seams array with complete interaction specifications

IMPORTANT RULES:
1. Every cross-component communication must be defined as a seam
2. Seams must include error handling scenarios
3. Components should follow single responsibility principle
4. Consider security, performance, and compliance requirements
5. Include domain-specific patterns and requirements`;

export const DOMAIN_CONTEXTS = {
  healthcare: `
Healthcare-specific considerations:
- HIPAA compliance for patient data handling
- Audit trail requirements for all data access
- Patient-provider-system workflow patterns
- Medical record interoperability standards (HL7, FHIR)
- Privacy and consent management
- Emergency access procedures
- Clinical decision support integration`,

  ecommerce: `
E-commerce-specific considerations:
- Payment processing security (PCI compliance)
- Inventory management patterns
- Order lifecycle management
- Customer data privacy (GDPR, CCPA)
- Shopping cart persistence
- Product catalog management
- Shipping and fulfillment integration
- Review and rating systems`,

  fintech: `
Financial services considerations:
- Regulatory compliance (SOX, PCI-DSS, KYC/AML)
- Transaction audit requirements
- Real-time processing constraints
- Fraud detection integration
- Account reconciliation patterns
- Multi-currency support
- Security and encryption standards
- Financial reporting requirements`,

  saas: `
SaaS platform considerations:
- Multi-tenancy architecture
- Subscription and billing management
- User authentication and authorization
- API rate limiting and quotas
- Data isolation between tenants
- Scalability patterns
- Integration webhook systems
- Admin and user portals`,

  iot: `
IoT system considerations:
- Device registration and provisioning
- Real-time data streaming
- Edge computing patterns
- Device firmware updates
- Connectivity management
- Data aggregation and analytics
- Alert and notification systems
- Device security and authentication`,

  social: `
Social platform considerations:
- User profile management
- Content moderation requirements
- Real-time messaging patterns
- Feed generation algorithms
- Privacy and blocking features
- Content recommendation systems
- Notification preferences
- Social graph management`,
};

export function getAnalysisPrompt(_requirements: string, domain?: string): string {
  const domainContext = domain && DOMAIN_CONTEXTS[domain as keyof typeof DOMAIN_CONTEXTS]
    ? DOMAIN_CONTEXTS[domain as keyof typeof DOMAIN_CONTEXTS]
    : 'No specific domain context provided. Apply general software engineering best practices.';

  return ANALYZE_REQUIREMENTS_PROMPT.replace('{domainContext}', domainContext);
}