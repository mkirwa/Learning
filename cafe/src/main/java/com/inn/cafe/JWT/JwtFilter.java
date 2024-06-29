package com.inn.cafe.JWT;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    /**
     * @param request
     * @param response
     * @param filterChain
     * @throws ServletException
     * @throws IOException
     */

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomerUsersDetailsService service;

    Claims claims = null;
    private String userName = null;


    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        // By pass user login stuff - login api, forget password and signup
        if(httpServletRequest.getServletPath().matches("/user/login|/user/forgotpassword|/user/signup")){
            // if this is the case just let it pass. No token validationis required.
            filterChain.doFilter(httpServletRequest, httpServletResponse);
        } else {
            // if it's not getting bypassed then do the filteration
            // Extract the validation header!
            String authorizationHeader = httpServletRequest.getHeader("Authorization");
            String token = null;

            // Check if the authorization header has an error
            if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")){
                // Extract token - 7 is the number Bearer plus the space.
                // We are extracting bearer from the token
                token = authorizationHeader.substring(7);
                // now extract username
                userName = jwtUtil.extractUsername(token);
                // extract claims
                claims = jwtUtil.extractAllClaims(token);
            }

            // After extraction. We have to check for valid values
            if (userName != null && SecurityContextHolder.getContext().getAuthentication()==null){
                // Extract the username from the database
                UserDetails userDetails = service.loadUserByUsername(userName);
                if(jwtUtil.validateToken(token, userDetails)){
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(httpServletRequest)
                    );
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
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
