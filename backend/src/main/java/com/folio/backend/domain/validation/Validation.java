package com.folio.backend.domain.validation;

public final class Validation {
    public static <T> T notNull(T value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " não pode ser nulo");
        }
        return value;
    }

    public static String notBlankIfPresent(String value, String field) {
        return value == null ? null : notBlank(value, field);
    }

    public static String notBlank(String value, String field){
        if(value == null || value.isBlank()){
            throw new IllegalArgumentException(field + "nao pode ser vazio");
        }

        return value;
    }

    public static String maxLength(String value, int max, String field) {
        if (value != null && value.length() > max) {
            throw new IllegalArgumentException(
                    field + " não pode ultrapassar " + max + " caracteres"
            );
        }

        return value;
    }
}
