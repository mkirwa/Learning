package com.inn.cafe.JWT;

// Imports the UserDao interface for interacting with user data in the database
import com.inn.cafe.dao.UserDao;
// Imports the Slf4j annotation for logging
import lombok.extern.slf4j.Slf4j;
// Imports the Autowired annotation for dependency injection
import org.springframework.beans.factory.annotation.Autowired;
// Imports the User class from Spring Security for representing user details
import org.springframework.security.core.userdetails.User;
// Imports the UserDetailsService interface from Spring Security
import org.springframework.security.core.userdetails.UserDetailsService;
// Imports the UserDetails interface from Spring Security
import org.springframework.security.core.userdetails.UserDetails;
// Imports the UsernameNotFoundException class from Spring Security for handling user not found scenarios
import org.springframework.security.core.userdetails.UsernameNotFoundException;
// Imports the Service annotation to mark this class as a Spring service
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Objects;

@Slf4j  // Enables logging for this class
@Service // Marks this class as a service component in Spring
public class CustomerUsersDetailsService implements UserDetailsService {

    @Autowired // Injects the UserDao dependency
    UserDao userDao;

    // Creating a user bean of type com.inn.cafe
    private com.inn.cafe.POJO.User userDetail;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        log.info("Inside LoadUserByUserName{}", username);
        // If a user with that user detail exists then fetch complete data
        // If not then the object will be null
        userDetail = userDao.findByEmailId(username);
        if(!Objects.isNull(userDetail))
                return new User(userDetail.getEmail(),userDetail.getPassword(),new ArrayList<>());
        else
            throw new UsernameNotFoundException("User not found.");
    }

    // Write another function that is going to return the user detail if we might need it
    public com.inn.cafe.POJO.User getUserDetail(){
        return userDetail;
    }

}
