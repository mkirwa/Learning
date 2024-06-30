package com.inn.cafe.JWT;
// Imports the Claims class from the io.jsonwebtoken package for handling JWT claims
import io.jsonwebtoken.Claims;
// Imports the FilterChain class for processing servlet filters
import jakarta.servlet.FilterChain;
// Imports the ServletException class for handling servlet exceptions
import jakarta.servlet.ServletException;
// Imports the HttpServletRequest class for handling HTTP servlet requests
import jakarta.servlet.http.HttpServletRequest;
// Imports the HttpServletResponse class for handling HTTP servlet responses
import jakarta.servlet.http.HttpServletResponse;
// Imports the Autowired annotation for automatic dependency injection
import org.springframework.beans.factory.annotation.Autowired;
// Imports the UsernamePasswordAuthenticationToken class for username-password authentication
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// Imports the SecurityContextHolder class for accessing the security context
// Security context holds the authentication information of teh current user.
// Allows the application to retrieve details about the currently authenticated user, such as their
// username, roles or other credentials.
import org.springframework.security.core.context.SecurityContextHolder;
// Imports the UserDetails class for holding user-specific security information
import org.springframework.security.core.userdetails.UserDetails;
// Imports the WebAuthenticationDetailsSource class for building web authentication details
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// Imports the Component annotation for creating a Spring-managed bean
import org.springframework.stereotype.Component;
// Imports the OncePerRequestFilter class for ensuring a filter is executed once per request
import org.springframework.web.filter.OncePerRequestFilter;
// Imports the IOException class for handling IO exceptions
import java.io.IOException;

@Component // Marks this class as a Spring component, allowing it to be autowired
public class JwtFilter extends OncePerRequestFilter {

    /**
     * @param request
     * @param response
     * @param filterChain
     * @throws ServletException
     * @throws IOException
     */

    @Autowired // Injects the JwtUtil bean into this class
    private JwtUtil jwtUtil;

    @Autowired // Injects the CustomerUsersDetailsService bean into this class
    private CustomerUsersDetailsService service;

    Claims claims = null; // Holds the JWT claims
    private String userName = null; // Holds the username extracted from the JWT


    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        // By pass user login stuff - login api, forget password and signup
        if(httpServletRequest.getServletPath().matches("/user/login|/user/forgotpassword|/user/signup")){
            // if this is the case just let it pass. No token validationis required.
            filterChain.doFilter(httpServletRequest, httpServletResponse); // Allow the request to pass through
        } else {
            // if it's not getting bypassed then do the filteration
            // Extract the validation header!
            String authorizationHeader = httpServletRequest.getHeader("Authorization");
            String token = null;

            // Check if the authorization header has an error and starts with "Bearer "
            if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")){
                // Extract token from authorization header- 7 is the number Bearer plus the space.
                // We are extracting bearer from the token
                token = authorizationHeader.substring(7);
                // now extract username
                userName = jwtUtil.extractUsername(token);
                // extract all claims from the token
                claims = jwtUtil.extractAllClaims(token);
            }

            // After extraction. We have to check for valid values. Validate the extracted username and token
            if (userName != null && SecurityContextHolder.getContext().getAuthentication()==null){
                // Extract the username from the database
                UserDetails userDetails = service.loadUserByUsername(userName);
                // Validate the token
                if(jwtUtil.validateToken(token, userDetails)){
                    // Create an authentication token
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    // Set the details of the authentication token
                    usernamePasswordAuthenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(httpServletRequest)
                    );
                    // Set the authentication in the security context
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
            // Continue the filter chain
            filterChain.doFilter(httpServletRequest, httpServletResponse);
        }
    }

    public boolean isAdmin(){
        return "admin".equalsIgnoreCase((String) claims.get("role"));
    }

    public boolean isUser(){
        return "user".equalsIgnoreCase((String) claims.get("role"));
    }

    public String getCurrentUser(){
        return userName;
    }
}
