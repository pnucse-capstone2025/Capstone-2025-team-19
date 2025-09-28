package org.example.speaknotebackend;

import org.example.speaknotebackend.domain.oauth.google.GoogleAccessKey;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(GoogleAccessKey.class)
public class SpeaknoteBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpeaknoteBackendApplication.class, args);
    }

}
