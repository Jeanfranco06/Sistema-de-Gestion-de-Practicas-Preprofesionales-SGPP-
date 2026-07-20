package edu.unt.ingenieria_industrial.sgpp.api.config;

import edu.unt.ingenieria_industrial.sgpp.api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final edu.unt.ingenieria_industrial.sgpp.api.security.UsuarioContextFilter usuarioContextFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                 .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/forgot-password", "/auth/reset-password", "/auth/validate-reset-token", "/public/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/actuator/**", "/webjars/**").permitAll()
                        .requestMatchers("/admin/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COMITE_PRACTICAS", "COORDINADOR", "DIRECTOR")
                        .requestMatchers("/secretaria/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA")
                        .requestMatchers("/estudiante/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "ESTUDIANTE")
                        .requestMatchers("/docente/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "DOCENTE_ASESOR")
                        .requestMatchers("/tutor/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "TUTOR_EXTERNO")
                        .requestMatchers("/evaluaciones/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "DOCENTE_ASESOR", "TUTOR_EXTERNO")
                        .requestMatchers("/documentos/**").authenticated()
                        .requestMatchers("/parametros/**").authenticated()
                        .requestMatchers("/tutores-externos/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COMITE_PRACTICAS", "COORDINADOR", "DIRECTOR")
                        .requestMatchers("/expedientes/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COMITE_PRACTICAS", "COORDINADOR", "DIRECTOR", "DOCENTE_ASESOR", "ESTUDIANTE", "TUTOR_EXTERNO")
                        .requestMatchers("/planes/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COMITE_PRACTICAS", "COORDINADOR", "DIRECTOR", "DOCENTE_ASESOR", "ESTUDIANTE")
                        .requestMatchers("/plazos/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COMITE_PRACTICAS", "COORDINADOR", "DIRECTOR", "DOCENTE_ASESOR")
                        .requestMatchers("/sedes/catalogo", "/sedes/*/detalle").authenticated()
                        .requestMatchers("/tipo-practica").authenticated()
                        .requestMatchers("/empresas/**", "/sedes/**", "/convenios/**").authenticated()
                        .requestMatchers("/usuarios/**").hasAnyRole("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COORDINADOR", "DIRECTOR")
                        .requestMatchers("/notificaciones/**").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(usuarioContextFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

