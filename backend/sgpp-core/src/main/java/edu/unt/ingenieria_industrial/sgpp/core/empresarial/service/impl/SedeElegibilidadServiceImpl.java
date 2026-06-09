package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ValidacionSedeRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedeElegibilidadService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SedeElegibilidadServiceImpl implements SedeElegibilidadService {

    private final SedePracticaRepository sedePracticaRepository;
    private final ConvenioRepository convenioRepository;
    private final ValidacionSedeRepository validacionSedeRepository;
    private final TutorExternoRepository tutorExternoRepository;
    private final PracticaRepository practicaRepository;

    public SedeElegibilidadServiceImpl(SedePracticaRepository sedePracticaRepository,
                                        ConvenioRepository convenioRepository,
                                        ValidacionSedeRepository validacionSedeRepository,
                                        TutorExternoRepository tutorExternoRepository,
                                        PracticaRepository practicaRepository) {
        this.sedePracticaRepository = sedePracticaRepository;
        this.convenioRepository = convenioRepository;
        this.validacionSedeRepository = validacionSedeRepository;
        this.tutorExternoRepository = tutorExternoRepository;
        this.practicaRepository = practicaRepository;
    }

    @Override
    public ResultadoElegibilidad evaluarElegibilidad(Long sedeId) {
        SedePractica sede = sedePracticaRepository.findById(sedeId)
                .orElse(null);
        if (sede == null) {
            return new ResultadoElegibilidad(false,
                    List.of("La sede no existe"));
        }
        return evaluarElegibilidad(sede);
    }

    @Override
    public ResultadoElegibilidad evaluarElegibilidad(SedePractica sede) {
        List<String> motivos = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        if (!Boolean.TRUE.equals(sede.getActivo())) {
            motivos.add("La sede no está activa");
        }

        if (!"ACTIVA".equals(sede.getEstadoSede())) {
            motivos.add("La sede no está habilitada (estado: " + sede.getEstadoSede() + ")");
        }

        List<Convenio> convenios = convenioRepository.findByEmpresaIdAndVigenteTrue(sede.getEmpresa().getId());
        boolean convenioVigente = convenios.stream().anyMatch(c ->
                Boolean.TRUE.equals(c.getActivo()) &&
                !c.getFechaInicio().isAfter(hoy) &&
                c.getFechaFin().isAfter(hoy));
        if (!convenioVigente) {
            motivos.add("No tiene un convenio vigente con fechas válidas");
        }

        ValidacionSede validacion = validacionSedeRepository
                .findValidacionVigente(sede.getId(), hoy).orElse(null);
        if (validacion == null) {
            motivos.add("No tiene una validación aprobada vigente");
        }

        long tutoresActivos = tutorExternoRepository
                .findActiveBySedeId(sede.getId()).size();
        if (tutoresActivos == 0) {
            motivos.add("No tiene un tutor de empresa activo asignado");
        }

        long practicasActivas = practicaRepository
                .findBySedeIdAndActivoTrue(sede.getId()).size();
        if (sede.getCapacidadMaxima() != null && practicasActivas >= sede.getCapacidadMaxima()) {
            motivos.add("La sede ha alcanzado su capacidad máxima de estudiantes");
        }

        return new ResultadoElegibilidad(motivos.isEmpty(), motivos);
    }
}
