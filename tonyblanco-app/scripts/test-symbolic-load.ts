#!/usr/bin/env tsx
/**
 * Test script to verify @holistica/symbolic module loads correctly
 * Tests basic import and execution of Pitagoras method
 * 
 * Run with: npx tsx scripts/test-symbolic-load.ts
 */

async function runTest() {
  console.log('======================================');
  console.log('Testing @holistica/symbolic Module Load');
  console.log('======================================\n');

  try {
    console.log('Step 1: Importing module...');
    const { ejecutarMetodoPitagorico } = await import('@holistica/symbolic/methods/pitagoras');
    console.log('✅ Import successful\n');

    console.log('Step 2: Executing method with test data...');
    const testInput = {
      nombreCompleto: 'Test User',
      fechaNacimiento: { dia: 1, mes: 1, anio: 2000 }
    };
    
    console.log('Test input:', JSON.stringify(testInput, null, 2));
    
    const result = ejecutarMetodoPitagorico(testInput);
    console.log('✅ Execution successful\n');

    console.log('Step 3: Validating result...');
    if (!result) {
      console.error('❌ Failed: Method returned null/undefined');
      process.exit(1);
    }

    // Basic structure validation (updated to match actual structure)
    const hasRequiredFields = 
      result.methodId !== undefined &&
      result.primaryNumbers !== undefined &&
      Array.isArray(result.primaryNumbers) &&
      result.primaryNumbers.length > 0;

    if (!hasRequiredFields) {
      console.error('❌ Failed: Result missing required fields');
      console.error('Result:', JSON.stringify(result, null, 2));
      process.exit(1);
    }

    console.log('✅ Result structure valid\n');

    console.log('Result summary:');
    console.log(`  - Method ID: ${result.methodId}`);
    console.log(`  - Method Name: ${result.methodName}`);
    console.log(`  - Primary Numbers: ${result.primaryNumbers.length}`);
    result.primaryNumbers.forEach((num: any) => {
      console.log(`    · ${num.label}: ${num.value} (${num.meaning?.titulo || 'N/A'})`);
    });
    console.log('\n✅ All tests passed!');
    console.log('======================================\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    console.error('\nStack trace:');
    console.error((error as Error).stack);
    console.error('\n======================================\n');
    process.exit(1);
  }
}

runTest();
