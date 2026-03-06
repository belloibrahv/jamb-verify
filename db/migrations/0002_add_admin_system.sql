-- Migration: Add Admin System
-- Created: 2026-03-06
-- Description: Add user roles, support tickets, and admin features

-- 1. Add user role enum and column
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user' NOT NULL;
CREATE INDEX idx_users_role ON users(role);

-- 2. Support Tickets Table
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_issue', 'verification_issue', 'general', 'account_issue', 'technical_issue')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_reference TEXT,
  verification_id TEXT REFERENCES nin_verifications(id),
  assigned_to TEXT REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_created ON support_tickets(created_at DESC);

-- 3. Ticket Messages Table
CREATE TABLE ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE NOT NULL,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_ticket_messages_user ON ticket_messages(user_id);

-- 4. Admin Actions Log
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_user_id TEXT REFERENCES users(id),
  target_resource TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at DESC);

-- 5. Add verification purpose field to nin_verifications
ALTER TABLE nin_verifications ADD COLUMN purpose TEXT CHECK (purpose IN (
  'banking',
  'education_jamb',
  'education_waec',
  'education_neco',
  'education_nysc',
  'passport',
  'drivers_license',
  'employment',
  'telecommunications',
  'government_service',
  'other'
));

CREATE INDEX idx_verifications_purpose ON nin_verifications(purpose);

-- 6. Add suspended flag to users
ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN suspended_reason TEXT;

CREATE INDEX idx_users_suspended ON users(is_suspended);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for support_tickets updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert first super admin (update email as needed)
-- Note: This will be updated via environment variable
-- INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at)
-- VALUES (
--   'admin_' || gen_random_uuid()::text,
--   'System Administrator',
--   'admin@verifynin.ng',
--   '+2340000000000',
--   '$2a$10$placeholder', -- Update with actual hash
--   'super_admin',
--   NOW()
-- ) ON CONFLICT (email) DO NOTHING;

-- 10. Add comments for documentation
COMMENT ON TABLE support_tickets IS 'User support tickets for payment issues, verification problems, etc.';
COMMENT ON TABLE ticket_messages IS 'Messages in support ticket conversations';
COMMENT ON TABLE admin_actions IS 'Audit log of all admin actions for compliance';
COMMENT ON COLUMN users.role IS 'User role: user (default), admin (support staff), super_admin (full access)';
COMMENT ON COLUMN nin_verifications.purpose IS 'Purpose of verification: banking, education, travel, etc.';
