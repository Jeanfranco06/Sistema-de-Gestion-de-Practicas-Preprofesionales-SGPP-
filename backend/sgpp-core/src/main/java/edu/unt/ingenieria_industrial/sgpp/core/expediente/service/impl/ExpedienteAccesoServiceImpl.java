package edu.unt.ingenieria_industrial.sgpp.core.expediente.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteComiteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ExpedienteAccesoServiceImpl implements ExpedienteAccesoService {

    private static final Set<String> ROLES_LECTURA_GLOBAL = Set.of(
            "ADMIN_SISTEMA", "SECRETARIA", "COORDINADOR", "DIRECTOR"
    );

    private final TutorExternoRepository tutorExternoRepository;
    private final ExpedienteComiteRepository comiteRepository;

    @Override
    public void verificarLectura(Expediente expediente, Long idUsuario, Collection<String> roles) {
        if (!puedeLeer(expediente, idUsuario, roles)) {
            throw new BusinessException("No tiene permiso para acceder a este expediente");
        }
    }

    @Override
    public void verificarEscritura(Expediente expediente, Long idUsuario, Collection<String> roles) {
        if (tieneRol(roles, "ADMIN_SISTEMA", "SECRETARIA", "COORDINADOR", "DIRECTOR")) {
            return;
        }
        if (tieneRol(roles, "ESTUDIANTE")
                && expediente.getEstudiante() != null
                && expediente.getEstudiante().getUsuario() != null
                && idUsuario.equals(expediente.getEstudiante().getUsuario().getId())) {
            return;
        }
        if (tieneRol(roles, "DOCENTE_ASESOR")
                && expediente.getAsesor() != null
                && idUsuario.equals(expediente.getAsesor().getId())) {
            return;
        }
        if (tieneRol(roles, "TUTOR_EXTERNO") && tutorTieneAcceso(expediente, idUsuario)) {
            return;
        }
        if (tieneRol(roles, "COMITE_PRACTICAS")
                && comiteRepository.existsByExpedienteIdAndUsuarioIdAndActivoTrue(expediente.getId(), idUsuario)) {
            return;
        }
        throw new BusinessException("No tiene permiso para modificar este expediente");
    }

    @Override
    public boolean puedeLeer(Expediente expediente, Long idUsuario, Collection<String> roles) {
        if (roles != null && roles.stream().anyMatch(ROLES_LECTURA_GLOBAL::contains)) {
            return true;
        }
        if (tieneRol(roles, "ESTUDIANTE")
                && expediente.getEstudiante() != null
                && expediente.getEstudiante().getUsuario() != null
                && idUsuario.equals(expediente.getEstudiante().getUsuario().getId())) {
            return true;
        }
        if (tieneRol(roles, "DOCENTE_ASESOR")
                && expediente.getAsesor() != null
                && idUsuario.equals(expediente.getAsesor().getId())) {
            return true;
        }
        if (tieneRol(roles, "TUTOR_EXTERNO") && tutorTieneAcceso(expediente, idUsuario)) {
            return true;
        }
        if (tieneRol(roles, "COMITE_PRACTICAS")
                && comiteRepository.existsByExpedienteIdAndUsuarioIdAndActivoTrue(expediente.getId(), idUsuario)) {
            return true;
        }
        return false;
    }

    private boolean tutorTieneAcceso(Expediente expediente, Long idUsuario) {
        return tutorExternoRepository.findByUsuarioId(idUsuario)
                .map(tutor -> {
                    if (expediente.getTutorEmpresa() != null
                            && expediente.getTutorEmpresa().getId().equals(tutor.getId())) {
                        return true;
                    }
                    return expediente.getEmpresa() != null
                            && tutor.getEmpresa() != null
                            && expediente.getEmpresa().getId().equals(tutor.getEmpresa().getId());
                })
                .orElse(false);
    }

    private boolean tieneRol(Collection<String> roles, String... expected) {
        if (roles == null) {
            return false;
        }
        for (String role : expected) {
            if (roles.contains(role)) {
                return true;
            }
        }
        return false;
    }
}
