// Web-to-App SSO Port Validation and Open Redirect Mitigation Verification Test Script
// Executed by Challenger agent

const isValidPort = (port) => {
  if (!port) return false;
  return /^\d+$/.test(port) && parseInt(port) >= 1 && parseInt(port) <= 65535;
};

const getRedirectURL = (port, token) => {
  if (!isValidPort(port)) {
    throw new Error("Invalid port");
  }
  return `http://localhost:${port}/callback?token=${token}`;
};

const testCases = [
  // 1. Valid Ports
  { input: "80", expected: true, label: "Standard HTTP port" },
  { input: "8080", expected: true, label: "Common alt port" },
  { input: "65535", expected: true, label: "Max boundary port" },
  { input: "1", expected: true, label: "Min boundary port" },
  { input: "3000", expected: true, label: "Node.js default port" },
  { input: "080", expected: true, label: "Leading zero port (equivalent to 80)" },

  // 2. Invalid Ports
  { input: "0", expected: false, label: "Out of range (0)" },
  { input: "65536", expected: false, label: "Out of range (65536)" },
  { input: "-80", expected: false, label: "Negative number" },
  { input: "80a", expected: false, label: "Trailing alphanumeric character" },
  { input: "80@attacker.com", expected: false, label: "Authority/Userinfo spoofing attempt" },
  { input: "abc", expected: false, label: "Non-numeric string" },
  { input: "", expected: false, label: "Empty string" },
  { input: null, expected: false, label: "Null value" },
  { input: undefined, expected: false, label: "Undefined value" },
  { input: " 80", expected: false, label: "Leading whitespace" },
  { input: "80 ", expected: false, label: "Trailing whitespace" },
  { input: "80.5", expected: false, label: "Floating point number" },
  { input: "999999999999999999", expected: false, label: "Integer overflow" },
  { input: "0x50", expected: false, label: "Hexadecimal format" },
  { input: "1e3", expected: false, label: "Scientific notation" },
  { input: "localhost", expected: false, label: "Host instead of port" },
  { input: "80/../attacker", expected: false, label: "Path traversal attempt" },
];

console.log("=== Running SSO Port Check Verification ===");
let passedCount = 0;
let failedCount = 0;

for (const tc of testCases) {
  const result = isValidPort(tc.input);
  const status = result === tc.expected ? "PASS" : "FAIL";
  
  if (status === "PASS") {
    passedCount++;
  } else {
    failedCount++;
  }
  
  console.log(`[${status}] Input: "${tc.input}" (${tc.label}) -> Got: ${result}, Expected: ${tc.expected}`);
}

console.log("\n=== Running Open Redirect / Token Leakage Verification ===");
let redirectPassed = 0;
let redirectFailed = 0;

const mockToken = "mockCustomToken123456";

for (const tc of testCases) {
  if (tc.expected) {
    // Valid port: verify constructed URL properties
    try {
      const urlStr = getRedirectURL(tc.input, mockToken);
      const urlObj = new URL(urlStr);
      
      const isHostLocalhost = urlObj.hostname === "localhost";
      const isPortCorrect = urlObj.port === String(parseInt(tc.input));
      const isPathCorrect = urlObj.pathname === "/callback";
      const isTokenPresent = urlObj.searchParams.get("token") === mockToken;
      
      if (isHostLocalhost && isPortCorrect && isPathCorrect && isTokenPresent) {
        console.log(`[PASS] Valid port "${tc.input}" redirect URL: "${urlStr}" is safe and correct.`);
        redirectPassed++;
      } else {
        console.log(`[FAIL] Valid port "${tc.input}" redirect URL check failed. Host: ${urlObj.hostname}, Port: ${urlObj.port}`);
        redirectFailed++;
      }
    } catch (e) {
      console.log(`[FAIL] Unexpected error generating URL for valid port "${tc.input}":`, e.message);
      redirectFailed++;
    }
  } else {
    // Invalid port: verify it throws error and doesn't generate redirect URL
    try {
      getRedirectURL(tc.input, mockToken);
      console.log(`[FAIL] Invalid port "${tc.input}" did not throw an error and generated a URL!`);
      redirectFailed++;
    } catch (e) {
      if (e.message === "Invalid port") {
        console.log(`[PASS] Invalid port "${tc.input}" correctly rejected from URL generation.`);
        redirectPassed++;
      } else {
        console.log(`[FAIL] Unexpected error message for invalid port "${tc.input}":`, e.message);
        redirectFailed++;
      }
    }
  }
}

console.log(`\n=== Verification Summary ===`);
console.log(`Port Validation: ${passedCount} passed, ${failedCount} failed.`);
console.log(`URL Safety:      ${redirectPassed} passed, ${redirectFailed} failed.`);

if (failedCount > 0 || redirectFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
