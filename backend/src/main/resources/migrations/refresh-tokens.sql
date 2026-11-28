ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS token_hash CHAR(64),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS family_id UUID;

-- Migrate older installations with a plaintext token column. JSON field access works on either schema.
UPDATE refresh_tokens AS r
SET token_hash = encode(sha256(convert_to(to_jsonb(r)->>'token', 'UTF8')), 'hex'),
    expires_at = (to_jsonb(r)->>'expiry_date')::TIMESTAMP AT TIME ZONE 'UTC',
    revoked_at = CASE WHEN (to_jsonb(r)->>'revoked')::BOOLEAN THEN CURRENT_TIMESTAMP END
WHERE r.token_hash IS NULL;

-- Retire tokens issued to the old browser-storage client.
UPDATE refresh_tokens
SET family_id = id, revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
WHERE family_id IS NULL;

ALTER TABLE refresh_tokens
    ALTER COLUMN token_hash SET NOT NULL,
    ALTER COLUMN expires_at SET NOT NULL,
    ALTER COLUMN family_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS refresh_tokens_token_hash_key ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id) WHERE revoked_at IS NULL;

ALTER TABLE refresh_tokens
    DROP COLUMN IF EXISTS token,
    DROP COLUMN IF EXISTS expiry_date,
    DROP COLUMN IF EXISTS revoked;
