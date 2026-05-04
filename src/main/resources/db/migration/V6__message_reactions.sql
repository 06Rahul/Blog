CREATE TABLE message_reactions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    message_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    emoji VARCHAR(8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reaction_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_reaction (message_id, user_id, emoji)
);
