package com.folio.backend.application.sharing;

public enum PageAccessLevel {
    OWNER, EDITOR, VIEWER;

    public boolean canEdit() { return this != VIEWER; }

    public String storedRole() {
        return switch (this) {
            case VIEWER -> "reader";
            case EDITOR -> "editor";
            case OWNER -> throw new PageAccessException.Invalid("A permissão OWNER não pode ser atribuída.");
        };
    }

    public static PageAccessLevel fromRole(String role) {
        return "editor".equals(role) ? EDITOR : VIEWER;
    }
}
