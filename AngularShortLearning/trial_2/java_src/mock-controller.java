package com.example.demo.controller;

import com.example.demo.model.Metric;
import com.example.demo.model.QueryResponse;
import com.example.demo.service.MetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController // Marks this class as a RESTful controller
@RequestMapping(value = "/api/metrics") // Base URL for the controller
public class MetricController {

    @Autowired // Injects the MetricService dependency
    private MetricService metricService;

    /**
     * Endpoint to handle POST requests for metrics.
     * Consumes JSON input and produces JSON output.
     * 
     * @param metric A Metric object parsed from the request body.
     * @return A QueryResponse object as JSON.
     */
    @PostMapping(
        value = "/process",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public QueryResponse processMetrics(@RequestBody Metric metric) {
        // Pass the metric object to the service and return its response.
        return metricService.processMetric(metric);
    }
}

/*


*/