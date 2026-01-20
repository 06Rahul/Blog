# 🚀 Getting Started with Messaging - Step by Step

## Prerequisites
- Java 17+ and Maven installed
- Node.js and npm installed
- MySQL running with `user_service` database
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173`

---

## Step 1: Backend Setup

### 1.1 Build Backend
```bash
cd e:\UserService
mvn clean install
```

### 1.2 Verify Dependencies
Check that `pom.xml` has WebSocket starter (should be added):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 1.3 Start Backend
```bash
# Option 1: Maven
mvn spring-boot:run

# Option 2: Run from IDE
# Right-click UserServiceApplication.java → Run
```

**Expected output:**
```
Started UserServiceApplication in X seconds (JVM running for Y.ABC seconds)
```

### 1.4 Verify Backend is Running
- Open browser: `http://localhost:8080/swagger-ui.html` (if available)
- Or check: `http://localhost:8080/api/meta/categories`

---

## Step 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd e:\UserService\frontend
npm install
```

This will install the new WebSocket dependencies:
- `stompjs` - STOMP protocol client
- `sockjs-client` - WebSocket fallback

### 2.2 Start Frontend Dev Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 2.3 Verify Frontend is Running
- Open browser: `http://localhost:5173`
- You should see the homepage

---

## Step 3: Test Messaging Feature

### 3.1 Create Two Test Users

**User 1:**
1. Go to `http://localhost:5173/signup`
2. Create account: 
   - Email: `user1@test.com`
   - Username: `user1`
   - Password: `Test@123`
3. Verify email with OTP
4. Complete signup

**User 2:**
1. Open new incognito window
2. Go to `http://localhost:5173/signup`
3. Create account:
   - Email: `user2@test.com`
   - Username: `user2`
   - Password: `Test@123`
4. Verify email and complete signup

### 3.2 Make Users Follow Each Other

**User 1's window:**
1. Search for `user2` profile
2. Click follow button
3. Go to `http://localhost:5173/messages` (or click Messages in navbar)

**User 2's window:**
1. Search for `user1` profile
2. Click follow button

### 3.3 Test Messaging

**User 1's window:**
1. Should see "Start a conversation" or go to `/messages`
2. Click on user2 to open chat
3. Type a message: "Hello from User 1!"
4. Send message

**User 2's window:**
1. Go to `/messages`
2. Should see User 1 in conversation list
3. Click to open conversation
4. Message from User 1 should appear in real-time
5. Type reply: "Hi User 1!"
6. Send message

**Both windows:**
- Messages should appear in real-time
- Typing indicator should show when the other person types
- Unread badge should appear on conversation in list

---

## Step 4: Test Advanced Features

### 4.1 Typing Indicator
1. In User 1's chat window, start typing but don't send
2. In User 2's window, should see animation: "Someone is typing..."
3. Stop typing → animation disappears

### 4.2 Unread Count
1. In User 1's window, send multiple messages
2. In User 2's chat list, should see red badge with count

### 4.3 Delete Message
1. User 1 sends a message
2. Hover over message → trash icon appears
3. Click to delete
4. Message disappears

### 4.4 Archive Conversation
1. In chat list, hover over conversation
2. Trash icon appears
3. Click to archive
4. Conversation disappears from list
5. Unread count resets

### 4.5 Load Message History
1. Open a conversation with many messages
2. Scroll to top of chat
3. "Load more messages" button appears
4. Click to load older messages

---

## Step 5: Integrate into UI

### 5.1 Add Message Button to Navbar
Edit `frontend/src/components/layout/Navbar.jsx`:
```jsx
import { Link } from 'react-router-dom';

// Add to navbar links
<Link to="/messages" className="hover:text-blue-500">
  📧 Messages
</Link>
```

### 5.2 Add Message Button to User Profile
Edit `frontend/src/pages/UserProfile.jsx`:
```jsx
import { MessageButton } from '../components/messaging/MessageButton';

// In profile render, add:
<MessageButton userId={userProfile.id} className="mt-2" />
```

### 5.3 Rebuild Frontend
```bash
npm run dev
```

---

## Step 6: Troubleshooting

### Issue: WebSocket Connection Failed

**Symptoms:**
- Console error: "WebSocket connection failed"
- No real-time message delivery

**Solutions:**
1. Verify backend is running: `http://localhost:8080/api/meta/categories`
2. Check browser console for errors: Press `F12` → Console tab
3. Verify WebSocket endpoint: Should be `http://localhost:8080/ws/chat`
4. Check CORS settings in backend

### Issue: Messages Not Appearing

**Symptoms:**
- Send message, nothing happens
- Error in console

**Solutions:**
1. Check JWT token: Open DevTools → Application tab → Cookies
2. Verify you're in the same conversation
3. Check network tab: `POST /api/messages/conversation/{id}`
4. Check backend logs for errors

### Issue: Can't Start Conversation

**Symptoms:**
- "Failed to start conversation" error
- Or "Must be following error"

**Solutions:**
1. Verify both users follow each other
2. Check that both users are authenticated
3. Check backend logs: `POST /api/conversations/with/{userId}`

### Issue: Typing Indicator Not Working

**Symptoms:**
- Don't see "Someone is typing..."

**Solutions:**
1. Verify WebSocket is connected
2. Check network → WS tab for WebSocket messages
3. Try refreshing the page
4. Check browser console for JavaScript errors

### Issue: Messages Not Updating Automatically

**Symptoms:**
- Have to refresh to see new messages
- No real-time updates

**Solutions:**
1. Verify WebSocket subscription: Network → WS → Messages
2. Check backend WebSocket logs
3. Verify both users are in same conversation ID
4. Try hard refresh: `Ctrl+Shift+R`

---

## Step 7: Test with API Client (Postman/Insomnia)

### 7.1 Get JWT Token

**Login endpoint:**
```
POST http://localhost:8080/api/user/login
Content-Type: application/json

{
  "email": "user1@test.com",
  "password": "Test@123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  ...
}
```

### 7.2 Get Conversations

```
GET http://localhost:8080/api/conversations
Authorization: Bearer {accessToken}
```

### 7.3 Send Message

```
POST http://localhost:8080/api/messages/conversation/{conversationId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Test message via API",
  "messageType": "TEXT"
}
```

### 7.4 Mark as Read

```
PUT http://localhost:8080/api/messages/conversation/{conversationId}/read-all
Authorization: Bearer {accessToken}
```

---

## Step 8: Monitor in Real-Time

### 8.1 Backend Logs
Watch the backend logs for:
```
- User connected to WebSocket
- Message saved to database
- Message broadcasted to subscribers
```

### 8.2 Browser DevTools
1. Open DevTools: `F12`
2. Go to **Console** tab: Watch for errors/logs
3. Go to **Network** tab → **WS**: Watch WebSocket traffic
4. Go to **Application** → **Storage**: Check JWT token

### 8.3 Database
Check messages in database:
```sql
-- Connect to user_service database
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
SELECT * FROM conversations;
```

---

## Step 9: Features Checklist

Test each feature:

- [ ] User 1 can create/start conversation with User 2
- [ ] Message appears in User 2's chat (real-time)
- [ ] User 2 can reply
- [ ] Reply appears in User 1's chat (real-time)
- [ ] Typing indicator shows when typing
- [ ] Typing indicator hides after 3 seconds
- [ ] Unread count badge shows
- [ ] Messages load on scroll
- [ ] Can delete own messages
- [ ] Can archive conversation
- [ ] Conversation list shows last message preview
- [ ] Dark mode works with chat
- [ ] Mobile responsive layout works
- [ ] Navbar shows unread count (when integrated)

---

## Step 10: Performance Testing

### 10.1 Send Multiple Messages
1. User 1 sends 10 messages rapidly
2. Verify all appear in User 2's window
3. Check no messages are duplicated

### 10.2 Long Conversation
1. Send 100+ messages
2. Load more messages
3. Verify pagination works
4. No lag or performance issues

### 10.3 WebSocket Stability
1. Keep chat window open for 1 hour
2. Send message after 30 minutes
3. Should still work without reconnecting

---

## Common Ports to Remember

- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173`
- **WebSocket**: `ws://localhost:8080/ws/chat`
- **MySQL**: `localhost:3306`

---

## Next Steps

1. ✅ Test all features above
2. ✅ Integrate into navigation
3. ✅ Add to user profiles
4. ✅ Customize styling
5. ✅ Deploy to production

---

## Support

If issues persist:
1. Check [MESSAGING_IMPLEMENTATION.md](MESSAGING_IMPLEMENTATION.md) for detailed docs
2. Check backend logs: `tail -f logs/application.log`
3. Check browser console: `F12 → Console`
4. Check network tab: `F12 → Network → WS`

---

## 🎉 You're All Set!

The messaging system is now ready to use. Follow the steps above, and you should have a fully functional real-time messaging system.

For more details, refer to:
- [MESSAGING_IMPLEMENTATION.md](MESSAGING_IMPLEMENTATION.md) - Complete implementation guide
- [MESSAGING_QUICK_START.md](MESSAGING_QUICK_START.md) - Quick reference

Happy messaging! 💬

