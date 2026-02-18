import requests
import sys
import json
from datetime import datetime
import uuid

class EFFITECHAPITester:
    def __init__(self, base_url="https://effitech-dashboard.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status: {response.status_code} (No JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_register_user(self, email, password, full_name):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": email,
                "password": password,
                "full_name": full_name
            }
        )
        
        if success and 'access_token' in response and 'user' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            self.log_test("Registration Token Generation", True, "JWT token received")
            return True, response
        elif success:
            self.log_test("Registration Token Generation", False, "No token in response")
            
        return success, response

    def test_duplicate_registration(self, email, password, full_name):
        """Test duplicate email registration (should fail)"""
        success, response = self.run_test(
            "Duplicate Email Registration (Should Fail)",
            "POST",
            "auth/register",
            400,
            data={
                "email": email,
                "password": password,
                "full_name": full_name
            }
        )
        return success

    def test_login_user(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": email,
                "password": password
            }
        )
        
        if success and 'access_token' in response and 'user' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            self.log_test("Login Token Generation", True, "JWT token received")
            return True, response
        elif success:
            self.log_test("Login Token Generation", False, "No token in response")
            
        return success, response

    def test_invalid_login(self, email, wrong_password):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login Credentials (Should Fail)",
            "POST",
            "auth/login",
            401,
            data={
                "email": email,
                "password": wrong_password
            }
        )
        return success

    def test_get_current_user(self):
        """Test getting current user info (protected route)"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Current User (Protected Route)",
            "GET",
            "auth/me",
            200
        )
        
        if success and 'email' in response and 'full_name' in response:
            self.log_test("User Data Validation", True, f"User: {response.get('full_name')} ({response.get('email')})")
            return True, response
        elif success:
            self.log_test("User Data Validation", False, "Missing user data fields")
            
        return success, response

    def test_protected_route_without_token(self):
        """Test protected route without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Protected Route Without Token (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_password_validation(self):
        """Test password validation (minimum 6 characters)"""
        test_email = f"test_short_pass_{uuid.uuid4().hex[:8]}@effitech.com"
        
        success, response = self.run_test(
            "Short Password Validation",
            "POST",
            "auth/register",
            422,  # Validation error
            data={
                "email": test_email,
                "password": "123",  # Too short
                "full_name": "Test User"
            }
        )
        return success

    def test_invalid_email_format(self):
        """Test invalid email format"""
        success, response = self.run_test(
            "Invalid Email Format",
            "POST",
            "auth/register",
            422,  # Validation error
            data={
                "email": "invalid-email",
                "password": "password123",
                "full_name": "Test User"
            }
        )
        return success

    def run_comprehensive_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting EFFITECH Authentication API Tests")
        print("=" * 60)
        
        # Generate unique test data
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"test_user_{timestamp}@effitech.com"
        test_password = "TestPass123!"
        test_full_name = f"Test User {timestamp}"
        
        # Test 1: API Root
        self.test_api_root()
        
        # Test 2: User Registration
        self.test_register_user(test_email, test_password, test_full_name)
        
        # Test 3: Get Current User (after registration)
        self.test_get_current_user()
        
        # Test 4: Duplicate Registration (should fail)
        self.test_duplicate_registration(test_email, test_password, test_full_name)
        
        # Test 5: Logout and Login
        self.token = None  # Simulate logout
        self.test_login_user(test_email, test_password)
        
        # Test 6: Get Current User (after login)
        self.test_get_current_user()
        
        # Test 7: Invalid Login
        self.test_invalid_login(test_email, "wrong_password")
        
        # Test 8: Protected Route Without Token
        self.test_protected_route_without_token()
        
        # Test 9: Password Validation
        self.test_password_validation()
        
        # Test 10: Email Format Validation
        self.test_invalid_email_format()
        
        # Print Results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = EFFITECHAPITester()
    
    try:
        success = tester.run_comprehensive_tests()
        
        # Save detailed results
        results_data = {
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'failed_tests': tester.tests_run - tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            'detailed_results': tester.test_results,
            'timestamp': datetime.now().isoformat()
        }
        
        with open('/app/test_reports/backend_api_results.json', 'w') as f:
            json.dump(results_data, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())