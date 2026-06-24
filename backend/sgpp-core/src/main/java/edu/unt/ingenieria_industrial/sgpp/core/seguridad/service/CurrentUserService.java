package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import java.util.List;

public interface CurrentUserService {

    Long getCurrentUserId();

    String getCurrentUsername();

    List<String> getCurrentRoles();

    boolean hasAnyRole(String... roles);
}
