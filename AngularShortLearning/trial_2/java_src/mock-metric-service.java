package com.example.demo.service;

import com.example.demo.model.Metric;
import com.example.demo.model.QueryResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;

@Service
public class MetricService {

    /**
     * Processes the given Metric and constructs a QueryResponse.
     * 
     * This service pulls data from two tables, removes duplicates,
     * and returns only unique records.
     * 
     * @param metric The Metric object received from the controller.
     * @return A QueryResponse object with unique data.
     */
    public QueryResponse processMetric(Metric metric) {
        // Table names
        String oldTable = "intrinsic_candidate";
        String newTable = "intrinsic_candidate_001";

        // Unique columns in each table
        String oldTableUniqueColumn = "field_2";
        String newTableUniqueColumn = "field_17";

        // Build the SQL query using UNION to remove duplicates
        StringBuilder query = new StringBuilder();
        query.append("SELECT DISTINCT * FROM (")
             .append("SELECT ").append(oldTableUniqueColumn).append(" AS unique_field, * ")
             .append("FROM ").append(oldTable).append(" ")
             .append("UNION ")
             .append("SELECT ").append(newTableUniqueColumn).append(" AS unique_field, * ")
             .append("FROM ").append(newTable)
             .append(") combined_data");

        System.out.println("Generated Query: " + query.toString());

        // Mock database interaction
        QueryResponse response = new QueryResponse();
        
        // Add mock unique data
        HashSet<String> variableA = new HashSet<>();
        variableA.add("UniqueValueFromOldTable");
        variableA.add("UniqueValueFromNewTable");
        response.setVariableA(variableA);

        HashMap<String, String> results = new HashMap<>();
        results.put("OldTableKey", "OldTableResult");
        results.put("NewTableKey", "NewTableResult");
        response.setResults(results);

        return response;
    }
}
