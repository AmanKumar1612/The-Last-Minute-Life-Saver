import uuid
from fastapi.testclient import TestClient
from app.main import app

def test_health():
    """Test health check endpoint."""
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

def test_root():
    """Test root endpoint."""
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["app"] == "The Last-Minute Life Saver"
        assert "version" in response.json()

def test_signup_login_flow():
    """Test user registration, login, and profile retrieval."""
    unique_id = str(uuid.uuid4())[:8]
    test_user = {
        "name": f"Test User {unique_id}",
        "email": f"test_{unique_id}@example.com",
        "password": "strongpassword123",
        "profession": "Developer",
        "productivity_goals": ["Code testing", "Save time"]
    }

    with TestClient(app) as client:
        # 1. Signup
        signup_res = client.post("/auth/signup", json=test_user)
        assert signup_res.status_code == 201
        signup_data = signup_res.json()
        assert "access_token" in signup_data
        assert signup_data["user"]["email"] == test_user["email"]
        assert signup_data["user"]["name"] == test_user["name"]

        # 2. Login
        login_payload = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        login_res = client.post("/auth/login", json=login_payload)
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert "access_token" in login_data
        token = login_data["access_token"]

        # 3. Get profile (authenticated)
        headers = {"Authorization": f"Bearer {token}"}
        me_res = client.get("/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == test_user["email"]
        assert me_data["name"] == test_user["name"]
        assert me_data["profession"] == test_user["profession"]
