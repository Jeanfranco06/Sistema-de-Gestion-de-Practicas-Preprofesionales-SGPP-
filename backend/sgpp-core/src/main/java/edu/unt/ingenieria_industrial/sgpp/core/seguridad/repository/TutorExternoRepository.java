package edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorExternoRepository extends JpaRepository<TutorExterno, Long> {

    Optional<TutorExterno> findByUsuarioId(Long usuarioId);

    List<TutorExterno> findByEmpresaId(Long empresaId);

    List<TutorExterno> findBySedeId(Long sedeId);

    List<TutorExterno> findByEmpresaIdAndEstadoTutor(Long empresaId, String estadoTutor);

    List<TutorExterno> findBySedeIdAndEstadoTutor(Long sedeId, String estadoTutor);

    @Query("SELECT t FROM TutorExterno t WHERE t.empresa.id = ?1 AND t.estadoTutor = 'ACTIVO' AND t.activo = true")
    List<TutorExterno> findActiveByEmpresaId(Long empresaId);

    @Query("SELECT t FROM TutorExterno t WHERE t.sede.id = ?1 AND t.estadoTutor = 'ACTIVO' AND t.activo = true")
    List<TutorExterno> findActiveBySedeId(Long sedeId);

    @Query("SELECT t FROM TutorExterno t WHERE t.empresa.id = ?1 OR t.sede.id = ?1 AND t.estadoTutor = 'ACTIVO' AND t.activo = true")
    List<TutorExterno> findActiveByEmpresaOrSedeId(Long id);
}

