package edu.unt.ingenieria_industrial.sgpp.core.plan.service;

import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.*;

import java.util.List;

public interface PlanGeneralService {

    PlanGeneralResponse registrar(RegistrarPlanRequest request, Long idUsuario);

    PlanGeneralResponse presentar(Long idPlan, Long idUsuario);

    PlanGeneralResponse observar(Long idPlan, ObservarPlanRequest request, Long idUsuario);

    PlanGeneralResponse subsanar(Long idPlan, SubsanarPlanRequest request, Long idUsuario);

    PlanGeneralResponse aprobar(Long idPlan, Long idUsuario);

    PlanGeneralResponse rechazar(Long idPlan, String observacion, Long idUsuario);

    PlanGeneralResponse findById(Long id);

    PlanGeneralResponse findActivoByExpedienteId(Long expedienteId);

    List<PlanGeneralResponse> listarPorExpediente(Long expedienteId);

    ValidacionEstructuraResponse validarEstructura(Long idPlan);

    void delete(Long id, Long idUsuario);

    record ValidacionEstructuraResponse(
            boolean valido,
            java.util.List<String> errores,
            java.util.List<String> advertencias
    ) {}
}
