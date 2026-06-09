package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorEmpresaRequest;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorEmpresaResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorExternoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.TutorExternoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tutores-empresa")
@RequiredArgsConstructor
@Tag(name = "Gestión de Tutores de Empresa", description = "Endpoints para la administración de tutores de empresa/institución receptora")
@PreAuthorize("hasAnyRole('COORDINADOR', 'COMITE_PRACTICAS', 'SECRETARIA')")
public class TutorEmpresaController {

    private final TutorExternoService tutorExternoService;

    @GetMapping
    @Operation(summary = "Listar tutores con filtros")
    public ResponseEntity<ApiResponse<List<TutorEmpresaResponse>>> findAllWithFilters(
            @Parameter(description = "Filtro por ID de empresa") @RequestParam(required = false) Long idEmpresa,
            @Parameter(description = "Filtro por ID de sede") @RequestParam(required = false) Long idSede,
            @Parameter(description = "Filtro por estado") @RequestParam(required = false) String estado) {
        
        List<TutorExternoDTO> tutores;
        
        if (idEmpresa != null && estado != null) {
            tutores = tutorExternoService.findByEmpresaIdAndEstadoTutor(idEmpresa, estado);
        } else if (idSede != null && estado != null) {
            tutores = tutorExternoService.findBySedeIdAndEstadoTutor(idSede, estado);
        } else if (idEmpresa != null) {
            tutores = tutorExternoService.findByEmpresaId(idEmpresa);
        } else if (idSede != null) {
            tutores = tutorExternoService.findBySedeId(idSede);
        } else {
            tutores = tutorExternoService.findAll();
        }
        
        List<TutorEmpresaResponse> response = tutores.stream()
                .map(this::toTutorEmpresaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ApiResponse.<List<TutorEmpresaResponse>>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un tutor por ID")
    public ResponseEntity<ApiResponse<TutorEmpresaResponse>> findById(@PathVariable Long id) {
        TutorExternoDTO tutor = tutorExternoService.findById(id);
        return ResponseEntity.ok(
                ApiResponse.<TutorEmpresaResponse>builder()
                        .success(true)
                        .data(toTutorEmpresaResponse(tutor))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo tutor de empresa")
    public ResponseEntity<ApiResponse<TutorEmpresaResponse>> create(@Valid @RequestBody TutorEmpresaRequest request) {
        TutorExternoDTO dto = TutorExternoDTO.builder()
                .idUsuario(request.getIdUsuario())
                .idEmpresa(request.getIdEmpresa())
                .idSede(request.getIdSede())
                .cargo(request.getCargo())
                .area(request.getArea())
                .empresaNombre(request.getEmpresaNombre())
                .estadoTutor("ACTIVO")
                .activo(true)
                .build();
        
        TutorExternoDTO created = tutorExternoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<TutorEmpresaResponse>builder()
                        .success(true)
                        .message("Tutor registrado exitosamente")
                        .data(toTutorEmpresaResponse(created))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de un tutor")
    public ResponseEntity<ApiResponse<TutorEmpresaResponse>> update(@PathVariable Long id, @Valid @RequestBody TutorEmpresaRequest request) {
        TutorExternoDTO dto = TutorExternoDTO.builder()
                .idEmpresa(request.getIdEmpresa())
                .idSede(request.getIdSede())
                .cargo(request.getCargo())
                .area(request.getArea())
                .empresaNombre(request.getEmpresaNombre())
                .build();
        
        TutorExternoDTO updated = tutorExternoService.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<TutorEmpresaResponse>builder()
                        .success(true)
                        .message("Tutor actualizado exitosamente")
                        .data(toTutorEmpresaResponse(updated))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar o inactivar un tutor")
    public ResponseEntity<ApiResponse<Void>> updateEstado(@PathVariable Long id, @RequestParam String estado) {
        tutorExternoService.cambiarEstado(id, estado);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Estado del tutor actualizado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/empresas/{idEmpresa}/tutores")
    @Operation(summary = "Listar tutores por empresa")
    public ResponseEntity<ApiResponse<List<TutorEmpresaResponse>>> findByEmpresaId(@PathVariable Long idEmpresa) {
        List<TutorExternoDTO> tutores = tutorExternoService.findByEmpresaId(idEmpresa);
        List<TutorEmpresaResponse> response = tutores.stream()
                .map(this::toTutorEmpresaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ApiResponse.<List<TutorEmpresaResponse>>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/sedes/{idSede}/tutores")
    @Operation(summary = "Listar tutores por sede")
    public ResponseEntity<ApiResponse<List<TutorEmpresaResponse>>> findBySedeId(@PathVariable Long idSede) {
        List<TutorExternoDTO> tutores = tutorExternoService.findBySedeId(idSede);
        List<TutorEmpresaResponse> response = tutores.stream()
                .map(this::toTutorEmpresaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ApiResponse.<List<TutorEmpresaResponse>>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    private TutorEmpresaResponse toTutorEmpresaResponse(TutorExternoDTO dto) {
        return TutorEmpresaResponse.builder()
                .id(dto.getId())
                .idUsuario(dto.getIdUsuario())
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidoPaterno() + " " + (dto.getApellidoMaterno() != null ? dto.getApellidoMaterno() : ""))
                .email(dto.getCorreo())
                .idEmpresa(dto.getIdEmpresa())
                .empresaNombre(dto.getEmpresaNombre() != null ? dto.getEmpresaNombre() : dto.getRazonSocialEmpresa())
                .idSede(dto.getIdSede())
                .sedeNombre(dto.getNombreSede())
                .cargo(dto.getCargo())
                .area(dto.getArea())
                .estadoTutor(dto.getEstadoTutor())
                .activo(dto.getActivo())
                .fechaRegistro(null)
                .build();
    }
}
