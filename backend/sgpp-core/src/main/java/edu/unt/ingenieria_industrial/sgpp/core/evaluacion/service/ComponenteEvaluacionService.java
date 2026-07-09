package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.ComponenteEvaluacionDTO;

import java.util.List;

public interface ComponenteEvaluacionService {
    
    /**
     * Inicializa los componentes de evaluación para un expediente según normativa.
     * - PLAN: 10 puntos (10%)
     * - EMPRESA: 50 puntos (50%)
     * - INFORME: 40 puntos (40%)
     */
    void inicializarComponentes(Long expedienteId, String tipoPractica);
    
    /**
     * Registra la evaluación de un componente específico.
     */
    ComponenteEvaluacionDTO registrarEvaluacion(Long expedienteId, String tipoComponente, 
            Integer puntaje, Long evaluadorId, String tipoEvaluador, String observaciones);
    
    /**
     * Obtiene todos los componentes de evaluación de un expediente.
     */
    List<ComponenteEvaluacionDTO> obtenerComponentesPorExpediente(Long expedienteId);
    
    /**
     * Calcula el puntaje total de un expediente sumando los componentes.
     */
    Integer calcularPuntajeTotal(Long expedienteId);
    
    /**
     * Verifica si todos los componentes están completados.
     */
    boolean estanTodosComponentesCompletados(Long expedienteId);
}
