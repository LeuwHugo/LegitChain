/*
  # Initial Schema Setup for Legit Check Web

  1. New Tables
    - `profiles` - Stores user profile information
    - `verifications` - Stores product verification records
    - `marketplace` - Stores products listed for sale
    - `verification_votes` - Stores consensus votes on verifications
    - `staking` - Records of token staking transactions

  2. Security
    - Enable RLS for all tables
    - Add policies for secure data access
    - Default settings for timestamps and IDs
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users NOT NULL,
  username text UNIQUE NOT NULL,
  email text UNIQUE,
  wallet_address text UNIQUE,
  reputation integer DEFAULT 0 NOT NULL,
  tokens_balance integer DEFAULT 0 NOT NULL,
  verification_count integer DEFAULT 0 NOT NULL,
  is_verifier boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  category text NOT NULL,
  description text,
  purchase_price numeric(10, 2),
  purchase_date date,
  serial_number text,
  is_authentic boolean,
  confidence integer,
  features text[],
  suggested_price numeric(10, 2),
  status text DEFAULT 'pending' NOT NULL,
  votes_authentic integer DEFAULT 0 NOT NULL,
  votes_fake integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Create marketplace table
CREATE TABLE IF NOT EXISTS marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid REFERENCES verifications NOT NULL,
  seller_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  accepts_crypto boolean DEFAULT false NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;

-- Create verification_votes table
CREATE TABLE IF NOT EXISTS verification_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid REFERENCES verifications NOT NULL,
  voter_id uuid REFERENCES auth.users NOT NULL,
  vote boolean NOT NULL,
  weight integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(verification_id, voter_id)
);

ALTER TABLE verification_votes ENABLE ROW LEVEL SECURITY;

-- Create staking table
CREATE TABLE IF NOT EXISTS staking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  tx_hash text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE staking ENABLE ROW LEVEL SECURITY;

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  reference_id uuid,
  description text,
  tx_hash text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Verifications policies
CREATE POLICY "Anyone can view verifications"
  ON verifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own verifications"
  ON verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
  ON verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Marketplace policies
CREATE POLICY "Anyone can view marketplace listings"
  ON marketplace
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own listings"
  ON marketplace
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
  ON marketplace
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Verification votes policies
CREATE POLICY "Authenticated users can vote"
  ON verification_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view votes"
  ON verification_votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Staking policies
CREATE POLICY "Users can view their own staking"
  ON staking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create staking records"
  ON staking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Token transactions policies
CREATE POLICY "Users can view their own transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add functions and triggers for verification consensus

-- Function to update verification status based on votes
CREATE OR REPLACE FUNCTION update_verification_consensus()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts on the verification
  UPDATE verifications
  SET 
    votes_authentic = (
      SELECT COALESCE(SUM(weight), 0)
      FROM verification_votes
      WHERE verification_id = NEW.verification_id AND vote = true
    ),
    votes_fake = (
      SELECT COALESCE(SUM(weight), 0)
      FROM verification_votes
      WHERE verification_id = NEW.verification_id AND vote = false
    ),
    updated_at = now()
  WHERE id = NEW.verification_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update consensus after vote
CREATE TRIGGER after_vote_trigger
AFTER INSERT OR UPDATE ON verification_votes
FOR EACH ROW
EXECUTE FUNCTION update_verification_consensus();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_created_at ON verifications(created_at);
CREATE INDEX idx_marketplace_verification_id ON marketplace(verification_id);
CREATE INDEX idx_marketplace_seller_id ON marketplace(seller_id);
CREATE INDEX idx_verification_votes_verification_id ON verification_votes(verification_id);
CREATE INDEX idx_staking_user_id ON staking(user_id);
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);