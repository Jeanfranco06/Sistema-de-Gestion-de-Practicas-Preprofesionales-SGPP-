package edu.unt.ingenieria_industrial.sgpp.core.plazo.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ControlPlazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

import java.util.List;
import java.util.Optional;

@Repository
public interface ControlPlazoRepository extends JpaRepository<ControlPlazo, Long> {

    List<ControlPlazo> findByExpedienteIdOrderByFechaCreacionDesc(Long expedienteId);

    @Query("SELECT c FROM ControlPlazo c JOIN FETCH c.reglaPlazo WHERE c.expediente.id = :expedienteId ORDER BY c.fechaCreacion DESC")
    List<ControlPlazo> findByExpedienteIdWithRegla(Long expedienteId);

    Optional<ControlPlazo> findTopByExpedienteIdAndReglaPlazoCodigoAndEstadoInOrderByFechaCreacionDesc(
            Long expedienteId, String codigoRegla, List<String> estados);

    @Query("SELECT c FROM ControlPlazo c JOIN FETCH c.reglaPlazo rp " +
           "WHERE c.expediente.id = :expedienteId AND rp.codigo = :codigoRegla " +
           "AND c.estado IN :estados ORDER BY c.fechaCreacion DESC")
    List<ControlPlazo> findByExpedienteAndReglaCodigoWithEstados(
            Long expedienteId, String codigoRegla, List<String> estados);

    @Query("SELECT c FROM ControlPlazo c JOIN FETCH c.expediente e JOIN FETCH c.reglaPlazo rp " +
           "WHERE c.estado IN ('VIGENTE', 'PROXIMO_A_VENCER') AND e.activo = true")
    List<ControlPlazo> findAllVigentes();

    @Query("SELECT c FROM ControlPlazo c WHERE c.estado = 'VIGENTE' AND c.fechaLimite <= :fecha")
    List<ControlPlazo> findVigentesConFechaLimiteAntesDe(LocalDate fecha);

    long countByExpedienteIdAndEstadoIn(Long expedienteId, List<String> estados);
}
