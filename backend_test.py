import requests
import sys
import json
from datetime import datetime

class CraftVistaAPITester:
    def __init__(self, base_url="https://craftvista.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_categories(self):
        """Test categories endpoint"""
        return self.run_test("Get Categories", "GET", "categories", 200)

    def test_languages(self):
        """Test supported languages endpoint"""
        return self.run_test("Get Languages", "GET", "languages", 200)

    def test_products_marketplace(self):
        """Test marketplace products endpoint"""
        return self.run_test("Get Marketplace Products", "GET", "products", 200)

    def test_google_auth(self):
        """Test Google OAuth mock authentication"""
        auth_data = {"token": "mock_google_token_123"}
        success, response = self.run_test(
            "Google OAuth", 
            "POST", 
            "auth/google", 
            200, 
            data=auth_data
        )
        if success and 'id' in response:
            # For testing purposes, we'll use a mock token
            self.token = "mock_token_123"
            print(f"   🔑 Auth token set for subsequent tests")
        return success, response

    def test_product_upload(self):
        """Test product upload with AI content generation"""
        if not self.token:
            print("⚠️  Skipping product upload - no auth token")
            return False, {}
            
        upload_data = {
            "category": "pottery",
            "description": "Beautiful handmade terracotta pot with traditional designs",
            "materials": ["clay", "natural pigments"],
            "price": 1500
        }
        
        return self.run_test(
            "Product Upload with AI", 
            "POST", 
            "products/upload", 
            200, 
            data=upload_data
        )

    def test_ai_content_generation(self):
        """Test AI content generation workflow"""
        print(f"\n🤖 Testing AI Content Generation...")
        
        # This would test the AI service directly if we had access
        # For now, we'll test the upload endpoint which uses AI internally
        if not self.token:
            print("⚠️  Skipping AI test - no auth token")
            return False, {}
            
        ai_test_data = {
            "category": "textiles",
            "description": "Hand-woven silk saree with traditional motifs",
            "materials": ["silk", "gold thread"]
        }
        
        success, response = self.run_test(
            "AI Content Generation via Upload", 
            "POST", 
            "products/upload", 
            200, 
            data=ai_test_data
        )
        
        if success and 'ai_suggestions' in response:
            print(f"✅ AI Content Generated Successfully")
            ai_content = response['ai_suggestions']
            print(f"   AI Title: {ai_content.get('title', 'N/A')}")
            print(f"   AI Price: ₹{ai_content.get('price_suggestion', 'N/A')}")
            return True, response
        else:
            print(f"❌ AI Content Generation Failed")
            return False, {}

    def test_cors_headers(self):
        """Test CORS configuration"""
        print(f"\n🌐 Testing CORS Headers...")
        try:
            response = requests.options(f"{self.api_url}/health", timeout=5)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            print(f"   CORS Headers: {cors_headers}")
            return True, cors_headers
        except Exception as e:
            print(f"❌ CORS Test Failed: {str(e)}")
            return False, {}

def main():
    print("🚀 Starting CraftVista API Testing...")
    print("=" * 50)
    
    tester = CraftVistaAPITester()
    
    # Basic API Tests
    print("\n📋 BASIC API ENDPOINTS")
    print("-" * 30)
    tester.test_health_check()
    tester.test_categories()
    tester.test_languages()
    tester.test_products_marketplace()
    
    # CORS Test
    tester.test_cors_headers()
    
    # Authentication Tests
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    tester.test_google_auth()
    
    # AI-Powered Features Tests
    print("\n🤖 AI-POWERED FEATURES")
    print("-" * 30)
    tester.test_product_upload()
    tester.test_ai_content_generation()
    
    # Final Results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} test(s) failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())