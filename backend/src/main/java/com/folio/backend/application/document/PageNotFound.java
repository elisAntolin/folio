package com.folio.backend.application.document;

public class PageNotFound extends RuntimeException {
    public PageNotFound() {
        super("Página não encontrada");
    }
}
