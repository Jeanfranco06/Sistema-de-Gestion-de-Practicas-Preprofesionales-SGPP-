package edu.unt.ingenieria_industrial.sgpp.core.documental.service;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.storage.provider:local}")
    private String storageProvider;

    @Value("${app.storage.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.storage.supabase.service-role-key:}")
    private String supabaseServiceRoleKey;

    @Value("${app.storage.supabase.bucket:}")
    private String supabaseBucket;

    private Path fileStorageLocation;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @PostConstruct
    public void init() {
        if (usesSupabaseStorage()) {
            validateSupabaseConfiguration();
            return;
        }
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio donde se guardarán los archivos subidos.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }
        
        String fileName = UUID.randomUUID().toString() + extension;

        if (usesSupabaseStorage()) {
            storeFileInSupabase(file, fileName);
            return fileName;
        }

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("El nombre del archivo contiene caracteres inválidos " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo guardar el archivo " + fileName + ". Inténtalo de nuevo!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        if (usesSupabaseStorage()) {
            return loadFileFromSupabase(fileName);
        }
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new BusinessException("Ruta de archivo inválida");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Archivo no encontrado " + fileName);
            }
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Archivo no encontrado " + fileName, ex);
        }
    }

    private boolean usesSupabaseStorage() {
        return "supabase".equalsIgnoreCase(storageProvider);
    }

    private void validateSupabaseConfiguration() {
        if (supabaseUrl.isBlank() || supabaseServiceRoleKey.isBlank() || supabaseBucket.isBlank()) {
            throw new IllegalStateException("La configuración de Supabase Storage es obligatoria en producción");
        }
    }

    private void storeFileInSupabase(MultipartFile file, String fileName) {
        try {
            HttpRequest request = HttpRequest.newBuilder(storageObjectUri(fileName))
                    .header("Authorization", "Bearer " + supabaseServiceRoleKey)
                    .header("apikey", supabaseServiceRoleKey)
                    .header("Content-Type", file.getContentType() == null ? "application/pdf" : file.getContentType())
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("No se pudo guardar el archivo en el almacenamiento remoto");
            }
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo guardar el archivo " + fileName, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Se interrumpió la carga del archivo " + fileName, ex);
        }
    }

    private Resource loadFileFromSupabase(String fileName) {
        try {
            HttpRequest request = HttpRequest.newBuilder(storageObjectUri(fileName))
                    .header("Authorization", "Bearer " + supabaseServiceRoleKey)
                    .header("apikey", supabaseServiceRoleKey)
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 404) {
                throw new ResourceNotFoundException("Archivo no encontrado " + fileName);
            }
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("No se pudo descargar el archivo del almacenamiento remoto");
            }
            return new org.springframework.core.io.ByteArrayResource(response.body());
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo descargar el archivo " + fileName, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Se interrumpió la descarga del archivo " + fileName, ex);
        }
    }

    private URI storageObjectUri(String fileName) {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new BusinessException("Ruta de archivo inválida");
        }
        String baseUrl = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        return URI.create(baseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName);
    }
}
