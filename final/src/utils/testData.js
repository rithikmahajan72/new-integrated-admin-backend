import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
// Backend-only approach - no client-side Firestore

// Test users data in Firebase format
const testUsers = [
  {
    displayName: 'Rithik Mahajan',
    name: 'Rithik Mahajan',
    email: 'rithikmahajan27@gmail.com',
    phoneNumber: '+917006114695',
    phone: '+917006114695',
    dateOfBirth: '28/August/1998',
    address: 'House NO. 19, new kaleeth nagar, Upper gummat bazar, jammu, 180001',
    username: 'Rithik27',
    gender: 'Male',
    points: 200,
    isBlocked: false,
    reviews: {
      rating: 5,
      text: 'It is a good app'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    displayName: 'Sarah Wilson',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phoneNumber: '+919876543210',
    phone: '+919876543210',
    dateOfBirth: '15/March/1995',
    address: '123 Main Street, New Delhi, 110001',
    username: 'sarah_wilson',
    gender: 'Female',
    points: 150,
    isBlocked: true,
    blockReason: 'Violation of terms of service',
    blockedAt: serverTimestamp(),
    blockedBy: 'admin',
    reviews: {
      rating: 4,
      text: 'Good shopping experience'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    displayName: 'John Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+918765432109',
    phone: '+918765432109',
    dateOfBirth: '10/December/1990',
    address: '456 Oak Avenue, Mumbai, 400001',
    username: 'john_doe_90',
    gender: 'Male',
    points: 75,
    isBlocked: false,
    reviews: {
      rating: 3,
      text: 'Average app'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    displayName: 'Priya Sharma',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phoneNumber: '+917654321098',
    phone: '+917654321098',
    dateOfBirth: '22/July/1992',
    address: '789 Park Road, Bangalore, 560001',
    username: 'priya_sharma',
    gender: 'Female',
    points: 320,
    isBlocked: false,
    reviews: {
      rating: 5,
      text: 'Excellent service and quality'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    displayName: 'Amit Kumar',
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    phoneNumber: '+916543210987',
    phone: '+916543210987',
    dateOfBirth: '5/September/1988',
    address: '321 Garden Street, Chennai, 600001',
    username: 'amit_kumar88',
    gender: 'Male',
    points: 45,
    isBlocked: true,
    blockReason: 'Suspicious activity detected',
    blockedAt: serverTimestamp(),
    blockedBy: 'admin',
    reviews: {
      rating: 2,
      text: 'Not satisfied with the service'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

/**
 * Add test users to Firebase
 * This function is for development/testing purposes only
 */
export const addTestUsers = async () => {
  try {
    console.log('Adding test users to Firebase...');
    
    const usersCollection = collection(db, 'users');
    const addedUsers = [];
    
    for (const user of testUsers) {
      try {
        const docRef = await addDoc(usersCollection, user);
        console.log(`✅ Added user: ${user.name} with ID: ${docRef.id}`);
        addedUsers.push({ id: docRef.id, ...user });
      } catch (error) {
        console.error(`❌ Failed to add user ${user.name}:`, error);
      }
    }
    
    console.log(`🎉 Successfully added ${addedUsers.length} test users to Firebase`);
    return addedUsers;
  } catch (error) {
    console.error('❌ Error adding test users:', error);
    throw new Error(`Failed to add test users: ${error.message}`);
  }
};

/**
 * Check if test users already exist
 */
export const checkTestUsersExist = async () => {
  try {
    // This is a simple check - in a real app you'd want more sophisticated logic
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking test users:', error);
    return false;
  }
};

/**
 * Initialize test data if needed
 * Call this during development to populate Firebase with test data
 */
export const initializeTestData = async () => {
  try {
    const usersExist = await checkTestUsersExist();
    
    if (!usersExist) {
      console.log('No users found in Firebase. Adding test data...');
      await addTestUsers();
    } else {
      console.log('Users already exist in Firebase. Skipping test data initialization.');
    }
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
};

export default {
  addTestUsers,
  checkTestUsersExist,
  initializeTestData,
  testUsers
};
