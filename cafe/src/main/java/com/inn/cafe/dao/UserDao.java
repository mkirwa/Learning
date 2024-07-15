package com.inn.cafe.dao;

import com.inn.cafe.wrapper.UserWrapper;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.inn.cafe.POJO.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserDao extends JpaRepository <User, Integer>{

    User findByEmailId(@Param("email") String email);

    List<UserWrapper> getAllUser();

    List<String> getAllAdmin();

    // To use update, you have to use transactional and modifying
    @Transactional
    @Modifying
    Integer updateStatus(@Param("status") String status, @Param("id") Integer id);

    // We don't need to implement this. It is already implemented in the background by JPA repository.
    // email has been defined in user POJO
    User findByEmail(String email);
}
