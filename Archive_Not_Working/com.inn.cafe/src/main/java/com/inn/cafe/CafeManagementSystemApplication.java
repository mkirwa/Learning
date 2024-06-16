package com.inn.cafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

// Annotation that denotes a Spring Boot application
@SpringBootApplication

// Annotation to specify the packages to scan for JPA entities
//@EntityScan(basePackages = "com.inn.cafe.POJO")
public class CafeManagementSystemApplication {

	// The main method which serves as the entry point for the Spring Boot application
	public static void main(String[] args) {
		// Static method to launch the Spring Boot application
		SpringApplication.run(CafeManagementSystemApplication.class, args);
	}
}
