const admin = require('./src/utils/firebaseConfig');

// Method 1: Create a custom token for testing
async function createCustomToken(uid = 'test-user') {
    try {
        const customToken = await admin.auth().createCustomToken(uid);
        console.log('Custom Token:', customToken);
        return customToken;
    } catch (error) {
        console.error('Error creating custom token:', error);
    }
}

// Method 2: Create a user and get their token
async function createTestUser() {
    try {
        // Create a test user
        const userRecord = await admin.auth().createUser({
            uid: 'test-user-' + Date.now(),
            email: 'test@example.com',
            password: 'testpassword123',
            displayName: 'Test User'
        });
        
        console.log('Created user:', userRecord.uid);
        
        // Create custom token for this user
        const customToken = await admin.auth().createCustomToken(userRecord.uid);
        console.log('Custom Token for testing:', customToken);
        
        return { uid: userRecord.uid, customToken };
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

// Method 3: Generate token for existing user
async function getTokenForUser(uid) {
    try {
        const customToken = await admin.auth().createCustomToken(uid);
        console.log(`Custom Token for user ${uid}:`, customToken);
        return customToken;
    } catch (error) {
        console.error('Error getting token for user:', error);
    }
}

// Run the functions
async function main() {
    console.log('=== Firebase Token Generator ===\n');
    
    // Create custom token
    console.log('1. Creating custom token for test user:');
    await createCustomToken();
    
    console.log('\n2. Creating new test user with token:');
    await createTestUser();
    
    console.log('\n=== Instructions ===');
    console.log('1. Copy the Custom Token from above');
    console.log('2. In Postman, add Authorization header:');
    console.log('   Key: Authorization');
    console.log('   Value: Bearer YOUR_CUSTOM_TOKEN_HERE');
    console.log('\nOr use it directly in the firebaseToken field in your request body.');
}

main().catch(console.error);
