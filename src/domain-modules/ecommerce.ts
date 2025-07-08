/**
 * E-commerce Domain Module
 * 
 * Provides e-commerce-specific patterns and intelligence for SDD tools
 */

export const ecommerceDomain = {
  name: 'ecommerce',
  
  patterns: {
    components: [
      {
        pattern: 'product|catalog|inventory',
        suggestions: {
          name: 'Product Catalog Service',
          responsibilities: [
            'Product information management',
            'Inventory tracking',
            'Pricing and promotions',
            'Category management',
            'Product search and filtering',
          ],
        },
      },
      {
        pattern: 'cart|basket|shopping',
        suggestions: {
          name: 'Shopping Cart Service',
          responsibilities: [
            'Cart persistence and management',
            'Item quantity validation',
            'Price calculation',
            'Promotion application',
            'Cart abandonment tracking',
          ],
        },
      },
      {
        pattern: 'order|checkout|purchase',
        suggestions: {
          name: 'Order Management Service',
          responsibilities: [
            'Order placement and validation',
            'Payment processing coordination',
            'Order status tracking',
            'Fulfillment coordination',
            'Order history management',
          ],
        },
      },
      {
        pattern: 'payment|billing|transaction',
        suggestions: {
          name: 'Payment Service',
          responsibilities: [
            'Payment method management',
            'Payment processing',
            'PCI compliance',
            'Refund processing',
            'Transaction reconciliation',
          ],
          compliance: ['PCI-DSS'],
        },
      },
      {
        pattern: 'customer|user|account',
        suggestions: {
          name: 'Customer Service',
          responsibilities: [
            'Customer registration and profiles',
            'Authentication and authorization',
            'Address book management',
            'Preference management',
            'Customer segmentation',
          ],
          compliance: ['GDPR', 'CCPA'],
        },
      },
    ],
    
    seams: [
      {
        name: 'Add to Cart',
        trigger: ['add', 'cart', 'item'],
        template: {
          description: 'Add product to shopping cart with inventory validation',
          businessRules: [
            'Verify product exists and is active',
            'Check inventory availability',
            'Validate quantity limits',
            'Apply pricing rules',
            'Update cart totals',
          ],
          errorScenarios: [
            {
              condition: 'Insufficient inventory',
              errorType: 'OUT_OF_STOCK',
              handling: 'Return available quantity with alternatives',
            },
            {
              condition: 'Product discontinued',
              errorType: 'PRODUCT_UNAVAILABLE',
              handling: 'Suggest similar products',
            },
          ],
        },
      },
      {
        name: 'Process Checkout',
        trigger: ['checkout', 'order', 'purchase'],
        template: {
          description: 'Convert cart to order with payment processing',
          businessRules: [
            'Validate cart contents and inventory',
            'Calculate taxes and shipping',
            'Process payment authorization',
            'Reserve inventory',
            'Generate order confirmation',
          ],
          errorScenarios: [
            {
              condition: 'Payment declined',
              errorType: 'PAYMENT_FAILED',
              handling: 'Release inventory reservation, retain cart',
            },
            {
              condition: 'Inventory changed during checkout',
              errorType: 'INVENTORY_CONFLICT',
              handling: 'Update cart with current availability',
            },
          ],
        },
      },
    ],
    
    dataTypes: {
      Money: {
        fields: [
          { name: 'amount', type: 'number', required: true, description: 'Amount in minor units (cents)' },
          { name: 'currency', type: 'string', required: true, description: 'ISO 4217 currency code' },
        ],
      },
      Product: {
        fields: [
          { name: 'id', type: 'ProductId', required: true },
          { name: 'sku', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'price', type: 'Money', required: true },
          { name: 'inventory', type: 'number', required: true },
          { name: 'status', type: "'active' | 'inactive' | 'discontinued'", required: true },
        ],
      },
      OrderStatus: {
        fields: [
          { name: 'status', type: "'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'", required: true },
          { name: 'timestamp', type: 'Date', required: true },
          { name: 'notes', type: 'string', required: false },
        ],
      },
    },
    
    validationRules: [
      {
        field: 'email',
        rule: 'Must be valid email format',
        errorMessage: 'Invalid email address',
      },
      {
        field: 'quantity',
        rule: 'Must be positive integer',
        errorMessage: 'Quantity must be at least 1',
      },
      {
        field: 'creditCard',
        rule: 'Never store unencrypted',
        errorMessage: 'Credit card must be tokenized',
      },
    ],
    
    securityRequirements: [
      'PCI-DSS compliance for payment data',
      'Tokenize all payment methods',
      'Implement rate limiting on API endpoints',
      'Secure session management',
      'HTTPS for all communications',
      'Regular security audits',
    ],
    
    performanceRequirements: [
      'Cart operations < 200ms response time',
      'Product search < 500ms including facets',
      'Support 10K concurrent users',
      'CDN for product images',
      'Cache product catalog data',
      'Queue order processing for scalability',
    ],
  },
  
  prompts: {
    analysisAdditions: `
E-commerce-Specific Analysis:
- Map customer journey from browsing to purchase
- Identify payment processing requirements
- Plan for inventory management across channels
- Consider promotional and pricing strategies
- Design for peak traffic (Black Friday, etc.)
- Include analytics and recommendation engines`,
    
    contractAdditions: `
E-commerce Contract Considerations:
- Include currency in all monetary values
- Add inventory reservation mechanisms
- Include shipping calculation interfaces
- Plan for tax calculation services
- Add promotional discount interfaces`,
    
    stubAdditions: `
E-commerce Implementation Notes:
- CRITICAL: Never log payment card data
- CRITICAL: Use idempotency keys for payment operations
- Implement optimistic locking for inventory
- Cache product data aggressively
- Handle currency precision carefully
- Plan for eventual consistency in inventory`,
  },
};