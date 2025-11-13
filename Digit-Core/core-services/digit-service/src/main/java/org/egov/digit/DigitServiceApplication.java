package org.egov.digit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DigitServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitServiceApplication.class, args);
    }
}
