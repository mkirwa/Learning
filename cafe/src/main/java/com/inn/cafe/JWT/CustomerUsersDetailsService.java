package com.inn.cafe.JWT;

import com.inn.cafe.dao.UserDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Objects;

@Slf4j
@Service
public class CustomerUsersDetailsService implements UserDetailsService {

    @Autowired
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
