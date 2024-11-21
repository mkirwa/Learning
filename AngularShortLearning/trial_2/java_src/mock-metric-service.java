package com.example.demo.service;
/*
The service layer links the controller to the database. 
This is where the StringBuilder is used for dynamic query construction.
*/

import com.example.demo.model.Metric;
import com.example.demo.model.QueryResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;

@Service // Marks this as a Spring service
public class MetricService {

    /**
     * Processes the given Metric and constructs a QueryResponse.
     *
     * @param metric The Metric object received from the controller.
     * @return A QueryResponse object with mock data.
     */
    public QueryResponse processMetric(Metric metric) {
        // Example database table and column mapping
        String tableName = "intrinsic_candidate";
        String columnField1 = "field_1";
        String columnField2 = "field_2";

        // Build a dynamic query using StringBuilder
        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM ").append(tableName)
             .append(" WHERE ").append(columnField1).append(" = '").append(metric.getField1()).append("'")
             .append(" AND ").append(columnField2).append(" = '").append(metric.getField2()).append("'");

        System.out.println("Generated Query: " + query.toString());

        // Mock database interaction (replace with actual database query execution)
        QueryResponse response = new QueryResponse();
        HashSet<String> variableA = new HashSet<>();
        variableA.add("Value1");
        variableA.add("Value2");
        response.setVariableA(variableA);

        HashMap<String, String> results = new HashMap<>();
        results.put("key1", "result1");
        results.put("key2", "result2");
        response.setResults(results);

        return response;
    }
}
