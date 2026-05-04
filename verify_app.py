import requests
import json
import time

BASE_URL = "http://localhost:8080/api"
EMAIL = "you@gmail.com"
USERNAME = "you"
PASSWORD = "password"

def run_test():
    print("Starting API Verification...")
    session = requests.Session()

    # 1. Signup / Login
    print("\n[1] Authentication")
    login_payload = {"email": EMAIL, "password": PASSWORD}
    
    # Try login first
    print(f"Attempting login for {EMAIL}...")
    try:
        r = session.post(f"{BASE_URL}/user/login", json=login_payload)
        if r.status_code == 200:
            print("Login successful.")
            token = r.json().get('accessToken')
        else:
            print(f"Login failed ({r.status_code}). Attempting signup...")
            # Signup payload - sending generic data
            # Note: Signup endpoint expects multipart/form-data with 'data' json string
            signup_data = {
                "email": EMAIL,
                "password": PASSWORD,
                "username": USERNAME,
                "firstName": "You",
                "lastName": "Tester"
            }
            files = {
                'data': (None, json.dumps(signup_data), 'application/json'),
                 # image is optional in service, sending empty if fails? no, let's try without image
            }
            
            # Create a dummy image file content to satisfy the multipart requirement if needed, 
            # but authService.js sends it only if present. The backend might require the part though.
            # Let's try sending just the data first.
            r_signup = session.post(f"{BASE_URL}/user/signup", files=files)
            
            if r_signup.status_code == 200:
               print("Signup successful. Please verify OTP manually if required, or login verify skipped.")
               # For simple test, assume no OTP or proceed to login again
               # If OTP is required, we might be stuck. Actuator doesn't give OTP.
               # Let's hope verified is false but we can login?
               pass
            else:
               print(f"Signup failed: {r_signup.text}")
               return

            # Retry login
            r = session.post(f"{BASE_URL}/user/login", json=login_payload)
            if r.status_code == 200:
                 print("Login successful after signup.")
                 token = r.json().get('accessToken')
            else:
                 print(f"Login failed even after signup: {r.text}")
                 return

    except Exception as e:
        print(f"Connection error: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}
    print("Token acquired.")

    # 2. Create Blog
    print("\n[2] Create Blog")
    blog_payload = {
        "title": "API Test Blog",
        "content": "<p>This is a test blog created via API script.</p>",
        "summary": "API Test Summary",
        "tags": ["test", "api"],
        "categoryId": None # Optional
    }
    
    r_create = session.post(f"{BASE_URL}/blogs", json=blog_payload, headers=headers)
    if r_create.status_code == 200:
        blog = r_create.json()
        blog_id = blog['id']
        print(f"Blog created. ID: {blog_id}, Title: {blog['title']}")
    else:
        print(f"Failed to create blog: {r_create.text}")
        return

    # 3. Publish Blog
    print("\n[3] Publish Blog")
    r_pub = session.put(f"{BASE_URL}/blogs/{blog_id}/publish", headers=headers)
    if r_pub.status_code == 200:
        print("Blog published.")
    else:
        print(f"Failed to publish blog: {r_pub.text}")

    # 4. Get Feed (Verify verification)
    print("\n[4] Verify Feed")
    r_feed = session.get(f"{BASE_URL}/blogs/published", headers=headers)
    if r_feed.status_code == 200:
        feed_content = r_feed.json()['content']
        found = any(b['id'] == blog_id for b in feed_content)
        if found:
            print("Blog found in published feed. SUCCESS.")
        else:
            print("Blog NOT found in published feed (might be pagination or delay).")
    else:
        print(f"Failed to fetch feed: {r_feed.text}")

    # 5. Delete Blog (Cleanup)
    print("\n[5] Delete Blog")
    r_del = session.delete(f"{BASE_URL}/blogs/{blog_id}", headers=headers)
    if r_del.status_code == 204 or r_del.status_code == 200:
        print("Blog deleted.")
    else:
        print(f"Failed to delete blog: {r_del.text}")

    print("\nAPI Verification Complete.")

if __name__ == "__main__":
    run_test()
