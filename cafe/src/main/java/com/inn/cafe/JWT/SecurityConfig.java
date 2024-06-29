package com.inn.cafe.JWT;

import org.springframework.beans.factory.annotation.Autowired; // Imports the Autowired annotation for dependency injection
import org.springframework.context.annotation.Bean; // Imports the Bean annotation for defining beans
import org.springframework.context.annotation.Configuration; // Imports the Configuration annotation for marking this class as a configuration class
import org.springframework.security.authentication.AuthenticationManager; // Imports the AuthenticationManager for authentication management
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; // Imports the AuthenticationManagerBuilder for building the authentication manager
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Imports the HttpSecurity for configuring web-based security for specific HTTP requests
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Imports the EnableWebSecurity annotation to enable Spring Security
import org.springframework.security.config.http.SessionCreationPolicy; // Imports the SessionCreationPolicy for configuring the session management
// Imports the NoOpPasswordEncoder, which stores passwords in plain text without any encoding or encryption
// Using NoOpPasswordEncoder means that the passwords are stored in plain text without any encoding or encryption.
// This approach does not provide any security for the stored passwords and is typically used for testing or demonstration purposes only.
// In a production environment, a more secure password encoding mechanism, such as BCrypt, should be used to protect user passwords.
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder; // Imports the PasswordEncoder interface for password encoding
import org.springframework.security.web.SecurityFilterChain; // Imports the SecurityFilterChain for defining the security filter chain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Imports the UsernamePasswordAuthenticationFilter for username and password based authentication
// Imports the CorsConfiguration for configuring Cross-Origin Resource Sharing (CORS), a security feature that controls resource access from different origins
// Allows or restricts web applications from making requests to a domain different from the one that served the web application.
// It helps prevent malicious websites from making unauthorized requests to another site.
import org.springframework.web.cors.CorsConfiguration;

@Configuration // Marks this class as a configuration class
@EnableWebSecurity // Enables Spring Security for this application
public class SecurityConfig {

    @Autowired
    private CustomerUsersDetailsService customerUsersDetailsService; // Injects the custom UserDetailsService

    @Autowired
    private JwtFilter jwtFilter; // Injects the JWT filter

    @Autowired
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        // Configures AuthenticationManagerBuilder to use the custom UserDetailsService
        auth.userDetailsService(customerUsersDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Defines a PasswordEncoder bean that performs no encryption
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configures the security filter chain
        http
                .cors(cors -> cors.configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues())) // Enables CORS with default configuration
                .csrf(csrf -> csrf.disable()) // Disables CSRF protection
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/login", "/user/signup", "/user/forgotPassword").permitAll() // Allows public access to these endpoints
                        .anyRequest().authenticated() // Requires authentication for any other requests
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Configures session management to be stateless
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // Adds the JWT filter before the UsernamePasswordAuthenticationFilter

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManagerBean(HttpSecurity http) throws Exception {
        // Defines the AuthenticationManager bean
        return http.getSharedObject(AuthenticationManagerBuilder.class).build();
    }
}
