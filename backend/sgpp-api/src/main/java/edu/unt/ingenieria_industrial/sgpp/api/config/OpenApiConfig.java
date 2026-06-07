package edu.unt.ingenieria_industrial.sgpp.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sgppOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("AutenticaciÃ³n JWT token")
                        )
                )
                .info(new Info()
                        .title("SGPP API - Sistema de GestiÃ³n de PrÃ¡cticas Preprofesionales")
                        .description("API REST para el Sistema de GestiÃ³n de PrÃ¡cticas Preprofesionales de la Escuela Profesional de IngenierÃ­a Industrial de la Universidad Nacional de Trujillo")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Escuela de IngenierÃ­a Industrial - UNT")
                                .email("soporte@unt.edu.pe")
                                .url("https://www.unt.edu.pe"))
                        .license(new License()
                                .name("Licencia Propietaria")
                                .url("https://www.unt.edu.pe")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api/v1").description("Servidor Local"),
                        new Server().url("https://dev.sgpp.unt.edu.pe/api/v1").description("Servidor de Desarrollo")
                ));
    }
}

