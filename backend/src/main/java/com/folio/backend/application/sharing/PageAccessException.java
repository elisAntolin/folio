package com.folio.backend.application.sharing;

public class PageAccessException extends RuntimeException {
    public PageAccessException(String message) { super(message); }

    public static final class Forbidden extends PageAccessException {
        public Forbidden() { super("Você não tem permissão para esta operação."); }
    }

    public static final class Gone extends PageAccessException {
        public Gone() { super("Este link expirou ou foi revogado."); }
    }

    public static final class Invalid extends PageAccessException {
        public Invalid(String message) { super(message); }
    }

    public static final class Conflict extends PageAccessException {
        public Conflict(String message) { super(message); }
    }
}
