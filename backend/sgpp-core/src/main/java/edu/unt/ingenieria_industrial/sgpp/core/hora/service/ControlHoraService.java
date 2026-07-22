package edu.unt.ingenieria_industrial.sgpp.core.hora.service;

import edu.unt.ingenieria_industrial.sgpp.core.hora.dto.*;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;

import java.time.LocalDate;
import java.util.List;

public interface ControlHoraService {

    ApiResponse<ControlHoraResponse> iniciarControlHora(Long idExpediente, Long idUsuario);

    ApiResponse<RegistroHoraResponse> registrarHora(Long idExpediente, RegistrarHoraRequest request, Long idUsuario);

    ApiResponse<RegistroHoraResponse> validarHora(Long idRegistro, ValidarHoraRequest request, Long idUsuario,
            java.util.Collection<String> roles);

    ApiResponse<CumplimientoHorasResponse> verificarCumplimiento(Long idExpediente);

    ApiResponse<ControlHoraResponse> obtenerControlHora(Long idExpediente);

    ApiResponse<List<RegistroHoraResponse>> listarRegistros(Long idExpediente);

    ApiResponse<List<RegistroHoraResponse>> listarRegistrosPorPeriodo(Long idExpediente, LocalDate desde, LocalDate hasta);

    ApiResponse<Void> actualizarHorasAcumuladas(Long idExpediente, Long idUsuario);

    ApiResponse<Boolean> puedeCerrarExpediente(Long idExpediente);

    boolean existeControlHoraActivo(Long idExpediente);
}
