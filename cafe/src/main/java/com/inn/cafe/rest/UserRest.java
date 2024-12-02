package com.inn.cafe.rest;

import com.inn.cafe.wrapper.UserWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;

// For an endpoint. To be used to connect to the api
// Has all the endpoint for apis....
@RequestMapping(path= "/user")
public interface UserRest {
    // Defining our API - we are bypassing this api and don't need a JWT token to access them they are open apis
    @PostMapping(path="/signup")
    public ResponseEntity<String> signUp(@RequestBody(required = true) Map<String, String> requestMap);

    // we are bypassing this api and don't need a JWT token to access them they are open apis
    @PostMapping(path="/login")
    public ResponseEntity<String> login(@RequestBody(required=true) Map<String, String> requestMap);

    // APIs to get all the users and update the users. e.g. if we want to approve or reject the users
    // APIS to enable and disable accounts.
    // This is the interface and needs to be implemented in UserRestImpl
    // Has issues and needs to be fixed!!!
    @GetMapping(path="/get")
    public ResponseEntity<List<UserWrapper>> getAllUser();

    @PostMapping(path="/update")
    public ResponseEntity<String> update(@RequestBody(required = true) Map<String, String>  requestMap);

    @GetMapping(path="/checkToken")
    ResponseEntity<String> checkToken();

    @PostMapping(path="/changePassword")
    ResponseEntity<String> changePassword(@RequestBody Map<String, String> requestMap);

    // Has issues and needs to be fixed!!! Email not being sent!!
    @PostMapping(path="/forgotPassword")
    ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> requestMap);

























































}
