// Quick test to verify fcmService exports
import fcmServiceDefault from '../src/services/fcmService.js';
import { fcmService } from '../src/services/fcmService.js';
import { requestPermission, setupFCM } from '../src/services/fcmService.js';

console.log('Default export:', fcmServiceDefault);
console.log('Named export fcmService:', fcmService);
console.log('Are they the same?', fcmServiceDefault === fcmService);
console.log('requestPermission function:', typeof requestPermission);
console.log('setupFCM function:', typeof setupFCM);

export default null; // Just to make this a valid ES module
