# Messaging System Implementation Guide

## Overview
A complete real-time messaging system has been implemented for the Blog Platform, allowing authenticated users to communicate with each other through WebSocket-enabled chat functionality.

---

## 🎯 Features Implemented

### Backend Features (Spring Boot)

1. **Conversation Management**
   - Get or create conversations between two users
   - Retrieve all conversations for a user (with pagination)
   - Get active conversations only
   - Delete/Archive conversations
   - Soft delete implementation (conversations remain in DB marked as inactive)

2. **Message Management**
   - Send messages with support for text, images, files, audio, and video
   - Retrieve message history with pagination
   - Mark individual messages as read
   - Mark all messages in conversation as read
   - Get unread count for conversations
   - Get total unread messages for user
   - Delete messages (sender only)

3. **Real-Time Messaging via WebSocket**
   - STOMP over WebSocket protocol
   - Automatic message broadcasting to conversation subscribers
   - Typing indicators (real-time typing notifications)
   - Automatic message persistence before broadcasting

4. **Access Control**
   - Users can only access their own conversations
   - Ownership verification for message deletion
   - Conversation participant verification

### Frontend Features (React)

1. **Components**
   - **ChatList**: Display all conversations with last message preview, unread counts, and user avatars
   - **ChatWindow**: Full-featured chat interface with message history, typing indicators, and real-time updates
   - **MessageButton**: Quick access button to start conversations (can be added to user profiles)
   - **MessagingPage**: Main messaging page with responsive layout for mobile and desktop

2. **Services**
   - **conversationService**: REST API calls for conversation management
   - **messageService**: REST API calls for message management
   - **webSocketService**: WebSocket connection management and message broadcasting

3. **Features**
   - Real-time message delivery and receiving
   - Typing indicators showing when users are typing
   - Load more messages (pagination)
   - Delete own messages
   - Delete/Archive conversations
   - Responsive design (mobile-first)
   - Dark mode support
   - Unread message counter
   - Automatic scroll to bottom on new messages

---

## 📚 Database Schema

### Conversation Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user1_id UUID NOT NULL,
    user2_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY idx_user1_user2 (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);
```

### Message Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    media_url VARCHAR(500),
    message_type VARCHAR(50) DEFAULT 'TEXT',
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

---

## 🔌 API Endpoints

### Conversation Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/conversations/with/{userId}` | Get or create conversation | ✅ |
| GET | `/api/conversations` | Get all conversations (paginated) | ✅ |
| GET | `/api/conversations/active` | Get active conversations | ✅ |
| DELETE | `/api/conversations/{conversationId}` | Delete/Archive conversation | ✅ |

### Message Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/messages/conversation/{conversationId}` | Send message | ✅ |
| GET | `/api/messages/conversation/{conversationId}` | Get messages (paginated) | ✅ |
| PUT | `/api/messages/{messageId}/read` | Mark as read | ✅ |
| PUT | `/api/messages/conversation/{conversationId}/read-all` | Mark all as read | ✅ |
| GET | `/api/messages/conversation/{conversationId}/unread-count` | Get unread count | ✅ |
| GET | `/api/messages/unread-count` | Get total unread | ✅ |
| DELETE | `/api/messages/{messageId}` | Delete message | ✅ |

### WebSocket Endpoints
| Endpoint | Direction | Purpose |
|----------|-----------|---------|
| `/ws/chat` | Client connects | WebSocket connection point |
| `/app/chat/{conversationId}` | Client → Server | Send message to conversation |
| `/topic/conversation/{conversationId}` | Server → Client | Receive messages from conversation |
| `/app/typing/{conversationId}/{userId}` | Client → Server | Notify typing |
| `/app/stop-typing/{conversationId}/{userId}` | Client → Server | Notify stop typing |
| `/topic/typing/{conversationId}` | Server → Client | Receive typing indicators |

---

## 🚀 How to Use

### Backend Setup

1. **Ensure Dependencies are installed** - WebSocket starter was added to `pom.xml`
2. **Run database migrations** - Entities will auto-create tables
3. **Start Spring Boot application** - Run `UserServiceApplication.main()`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Update environment** - WebSocket is configured to connect to `http://localhost:8080/ws/chat`

3. **Add routes to navigation** - Consider adding messaging link to navbar
   ```jsx
   <Link to="/messages">Messages</Link>
   ```

4. **Add message button to profiles**
   ```jsx
   import { MessageButton } from './components/messaging/MessageButton';
   
   // In user profile component
   <MessageButton userId={userId} />
   ```

---

## 📋 Entity Models

### Conversation.java
- `id`: UUID (Primary Key)
- `user1`: User (Many-to-One)
- `user2`: User (Many-to-One)
- `messages`: List of Message (One-to-Many)
- `createdAt`: LocalDateTime
- `updatedAt`: LocalDateTime
- `lastMessageAt`: LocalDateTime
- `isActive`: Boolean

Methods:
- `getOtherUser(User currentUser)`: Get the other participant
- `hasUser(User user)`: Check if user is in conversation

### Message.java
- `id`: UUID (Primary Key)
- `conversation`: Conversation (Many-to-One)
- `sender`: User (Many-to-One)
- `content`: String (LONGTEXT)
- `createdAt`: LocalDateTime
- `isRead`: Boolean
- `mediaUrl`: String (Optional)
- `messageType`: MessageType enum

### MessageType.java
Enum values: `TEXT`, `IMAGE`, `FILE`, `AUDIO`, `VIDEO`

---

## 🔐 Security

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Users can only access their own conversations and messages
3. **Ownership Verification**: Message deletion only allowed by sender
4. **CORS Configuration**: Configured for localhost:5173 (React dev server)
5. **WebSocket Security**: Connections authenticated via JWT token

---

## 🎨 Frontend Components

### ChatList Component
**Purpose**: Display all conversations in a sidebar/panel
**Props**: None (uses query hooks internally)
**Features**:
- Displays conversations sorted by last message time
- Shows unread badge
- Delete conversation button
- Click to open conversation

**Usage**:
```jsx
import { ChatList } from './components/messaging/ChatList';

<ChatList />
```

### ChatWindow Component
**Purpose**: Display messages and input for a conversation
**Props**: Uses `conversationId` from URL params
**Features**:
- Real-time message updates via WebSocket
- Typing indicators
- Load more messages (pagination)
- Delete message functionality
- Message timestamps
- User avatars and names

**Usage**:
```jsx
import { ChatWindow } from './components/messaging/ChatWindow';

<ChatWindow />
```

### MessageButton Component
**Purpose**: Quick action button to start chat
**Props**:
- `userId`: UUID of user to chat with
- `className`: Additional CSS classes

**Usage**:
```jsx
import { MessageButton } from './components/messaging/MessageButton';

<MessageButton userId={userId} className="mt-4" />
```

### MessagingPage Component
**Purpose**: Main page for messaging
**Features**:
- Responsive layout (side-by-side on desktop, stacked on mobile)
- Shows chat list on left, messages on right
- Placeholder when no conversation selected

**Usage**:
```jsx
// In router
<Route path="/messages" element={<MessagingPage />} />
<Route path="/messages/:conversationId" element={<MessagingPage />} />
```

---

## 🔗 Integration with User Profiles

To add messaging capability to user profiles:

1. **Import MessageButton**
   ```jsx
   import { MessageButton } from './components/messaging/MessageButton';
   ```

2. **Add to profile component**
   ```jsx
   <MessageButton userId={profileUser.id} />
   ```

3. **Update Profile.jsx or UserProfile.jsx**
   ```jsx
   <div className="flex gap-2">
     <FollowButton userId={userId} />
     <MessageButton userId={userId} />
   </div>
   ```

---

## 📊 Data Flow

### Sending a Message Flow
```
User types message → Input validation → WebSocket sends message
  → Backend saves to DB → Broadcasts to subscribers
  → All conversation members receive message → UI updates
```

### Receiving Messages Flow
```
Other user sends message → WebSocket broadcast
  → Frontend receives via subscription
  → Message added to state
  → UI updates in real-time
  → Auto-scroll to new message
```

### Typing Indicator Flow
```
User starts typing → Send typing event to WebSocket
  → Broadcast to conversation members
  → Other users see typing animation
  → User stops typing → Send stop-typing event
  → Typing animation disappears
```

---

## ⚙️ Configuration

### Backend (WebSocketConfig.java)
```java
- STOMP broker: /topic, /queue
- App destination prefix: /app
- WebSocket endpoint: /ws/chat
- Allowed origins: localhost:5173, localhost:3000
- SockJS enabled: Yes
```

### Frontend (messagingService.js)
```javascript
- WebSocket URL: http://localhost:8080/ws/chat
- Message per page: 50
- Conversations per page: 20
```

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
**Problem**: WebSocket connection fails
**Solution**: 
- Ensure backend is running on port 8080
- Check CORS configuration in WebSocketConfig.java
- Verify WebSocket endpoint is accessible: `http://localhost:8080/ws/chat`

### Messages Not Appearing
**Problem**: Sent messages don't appear
**Solution**:
- Check browser console for errors
- Verify conversation ID is correct
- Ensure user is authenticated (JWT token in headers)
- Check database for message records

### Typing Indicator Not Working
**Problem**: Typing indicator doesn't show
**Solution**:
- Check WebSocket subscription is active
- Verify typing event is being sent
- Check browser console for errors

### Unread Count Not Updating
**Problem**: Unread count doesn't reflect new messages
**Solution**:
- Ensure `markConversationAsRead` is called when opening chat
- Check database for isRead flag on messages
- Verify query is counting correctly

---

## 📈 Performance Considerations

1. **Message Pagination**: Implemented to avoid loading all messages at once
2. **Lazy Loading**: Messages loaded on demand
3. **Index Optimization**: Indexes on `conversation_id`, `sender_id`, and `created_at`
4. **WebSocket Efficiency**: Only subscribers receive messages (no broadcast overhead)
5. **Database Optimization**: Soft delete for conversations preserves data

---

## 🔄 Future Enhancements

1. **Message Reactions**: Add emoji reactions to messages
2. **Message Editing**: Allow users to edit sent messages
3. **File Sharing**: Implement media upload/download
4. **Group Chats**: Extend to support group conversations
5. **Voice/Video Calls**: Integrate WebRTC for calls
6. **Search Messages**: Full-text search in conversations
7. **Message Encryption**: End-to-end encryption
8. **Read Receipts**: Show when messages are read with timestamps
9. **Message Pinning**: Pin important messages
10. **Spam Detection**: AI-based spam detection

---

## 📝 Notes

- Messaging is available only to authenticated users
- Users can only chat after following each other (can be modified in `ConversationServiceImpl.canChat()`)
- Conversations are soft-deleted (archived) for data integrity
- All timestamps are in server timezone
- WebSocket uses SockJS fallback for better browser compatibility

---

## 🤝 Support

For issues or questions about the messaging system, check:
1. Browser console for JavaScript errors
2. Backend logs for server errors
3. Network tab for WebSocket connection status
4. Database for data integrity

