package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
/*
This class represents the input model with annotated JSON properties for form values.

java
Copy code
*/

public class Metric {

    @JsonProperty("field1") // Maps JSON property "field1" to this variable
    private String field1;

    @JsonProperty("field2") // Maps JSON property "field2" to this variable
    private String field2;

    // Getters and Setters
    public String getField1() {
        return field1;
    }

    public void setField1(String field1) {
        this.field1 = field1;
    }

    public String getField2() {
        return field2;
    }

    public void setField2(String field2) {
        this.field2 = field2;
    }
}

