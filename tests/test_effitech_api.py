"""
EFFITECH API Tests - Comprehensive Backend Testing
Tests for: Authentication, User Management (Admin), Panel Management (Admin), Role-based Access
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://effitech-dashboard.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials from review request
ADMIN_CREDENTIALS = {"email": "admin@effitech.com", "password": "admin123"}
USER_CREDENTIALS = {"email": "usuario@effitech.com", "password": "user123"}


class TestHealthAndBasics:
    """Basic API health and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{API_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert "EFFITECH" in data.get("message", "")
        print(f"✓ Root endpoint: {data}")


class TestAuthentication:
    """Authentication flow tests - Login and Register"""
    
    def test_admin_login(self):
        """Test admin user login with provided credentials"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']} (role: {data['user']['role']})")
        return data["access_token"]
    
    def test_regular_user_login(self):
        """Test regular user login with provided credentials"""
        response = requests.post(f"{API_URL}/auth/login", json=USER_CREDENTIALS)
        assert response.status_code == 200, f"User login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "user"
        print(f"✓ Regular user login successful: {data['user']['email']} (role: {data['user']['role']})")
        return data["access_token"]
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected with 401")
    
    def test_get_current_user_admin(self):
        """Test getting current user info for admin"""
        # First login
        login_response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_CREDENTIALS["email"]
        assert data["role"] == "admin"
        print(f"✓ Admin user info retrieved: {data['full_name']}")
    
    def test_get_current_user_regular(self):
        """Test getting current user info for regular user"""
        # First login
        login_response = requests.post(f"{API_URL}/auth/login", json=USER_CREDENTIALS)
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == USER_CREDENTIALS["email"]
        assert data["role"] == "user"
        print(f"✓ Regular user info retrieved: {data['full_name']}")


class TestUserManagementAdmin:
    """User management tests - Admin only endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        return response.json()["access_token"]
    
    @pytest.fixture
    def user_token(self):
        """Get regular user authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=USER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("User login failed - skipping user tests")
        return response.json()["access_token"]
    
    def test_list_users_as_admin(self, admin_token):
        """Test listing all users as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/users", headers=headers)
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) >= 2  # At least admin and regular user
        print(f"✓ Admin can list users: {len(users)} users found")
        
        # Verify user structure
        for user in users:
            assert "id" in user
            assert "email" in user
            assert "full_name" in user
            assert "role" in user
            print(f"  - {user['email']} ({user['role']})")
    
    def test_list_users_as_regular_user_forbidden(self, user_token):
        """Test that regular users cannot list all users"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/users", headers=headers)
        assert response.status_code == 403
        print("✓ Regular user correctly forbidden from listing users (403)")
    
    def test_list_users_without_auth(self):
        """Test that unauthenticated requests cannot list users"""
        response = requests.get(f"{API_URL}/users")
        assert response.status_code in [401, 403]
        print(f"✓ Unauthenticated request correctly rejected ({response.status_code})")


class TestPanelManagementAdmin:
    """Panel management tests - Admin CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        return response.json()["access_token"]
    
    @pytest.fixture
    def user_token(self):
        """Get regular user authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=USER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("User login failed - skipping user tests")
        return response.json()["access_token"]
    
    def test_create_panel_as_admin(self, admin_token):
        """Test creating a new panel as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        panel_data = {
            "model": f"TEST_Solar_Panel_{uuid.uuid4().hex[:8]}",
            "location": "Test Location - Building A",
            "capacity": 500.0
        }
        
        response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        assert response.status_code == 200, f"Panel creation failed: {response.text}"
        data = response.json()
        assert data["model"] == panel_data["model"]
        assert data["location"] == panel_data["location"]
        assert data["capacity"] == panel_data["capacity"]
        assert data["status"] == "activo"
        assert data["user_id"] is None  # Not assigned yet
        print(f"✓ Panel created: {data['model']} (ID: {data['id']})")
        return data["id"]
    
    def test_create_panel_as_regular_user_forbidden(self, user_token):
        """Test that regular users cannot create panels"""
        headers = {"Authorization": f"Bearer {user_token}"}
        panel_data = {
            "model": "Unauthorized Panel",
            "location": "Test Location",
            "capacity": 100.0
        }
        
        response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        assert response.status_code == 403
        print("✓ Regular user correctly forbidden from creating panels (403)")
    
    def test_list_panels_as_admin(self, admin_token):
        """Test listing all panels as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/panels", headers=headers)
        assert response.status_code == 200
        panels = response.json()
        assert isinstance(panels, list)
        print(f"✓ Admin can list all panels: {len(panels)} panels found")
        
        for panel in panels:
            assert "id" in panel
            assert "model" in panel
            assert "location" in panel
            assert "capacity" in panel
            assert "status" in panel
    
    def test_list_panels_as_regular_user(self, user_token):
        """Test that regular users only see their assigned panels"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/panels", headers=headers)
        assert response.status_code == 200
        panels = response.json()
        print(f"✓ Regular user can list their panels: {len(panels)} panels")
        
        # Get user ID to verify panels are assigned to them
        me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        user_id = me_response.json()["id"]
        
        # All panels should be assigned to this user (or empty)
        for panel in panels:
            assert panel["user_id"] == user_id, f"Panel {panel['id']} not assigned to user"
        print(f"✓ All {len(panels)} panels correctly belong to the user")
    
    def test_update_panel_as_admin(self, admin_token):
        """Test updating a panel as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First create a panel
        panel_data = {
            "model": f"TEST_Update_Panel_{uuid.uuid4().hex[:8]}",
            "location": "Original Location",
            "capacity": 300.0
        }
        create_response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        panel_id = create_response.json()["id"]
        
        # Update the panel
        update_data = {
            "location": "Updated Location",
            "capacity": 450.0,
            "status": "mantenimiento"
        }
        response = requests.put(f"{API_URL}/panels/{panel_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["location"] == "Updated Location"
        assert data["capacity"] == 450.0
        assert data["status"] == "mantenimiento"
        print(f"✓ Panel updated successfully: {data['model']}")
        
        # Cleanup
        requests.delete(f"{API_URL}/panels/{panel_id}", headers=headers)
    
    def test_delete_panel_as_admin(self, admin_token):
        """Test deleting a panel as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First create a panel
        panel_data = {
            "model": f"TEST_Delete_Panel_{uuid.uuid4().hex[:8]}",
            "location": "To Be Deleted",
            "capacity": 200.0
        }
        create_response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        panel_id = create_response.json()["id"]
        
        # Delete the panel
        response = requests.delete(f"{API_URL}/panels/{panel_id}", headers=headers)
        assert response.status_code == 200
        print(f"✓ Panel deleted successfully")
        
        # Verify deletion
        get_response = requests.get(f"{API_URL}/panels/{panel_id}", headers=headers)
        assert get_response.status_code == 404
        print("✓ Deleted panel returns 404")


class TestPanelAssignment:
    """Panel assignment and unassignment tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def user_info(self):
        """Get regular user info"""
        response = requests.post(f"{API_URL}/auth/login", json=USER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("User login failed")
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        return me_response.json()
    
    def test_assign_panel_to_user(self, admin_token, user_info):
        """Test assigning a panel to a user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a panel
        panel_data = {
            "model": f"TEST_Assign_Panel_{uuid.uuid4().hex[:8]}",
            "location": "Assignment Test",
            "capacity": 350.0
        }
        create_response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        panel_id = create_response.json()["id"]
        user_id = user_info["id"]
        
        # Assign panel to user
        response = requests.post(f"{API_URL}/panels/{panel_id}/assign/{user_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["user_name"] == user_info["full_name"]
        print(f"✓ Panel assigned to user: {user_info['full_name']}")
        
        # Cleanup
        requests.delete(f"{API_URL}/panels/{panel_id}", headers=headers)
    
    def test_unassign_panel_from_user(self, admin_token, user_info):
        """Test unassigning a panel from a user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create and assign a panel
        panel_data = {
            "model": f"TEST_Unassign_Panel_{uuid.uuid4().hex[:8]}",
            "location": "Unassignment Test",
            "capacity": 400.0
        }
        create_response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        panel_id = create_response.json()["id"]
        user_id = user_info["id"]
        
        # Assign first
        requests.post(f"{API_URL}/panels/{panel_id}/assign/{user_id}", headers=headers)
        
        # Unassign
        response = requests.post(f"{API_URL}/panels/{panel_id}/unassign", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] is None
        assert data["user_name"] is None
        print("✓ Panel unassigned successfully")
        
        # Cleanup
        requests.delete(f"{API_URL}/panels/{panel_id}", headers=headers)
    
    def test_assign_panel_to_nonexistent_user(self, admin_token):
        """Test assigning panel to non-existent user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a panel
        panel_data = {
            "model": f"TEST_Invalid_Assign_{uuid.uuid4().hex[:8]}",
            "location": "Invalid Assignment Test",
            "capacity": 250.0
        }
        create_response = requests.post(f"{API_URL}/panels", json=panel_data, headers=headers)
        panel_id = create_response.json()["id"]
        
        # Try to assign to non-existent user
        fake_user_id = str(uuid.uuid4())
        response = requests.post(f"{API_URL}/panels/{panel_id}/assign/{fake_user_id}", headers=headers)
        assert response.status_code == 404
        print("✓ Assignment to non-existent user correctly rejected (404)")
        
        # Cleanup
        requests.delete(f"{API_URL}/panels/{panel_id}", headers=headers)


class TestRoleManagement:
    """Role change tests - Admin only"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_info(self):
        """Get admin user info"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        return me_response.json()
    
    def test_admin_cannot_remove_own_admin_role(self, admin_token, admin_info):
        """Test that admin cannot remove their own admin role"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        admin_id = admin_info["id"]
        
        response = requests.put(f"{API_URL}/users/{admin_id}/role", 
                               json={"role": "user"}, headers=headers)
        assert response.status_code == 400
        print("✓ Admin correctly prevented from removing own admin role (400)")
    
    def test_admin_cannot_delete_self(self, admin_token, admin_info):
        """Test that admin cannot delete themselves"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        admin_id = admin_info["id"]
        
        response = requests.delete(f"{API_URL}/users/{admin_id}", headers=headers)
        assert response.status_code == 400
        print("✓ Admin correctly prevented from deleting self (400)")


class TestCleanup:
    """Cleanup test data created during tests"""
    
    def test_cleanup_test_panels(self):
        """Clean up any TEST_ prefixed panels"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin login failed - cannot cleanup")
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get all panels
        panels_response = requests.get(f"{API_URL}/panels", headers=headers)
        panels = panels_response.json()
        
        # Delete TEST_ prefixed panels
        deleted_count = 0
        for panel in panels:
            if panel["model"].startswith("TEST_"):
                requests.delete(f"{API_URL}/panels/{panel['id']}", headers=headers)
                deleted_count += 1
        
        print(f"✓ Cleanup complete: {deleted_count} test panels deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
