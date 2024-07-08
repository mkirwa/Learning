package com.inn.cafe.wrapper;


import lombok.Data;

@Data // Automatically generate getters and setters for this class

// This is a wrapper class used by UserRest implementations.,
// Gets the details in the database and updates them in UserRest
// Sat should be set to this wrapper... for each user there is one wrapper.
// Data needs to be set to the list of user wrappers in ... will be done in user rest
public class UserWrapper {

    // Not needed just for reference purpose
    // UserWrapper user = new UserWrapper(1,"abc","abc@gmail.com", "5654", "false");

    private Integer id;

    private String name;

    private String email;

    private String contactNumber;

    private String status;

    // Constructor to be used for the query
    public UserWrapper(Integer id, String name, String email, String contactNumber, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.contactNumber = contactNumber;
        this.status = status;
    }
}
