// Utility function to set admin token for testing
export const setAdminToken = () => {
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4";
  
  localStorage.setItem('authToken', adminToken);
  console.log('Admin token set successfully!');
  console.log('You can now create products.');
  
  // Also set user data
  const userData = {
    _id: "68c3c54faae08d4ea71a0288",
    name: "Admin User",
    phNo: "9876543210",
    isVerified: true,
    isAdmin: true,
    email: "admin@yoraa.com"
  };
  
  localStorage.setItem('userData', JSON.stringify(userData));
  console.log('User data set successfully!');
};

// For browser console usage
if (typeof window !== 'undefined') {
  window.setAdminToken = setAdminToken;
}
