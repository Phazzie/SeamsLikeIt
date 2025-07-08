# Example: E-commerce Project with SDD

This example demonstrates how to use the SDD MCP Server to build an e-commerce platform.

## Step 1: Define Requirements

```
I need to build an e-commerce platform with the following features:
- Product catalog with search and filtering
- Shopping cart that persists across sessions
- User registration and authentication
- Order processing with payment integration
- Inventory management with real-time updates
- Admin panel for product management
```

## Step 2: Run SDD Analysis

Using Claude with the SDD MCP Server:

```
Use sdd_orchestrate_simple with:
- requirements: "Build an e-commerce platform with product catalog, shopping cart, user authentication, order processing, payment integration, inventory management, and admin panel"
- domain: "ecommerce"
- outputPath: "./my-ecommerce-project"
```

## Step 3: Generated Architecture

The SDD analysis produces:

### Components
1. **Product Catalog Service**
   - Manages product information
   - Handles search and filtering
   - Tracks inventory levels

2. **Shopping Cart Service**
   - Persists cart state
   - Validates product availability
   - Calculates totals and discounts

3. **User Service**
   - Registration and authentication
   - Profile management
   - Order history

4. **Order Service**
   - Order creation and validation
   - Payment processing coordination
   - Order fulfillment tracking

5. **Payment Service**
   - Payment method management
   - Transaction processing
   - PCI compliance

### Key Seams (Integration Points)

1. **Add to Cart**
   - Producer: Shopping Cart Service
   - Consumer: Frontend/API
   - Validates inventory before adding

2. **Process Checkout**
   - Producer: Order Service
   - Consumer: Shopping Cart Service
   - Coordinates payment and inventory

3. **Update Inventory**
   - Producer: Product Catalog Service
   - Consumer: Order Service
   - Real-time inventory adjustments

## Step 4: Generated Contracts

Example contract for "Add to Cart":

```typescript
export interface AddToCartInput {
  /** Customer identifier */
  customerId: CustomerId;
  
  /** Product to add */
  productId: ProductId;
  
  /** Quantity to add */
  quantity: number;
  
  /** Optional variant selection */
  variantId?: string;
}

export interface AddToCartOutput {
  /** Updated cart */
  cart: ShoppingCart;
  
  /** Applied discounts */
  discounts: Discount[];
  
  /** Estimated totals */
  totals: CartTotals;
}

export interface AddToCartContract {
  /**
   * Add product to customer's shopping cart
   * @param input - Product and quantity to add
   * @returns ContractResult with updated cart
   */
  addToCart(input: AddToCartInput): Promise<ContractResult<AddToCartOutput>>;
}
```

## Step 5: Implementation Blueprint

Generated stub with implementation guidance:

```typescript
async addToCart(input: AddToCartInput): Promise<ContractResult<AddToCartOutput>> {
  // BLUEPRINT: Add product to shopping cart with inventory validation
  // 
  // STEP 1: Validate input parameters
  // - Check customerId exists
  // - Validate quantity is positive integer
  // - Verify productId format
  //
  // STEP 2: Fetch product information
  // - Get product details from catalog
  // - Check product is active and purchasable
  // - Verify variant exists if specified
  //
  // STEP 3: Check inventory availability
  // - Call inventory service for current stock
  // - Compare requested quantity with available
  // - Reserve inventory if available
  //
  // STEP 4: Load or create cart
  // - Fetch existing cart for customer
  // - Create new cart if none exists
  // - Check for duplicate items
  //
  // STEP 5: Add item to cart
  // - Create cart item with product details
  // - Apply any product-specific rules
  // - Update cart modification timestamp
  //
  // STEP 6: Calculate discounts and totals
  // - Apply active promotions
  // - Calculate subtotal, tax, shipping
  // - Generate discount breakdown
  //
  // ERROR SCENARIOS:
  // - Product not found: Return PRODUCT_NOT_FOUND
  // - Insufficient inventory: Return OUT_OF_STOCK with available quantity
  // - Invalid quantity: Return VALIDATION_FAILED
  // - Product discontinued: Return PRODUCT_UNAVAILABLE
  
  throw new NotImplementedError(
    'addToCart not implemented. Follow blueprint above.'
  );
}
```

## Step 6: AI Implementation

Give the stub to Claude or another AI:

```
Implement the addToCart method following the blueprint exactly. Use these patterns:
- Validate all inputs at the start
- Use transactions for inventory operations
- Return detailed error information
- Include performance optimizations for high-traffic scenarios
```

## Step 7: Integration Testing

The generated tests verify:

```typescript
describe('Add to Cart Integration', () => {
  it('should successfully add available product to cart', async () => {
    // Test happy path with valid product and inventory
  });

  it('should handle out of stock scenario gracefully', async () => {
    // Test inventory validation and error response
  });

  it('should enforce quantity limits per customer', async () => {
    // Test business rule enforcement
  });
});
```

## Benefits of SDD Approach

1. **Clear Architecture** - Components and interactions defined upfront
2. **Reliable Integration** - Contracts prevent integration issues
3. **AI-Friendly** - Blueprints guide AI implementation perfectly
4. **Domain Intelligence** - E-commerce patterns built-in
5. **Fast Development** - From idea to implementation in hours

## Next Steps

1. Review generated contracts in `contracts/` directory
2. Implement each component following blueprints
3. Run integration tests to verify
4. Deploy with confidence

The complete project structure is ready for implementation, with every integration point clearly defined and tested.