#!/usr/bin/env python3
"""
Mindful Harmony Setup Verification Script
Automatically checks if the project is properly set up and all components are working.
"""

import os
import sys
import time
import subprocess
import requests
import json
from pathlib import Path

def print_status(message, status="info"):
    """Print colored status messages"""
    colors = {
        "info": "\033[94m",      # Blue
        "success": "\033[92m",   # Green
        "warning": "\033[93m",   # Yellow
        "error": "\033[91m",     # Red
        "reset": "\033[0m"       # Reset
    }
    
    symbols = {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌"
    }
    
    print(f"{colors[status]}{symbols[status]} {message}{colors['reset']}")

def check_prerequisites():
    """Check if required software is installed"""
    print_status("Checking prerequisites...", "info")
    
    # Check Python
    try:
        result = subprocess.run(['python', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print_status(f"Python found: {version}", "success")
        else:
            print_status("Python not found", "error")
            return False
    except FileNotFoundError:
        print_status("Python not found", "error")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print_status(f"Node.js found: {version}", "success")
        else:
            print_status("Node.js not found", "error")
            return False
    except FileNotFoundError:
        print_status("Node.js not found", "error")
        return False
    
    return True

def check_project_structure():
    """Check if project has correct structure"""
    print_status("Checking project structure...", "info")
    
    required_files = [
        "backend/app.py",
        "backend/requirements.txt",
        "backend/models/user.py",
        "frontend/package.json",
        "frontend/src/App.js",
        "setup.sh"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print_status(f"Missing files: {', '.join(missing_files)}", "error")
        return False
    
    print_status("Project structure is correct", "success")
    return True

def check_env_files():
    """Check if environment files exist"""
    print_status("Checking environment files...", "info")
    
    env_files = [
        "backend/.env",
        "frontend/.env"
    ]
    
    missing_env = []
    for env_file in env_files:
        if not Path(env_file).exists():
            missing_env.append(env_file)
            # Try to create from example
            example_file = env_file.replace('.env', '.env.example')
            if Path(example_file).exists():
                try:
                    with open(example_file, 'r') as src, open(env_file, 'w') as dst:
                        dst.write(src.read())
                    print_status(f"Created {env_file} from example", "success")
                except Exception as e:
                    print_status(f"Failed to create {env_file}: {e}", "error")
    
    if missing_env:
        print_status(f"Please configure: {', '.join(missing_env)}", "warning")
    else:
        print_status("Environment files exist", "success")
    
    return True

def check_backend_dependencies():
    """Check if backend dependencies are installed"""
    print_status("Checking backend dependencies...", "info")
    
    try:
        # Try to import key packages
        import flask
        import pymongo
        import bcrypt
        print_status("Backend dependencies installed", "success")
        return True
    except ImportError as e:
        print_status(f"Missing backend dependency: {e}", "error")
        print_status("Run: cd backend && pip install -r requirements.txt", "info")
        return False

def test_backend_health():
    """Test if backend is running and healthy"""
    print_status("Testing backend health...", "info")
    
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_status(f"Backend is healthy: {data.get('message', 'OK')}", "success")
            return True
        else:
            print_status(f"Backend returned status code: {response.status_code}", "error")
            return False
    except requests.exceptions.ConnectionError:
        print_status("Backend is not running on localhost:5000", "error")
        print_status("Start backend with: cd backend && python app.py", "info")
        return False
    except Exception as e:
        print_status(f"Backend health check failed: {e}", "error")
        return False

def test_demo_user_login():
    """Test demo user authentication"""
    print_status("Testing demo user login...", "info")
    
    try:
        login_data = {
            "email": "demo@mindfulharmony.com",
            "password": "demo123"
        }
        
        response = requests.post(
            "http://localhost:5000/api/auth/login",
            json=login_data,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            print_status(f"Demo user login successful: {user.get('name', 'Demo User')}", "success")
            print_status(f"Friend Code: {user.get('friend_code', 'DEMO1234')}", "info")
            return True
        else:
            print_status(f"Demo user login failed: {response.status_code}", "error")
            if response.status_code == 401:
                print_status("Check demo user credentials in backend/models/user.py", "info")
            return False
    except Exception as e:
        print_status(f"Demo user login test failed: {e}", "error")
        return False

def test_api_endpoints():
    """Test key API endpoints"""
    print_status("Testing API endpoints...", "info")
    
    # First login to get token
    try:
        login_response = requests.post(
            "http://localhost:5000/api/auth/login",
            json={"email": "demo@mindfulharmony.com", "password": "demo123"},
            timeout=5
        )
        
        if login_response.status_code != 200:
            print_status("Cannot test endpoints - login failed", "error")
            return False
        
        token = login_response.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test endpoints
        endpoints = [
            ("/auth/profile", "GET"),
            ("/mood/history", "GET"),
            ("/journal/entries", "GET"),
            ("/activities/recommend", "GET"),
            ("/social/friends", "GET"),
            ("/music/playlists", "GET"),
        ]
        
        working_endpoints = 0
        for endpoint, method in endpoints:
            try:
                response = requests.get(f"http://localhost:5000/api{endpoint}", headers=headers, timeout=5)
                if response.status_code in [200, 201]:
                    working_endpoints += 1
                    print_status(f"✓ {endpoint}", "success")
                else:
                    print_status(f"✗ {endpoint} ({response.status_code})", "warning")
            except Exception as e:
                print_status(f"✗ {endpoint} (error: {e})", "error")
        
        print_status(f"API endpoints working: {working_endpoints}/{len(endpoints)}", "info")
        return working_endpoints > len(endpoints) // 2
        
    except Exception as e:
        print_status(f"API endpoint testing failed: {e}", "error")
        return False

def check_frontend():
    """Check if frontend is accessible"""
    print_status("Checking frontend...", "info")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print_status("Frontend is accessible", "success")
            return True
        else:
            print_status(f"Frontend returned status code: {response.status_code}", "error")
            return False
    except requests.exceptions.ConnectionError:
        print_status("Frontend is not running on localhost:3000", "error")
        print_status("Start frontend with: cd frontend && npm start", "info")
        return False
    except Exception as e:
        print_status(f"Frontend check failed: {e}", "error")
        return False

def main():
    """Main verification function"""
    print("🎵 Mindful Harmony Setup Verification")
    print("=" * 40)
    
    checks = [
        ("Prerequisites", check_prerequisites),
        ("Project Structure", check_project_structure),
        ("Environment Files", check_env_files),
        ("Backend Dependencies", check_backend_dependencies),
        ("Backend Health", test_backend_health),
        ("Demo User Login", test_demo_user_login),
        ("API Endpoints", test_api_endpoints),
        ("Frontend Access", check_frontend),
    ]
    
    passed = 0
    total = len(checks)
    
    for check_name, check_func in checks:
        print(f"\n--- {check_name} ---")
        try:
            if check_func():
                passed += 1
        except Exception as e:
            print_status(f"Check failed with exception: {e}", "error")
        
        time.sleep(0.5)  # Small delay for readability
    
    print("\n" + "=" * 40)
    print(f"📊 Verification Results: {passed}/{total} checks passed")
    
    if passed == total:
        print_status("🎉 All checks passed! Your setup is ready.", "success")
        print_status("Demo User: demo@mindfulharmony.com / demo123", "info")
    elif passed >= total * 0.7:
        print_status("⚠️  Most checks passed. Minor issues may exist.", "warning")
    else:
        print_status("❌ Multiple issues found. Check the messages above.", "error")
    
    print("\n📋 Next Steps:")
    if passed < total:
        print("1. Fix the failing checks above")
        print("2. Re-run this script to verify fixes")
    print("3. Start both backend and frontend servers")
    print("4. Login with demo user: demo@mindfulharmony.com / demo123")
    print("5. Test all features manually")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 