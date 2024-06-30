package com.inn.cafe.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import java.util.Date;

// For writing logic - understands we are going to write some logic
@Service
public class JwtUtil {

    // Define a secret key that helps generate our web tokens
    private String secret = "btechdays";

    // Extract username from the token
    public String extractUsername(String token){
        return extractClaims(token, Claims::getSubject);
    }

    // Extract expiration time, see if you need to re-issue
    public Date extractExpiration(String token){
        return extractClaims(token, Claims::getExpiration);
    }

    // Extracts specific claims from a JWT token using a provided function claimsResolver
    // token: The JWT token from which claims are to be extracted.
    public <T> T extractClaims(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Method to return claims
    public Claims extractAllClaims(String token){
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    // Method to check if a token is expired or not. Compare that expiry time with the time now.
    private Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    // create a method to pass values to createToken
    public String generateToken(String username, String role){
        Map<String, Object> claims = new HashMap<>();
        claims.put("role",role);
        return  createToken(claims, username);
    }

    // Generate token with the help of a secret key, by passing claims and subjects
    // Set this token so that it expires in 10 hours n-> System.currentTimeMillis() + 1000 * 60 * 60 * 10
    private String createToken(Map<String, Object> claims, String subject){
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10 ))
                .signWith(SignatureAlgorithm.ES256, secret).compact();

    }

    // Let's validate a token
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

}
