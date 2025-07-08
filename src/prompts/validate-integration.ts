/**
 * Prompts for integration validation
 * 
 * These prompts guide AI to create tests that verify component communication
 */

export const VALIDATE_INTEGRATION_PROMPT = `You are an integration testing expert validating SDD component connections.

Your task is to generate comprehensive test scenarios that prove components can communicate successfully through their defined seams.

TEST SCENARIO STRUCTURE:
1. Happy Path Tests
   - Valid input produces expected output
   - All contract requirements are met
   - Data flows correctly between components

2. Error Scenario Tests
   - Each defined error case is handled properly
   - Components fail gracefully
   - Error information is meaningful

3. Edge Case Tests
   - Boundary conditions
   - Null/undefined handling
   - Concurrent access scenarios

4. Contract Compliance Tests
   - All methods return ContractResult<T>
   - Error enums are used correctly
   - Metadata is properly structured

TEST GENERATION PATTERN:
describe('[SeamName] Integration', () => {
  it('should handle happy path scenario', async () => {
    // GIVEN: Valid input data
    const input = { /* valid data matching contract */ };
    
    // WHEN: Calling the seam method
    const result = await component.method(input);
    
    // THEN: Successful ContractResult with expected data
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ /* expected structure */ });
  });

  it('should handle [specific error scenario]', async () => {
    // GIVEN: Input that triggers error condition
    const input = { /* data causing error */ };
    
    // WHEN: Calling the seam method
    const result = await component.method(input);
    
    // THEN: Failed ContractResult with appropriate error
    expect(result.success).toBe(false);
    expect(result.error).toBe(ErrorEnum.SPECIFIC_ERROR);
  });
});

VALIDATION CRITERIA:
1. Every seam has at least 3 test scenarios
2. All error types are covered
3. Integration points are explicitly tested
4. Mock external dependencies appropriately
5. Test data is realistic for the domain

OUTPUT FORMAT:
Generate a test suite that:
- Validates each seam independently
- Tests component interactions
- Ensures contract compliance
- Provides clear pass/fail results`;

export const VALIDATION_TEST_TEMPLATES = {
  happyPath: `it('should successfully {action} when given valid input', async () => {
    // Arrange
    const validInput: {InputType} = {
      // Realistic valid data
    };
    const mockDependency = createMock{Dependency}();
    const component = new {Component}({ dependency: mockDependency });
    
    // Act
    const result = await component.{method}(validInput);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toMatchObject({
      // Expected output structure
    });
    expect(result.error).toBeUndefined();
  });`,

  errorScenario: `it('should return {ErrorType} when {condition}', async () => {
    // Arrange
    const invalidInput: {InputType} = {
      // Data that triggers error condition
    };
    const component = new {Component}({});
    
    // Act
    const result = await component.{method}(invalidInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe({ErrorEnum}.{ERROR_TYPE});
    expect(result.data).toBeUndefined();
    expect(result.metadata).toContainEqual({
      // Expected error metadata
    });
  });`,

  integrationTest: `it('should integrate {Component1} with {Component2} through {Seam}', async () => {
    // Arrange
    const component1 = new {Component1}({});
    const component2 = new {Component2}({});
    
    // Simulate Component1 producing data
    const producedData = await component1.{produceMethod}({
      // Input to trigger production
    });
    
    expect(producedData.success).toBe(true);
    
    // Component2 consumes the produced data
    const consumedResult = await component2.{consumeMethod}({
      data: producedData.data
    });
    
    // Assert successful integration
    expect(consumedResult.success).toBe(true);
    expect(consumedResult.data).toMatchObject({
      // Expected transformation/processing result
    });
  });`,

  contractCompliance: `describe('Contract Compliance for {SeamName}', () => {
    it('should always return ContractResult structure', async () => {
      const component = new {Component}({});
      const result = await component.{method}({});
      
      // Verify ContractResult structure
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result.error).toBeUndefined();
      } else {
        expect(result).toHaveProperty('error');
        expect(result.data).toBeUndefined();
      }
    });
    
    it('should use defined error enums for failures', async () => {
      const component = new {Component}({});
      const result = await component.{method}({ /* invalid data */ });
      
      if (!result.success) {
        expect(Object.values({ErrorEnum})).toContain(result.error);
      }
    });
  });`,
};