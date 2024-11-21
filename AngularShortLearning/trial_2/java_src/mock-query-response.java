package com.example.demo.model;

/*
This class represents the response model with a HashSet and a non-array HashMap.

java
Copy code
*/

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.HashSet;

public class QueryResponse {

    @JsonProperty("variableA") // Maps JSON property "variableA" to this variable
    private HashSet<String> variableA;

    @JsonProperty("results") // Maps JSON property "results" to this variable
    private HashMap<String, String> results;

    // Getters and Setters
    public HashSet<String> getVariableA() {
        return variableA;
    }

    public void setVariableA(HashSet<String> variableA) {
        this.variableA = variableA;
    }

    public HashMap<String, String> getResults() {
        return results;
    }

    public void setResults(HashMap<String, String> results) {
        this.results = results;
    }
}
