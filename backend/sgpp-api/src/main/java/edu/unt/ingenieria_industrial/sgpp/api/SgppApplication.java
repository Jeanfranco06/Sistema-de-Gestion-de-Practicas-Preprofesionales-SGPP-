package edu.unt.ingenieria_industrial.sgpp.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication(scanBasePackages = "edu.unt.ingenieria_industrial.sgpp")
@EnableJpaRepositories(basePackages = "edu.unt.ingenieria_industrial.sgpp.core")
@EntityScan(basePackages = "edu.unt.ingenieria_industrial.sgpp")
@EnableScheduling
public class SgppApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgppApplication.class, args);
    }
}

