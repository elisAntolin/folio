CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY,
    theme VARCHAR(10) NOT NULL DEFAULT 'system',
    default_view VARCHAR(10) NOT NULL DEFAULT 'list',

    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    category_id UUID,
    parent_page_id UUID,

    title VARCHAR(255) NOT NULL,
    cover_image_url TEXT,

    search_vector TSVECTOR GENERATED ALWAYS AS (
       setweight(to_tsvector('portuguese', title), 'A')
    ) STORED,

    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pages_owner
    FOREIGN KEY (owner_user_id)
    REFERENCES users(id),

    CONSTRAINT fk_pages_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id),

    CONSTRAINT fk_pages_parent
    FOREIGN KEY (parent_page_id)
    REFERENCES pages(id),

    CONSTRAINT chk_pages_parent
    CHECK (parent_page_id <> id)
    );

CREATE TABLE IF NOT EXISTS page_contents (
     page_id UUID PRIMARY KEY,
     content_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
     content_text TEXT NOT NULL DEFAULT '',
     search_vector TSVECTOR GENERATED ALWAYS AS (
            setweight(to_tsvector('portuguese', content_text), 'C')
     ) STORED,

    version BIGINT NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_contents_page
    FOREIGN KEY (page_id)
    REFERENCES pages(id)
    ON DELETE CASCADE,

    CONSTRAINT chk_page_contents_version
    CHECK (version >= 1)
    );

CREATE TABLE IF NOT EXISTS page_favorites (
    user_id UUID NOT NULL,
    page_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, page_id),

    CONSTRAINT fk_page_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_page_favorites_page
        FOREIGN KEY (page_id)
        REFERENCES pages(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_pins (
    user_id UUID NOT NULL,
    page_id UUID NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, page_id),

    CONSTRAINT fk_page_pins_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_page_pins_page
        FOREIGN KEY (page_id)
        REFERENCES pages(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_page_pins_position
        CHECK (position >= 0)
);

CREATE TABLE IF NOT EXISTS page_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_permissions_page
        FOREIGN KEY (page_id)
        REFERENCES pages(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_page_permissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_page_permissions_user_page
        UNIQUE (page_id, user_id),

    CONSTRAINT chk_page_permissions_role
        CHECK (role IN ('reader', 'editor'))
);

CREATE TABLE IF NOT EXISTS page_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL,
    invited_email VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_invitations_page
        FOREIGN KEY (page_id)
        REFERENCES pages(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_page_invitations_role
        CHECK (role IN ('reader', 'editor'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('PAGE_SHARED', 'ACCESS_REQUESTED', 'ACCESS_GRANTED', 'ACCESS_DENIED')),
    role VARCHAR(10) NOT NULL CHECK (role IN ('reader', 'editor')),
    message VARCHAR(500),
    decision VARCHAR(10) CHECK (decision IS NULL OR (kind = 'ACCESS_REQUESTED' AND decision IN ('GRANTED', 'DENIED'))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_inbox
    ON notifications (recipient_user_id, created_at DESC, id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_pending_access
    ON notifications (page_id, actor_user_id)
    WHERE kind = 'ACCESS_REQUESTED' AND decision IS NULL;

CREATE TABLE IF NOT EXISTS page_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL DEFAULT 'reader',
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_share_links_page
        FOREIGN KEY (page_id)
        REFERENCES pages(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_page_share_links_role
        CHECK (role IN ('reader', 'editor'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Índice para busca pelo título
-- GIN ele cria um indice invertido para palavra Banana -> [2,3,4]
CREATE INDEX IF NOT EXISTS idx_pages_search_vector
    ON pages USING GIN (search_vector)
    WHERE deleted_at IS NULL;

-- Índice para busca pelo conteúdo
-- GIN ele cria um indice invertido para palavra Banana -> [2,3,4]
CREATE INDEX IF NOT EXISTS idx_page_contents_search_vector
    ON page_contents USING GIN (search_vector);

-- ricardo -> Acelera a busca das sessões de um usuário.
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

-- ricardo -> Acelera a busca de páginas pertencentes a um usuário.
CREATE INDEX IF NOT EXISTS idx_pages_owner_user_id
    ON pages(owner_user_id);

-- ricardo -> Acelera a busca de páginas por categoria.
CREATE INDEX IF NOT EXISTS idx_pages_category_id
    ON pages(category_id);

-- ricardo -> Acelera a busca de subpáginas de uma página.
CREATE INDEX IF NOT EXISTS idx_pages_parent_page_id
    ON pages(parent_page_id);

-- ricardo -> Acelera a listagem de páginas não excluídas de um usuário, ordenadas pelas mais recentes.
CREATE INDEX IF NOT EXISTS idx_pages_owner_active
    ON pages(owner_user_id, updated_at DESC)
    WHERE deleted_at IS NULL;

-- ricardo -> Acelera a listagem das páginas fixadas por um usuário na ordem definida.
CREATE INDEX IF NOT EXISTS idx_page_pins_user_position
    ON page_pins(user_id, position);

-- ricardo -> Acelera a busca de páginas compartilhadas com um usuário.
CREATE INDEX IF NOT EXISTS idx_page_permissions_user_id
    ON page_permissions(user_id);

-- ricardo -> Acelera a busca de convites enviados para um determinado email.
CREATE INDEX IF NOT EXISTS idx_page_invitations_email
    ON page_invitations(invited_email);

-- Preenche o conteúdo das páginas criadas antes da persistência do editor.
INSERT INTO page_contents (page_id)
SELECT id FROM pages
ON CONFLICT (page_id) DO NOTHING;
