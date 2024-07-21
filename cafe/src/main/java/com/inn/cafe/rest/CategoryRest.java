package com.inn.cafe.rest;

import com.inn.cafe.POJO.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path ="/category")
public interface CategoryRest {

    @PostMapping(path="/add")
    //Returns a response entity
    ResponseEntity<String> addNewCategory(@RequestBody(required = true) Map<String, String> requestMap);

    // Returns all categories. Expected 1 value, filtervalue, if true we are getting all products irrespective of categories.
    @GetMapping(path="/get")
    ResponseEntity<List<Category>> getAllCategory(@RequestParam(required = false) String filterValue);

    @PostMapping(path="/update")
    ResponseEntity<String> updateCategory(@RequestBody(required = true) Map<String, String> requestMap);
}
