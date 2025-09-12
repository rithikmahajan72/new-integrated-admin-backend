// Test the sensitive data protection functions
const testEmail = "test.user@example.com";
const testPhone = "9876543210";
const testAddress = {
  street: "123 Main Street",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  landmark: "Near Central Station"
};
const testDateOfBirth = "15/03/1990";

// Masking functions
const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username.length <= 2) return '••••@' + domain;
  return username.charAt(0) + '••••' + username.charAt(username.length - 1) + '@' + domain;
};

const maskPhone = (phone) => {
  if (!phone) return '';
  const phoneStr = phone.toString();
  if (phoneStr.length <= 4) return '••••';
  return phoneStr.slice(0, 2) + '••••' + phoneStr.slice(-2);
};

const maskAddress = (address) => {
  if (!address) return {};
  return {
    street: address.street ? address.street.charAt(0) + '•••••' + address.street.slice(-2) : '',
    city: address.city || '',
    state: address.state || '',
    pincode: address.pincode ? '••••••' : '',
    landmark: address.landmark ? '•••••' : ''
  };
};

const maskDateOfBirth = (date) => {
  if (!date) return '';
  const parts = date.split('/');
  if (parts.length === 3) {
    return '••/' + parts[1] + '/' + parts[2]; // Hide day, show month/year
  }
  return '••/••/••••';
};

// Test the functions
console.log('Original Email:', testEmail);
console.log('Masked Email:', maskEmail(testEmail));

console.log('Original Phone:', testPhone);
console.log('Masked Phone:', maskPhone(testPhone));

console.log('Original Address:', testAddress);
console.log('Masked Address:', maskAddress(testAddress));

console.log('Original DOB:', testDateOfBirth);
console.log('Masked DOB:', maskDateOfBirth(testDateOfBirth));
