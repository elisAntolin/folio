package com.folio.backend.domain.model;

import java.util.UUID;

public class Category {
    private final UUID id;
    private String name;
    private String icon_url;

    public Category(String name, String icon_url){
        this.id = UUID.randomUUID();
        this.name = name;
        this.icon_url = icon_url;
    }

    public UUID getId() {return id;}
    public String getName() {return name;}
    public String getIconUrl() {return icon_url;}
}
