ALTER TABLE categories ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_owner_name ON categories (owner_user_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_catalog_name ON categories (name) WHERE owner_user_id IS NULL;

-- Legacy categories were global. Keep them as templates and give existing pages an owner-specific copy.
INSERT INTO categories (name, color, owner_user_id)
SELECT DISTINCT c.name, c.color, p.owner_user_id
FROM categories c JOIN pages p ON p.category_id = c.id
WHERE c.owner_user_id IS NULL
ON CONFLICT (owner_user_id, name) DO NOTHING;

UPDATE pages p SET category_id = personal.id
FROM categories legacy, categories personal
WHERE p.category_id = legacy.id AND legacy.owner_user_id IS NULL
  AND personal.owner_user_id = p.owner_user_id AND personal.name = legacy.name;

ALTER TABLE page_permissions ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES users(id);
UPDATE page_permissions pp SET granted_by = p.owner_user_id
FROM pages p WHERE pp.page_id = p.id AND pp.granted_by IS NULL;
ALTER TABLE page_permissions ALTER COLUMN granted_by SET NOT NULL;

ALTER TABLE page_share_links ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
UPDATE page_share_links sl SET created_by = p.owner_user_id
FROM pages p WHERE sl.page_id = p.id AND sl.created_by IS NULL;
ALTER TABLE page_share_links ALTER COLUMN created_by SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_page_share_links_active ON page_share_links (page_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_owner_category ON pages (owner_user_id, category_id, last_edited_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_page_favorites_page ON page_favorites (page_id);
CREATE INDEX IF NOT EXISTS idx_page_favorites_user_created ON page_favorites (user_id, created_at DESC);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
CREATE TABLE IF NOT EXISTS category_default_exclusions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);
