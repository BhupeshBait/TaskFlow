#!/usr/bin/env python
"""
Simple test script to verify backend setup and API connectivity
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Test that all required packages are installed"""
    print("Testing imports...")
    try:
        import flask
        print("  ✓ Flask installed")
        import sqlalchemy
        print("  ✓ SQLAlchemy installed")
        import pymysql
        print("  ✓ PyMySQL installed")
        import flask_cors
        print("  ✓ Flask-CORS installed")
        import flask_jwt_extended
        print("  ✓ Flask-JWT-Extended installed")
        import marshmallow
        print("  ✓ Marshmallow installed")
        return True
    except ImportError as e:
        print(f"  ✗ Missing import: {e}")
        return False

def test_config():
    """Test that config loads properly"""
    print("\nTesting configuration...")
    try:
        from config import Config
        print(f"  ✓ Config loaded")
        print(f"  - Database: {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
        print(f"  - User: {Config.DB_USER}")
        print(f"  - Frontend URL: {Config.FRONTEND_URL}")
        return True
    except Exception as e:
        print(f"  ✗ Config error: {e}")
        return False

def test_database():
    """Test database connection"""
    print("\nTesting database connection...")
    try:
        from config import Config
        import pymysql
        
        connection = pymysql.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASS,
            database=Config.DB_NAME,
            port=int(Config.DB_PORT)
        )
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        connection.close()
        print("  ✓ Database connection successful")
        return True
    except Exception as e:
        print(f"  ✗ Database connection failed: {e}")
        print(f"\n  Make sure:")
        print(f"    1. MySQL is running")
        print(f"    2. Database '{Config.DB_NAME}' exists")
        print(f"    3. User '{Config.DB_USER}' has correct password")
        print(f"\n  To create database manually:")
        print(f"    mysql -u root -p")
        print(f"    > CREATE DATABASE {Config.DB_NAME};")
        print(f"    > CREATE USER '{Config.DB_USER}'@'localhost' IDENTIFIED BY '{Config.DB_PASS}';")
        print(f"    > GRANT ALL PRIVILEGES ON {Config.DB_NAME}.* TO '{Config.DB_USER}'@'localhost';")
        print(f"    > FLUSH PRIVILEGES;")
        return False

def test_models():
    """Test that models load properly"""
    print("\nTesting models...")
    try:
        from models import TaskList, Task, Tag, UserStats, TaskTemplate
        print("  ✓ All models imported successfully")
        return True
    except Exception as e:
        print(f"  ✗ Model import error: {e}")
        return False

def test_extensions():
    """Test that extensions initialize properly"""
    print("\nTesting extensions...")
    try:
        from extensions import db, migrate, ma, cors, jwt, limiter
        print("  ✓ All extensions initialized successfully")
        return True
    except Exception as e:
        print(f"  ✗ Extension error: {e}")
        return False

def test_app_creation():
    """Test that Flask app can be created"""
    print("\nTesting app creation...")
    try:
        from app import create_app
        app = create_app()
        print("  ✓ Flask app created successfully")
        
        # Test routes are registered
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        api_routes = [r for r in rules if r.startswith('/api')]
        print(f"  ✓ {len(api_routes)} API routes registered")
        
        for route in sorted(api_routes)[:5]:
            print(f"    - {route}")
        
        return True
    except Exception as e:
        print(f"  ✗ App creation error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("TaskFlow Backend - Setup Verification")
    print("=" * 60)
    
    tests = [
        ("Python Imports", test_imports),
        ("Configuration", test_config),
        ("Database Connection", test_database),
        ("Models", test_models),
        ("Extensions", test_extensions),
        ("Flask App", test_app_creation),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            results.append((test_name, test_func()))
        except Exception as e:
            print(f"\n✗ Unexpected error in {test_name}: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status:8} - {test_name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All checks passed! You can start the server with: python app.py")
    else:
        print("\n✗ Some checks failed. Please fix the issues above.")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
