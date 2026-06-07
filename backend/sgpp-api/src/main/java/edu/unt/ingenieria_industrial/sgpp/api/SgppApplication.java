package edu.unt.ingenieria_industrial.sgpp.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "edu.unt.ingenieria_industrial.sgpp")
@EntityScan(basePackages = "edu.unt.ingenieria_industrial.sgpp")
@EnableJpaRepositories(basePackages = "edu.unt.ingenieria_industrial.sgpp")
public class SgppApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgppApplication.class, args);
    }
}

