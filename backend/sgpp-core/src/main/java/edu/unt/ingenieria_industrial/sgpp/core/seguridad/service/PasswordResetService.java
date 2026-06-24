package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

public interface PasswordResetService {

    String generarTokenReset(String email);

    void restablecerPassword(String token, String newPassword);

    boolean validarToken(String token);
}
