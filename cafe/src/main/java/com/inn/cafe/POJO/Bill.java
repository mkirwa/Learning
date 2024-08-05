package com.inn.cafe.POJO;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.io.Serializable;

@NamedQuery(name="Bill.getAllBills", query = "select b from Bill b order by b.id desc")
@NamedQuery(name="Bill.getBillsByUserName", query =  "")

@Data
@Entity
@DynamicUpdate
@DynamicInsert
@Table(name = "bill")

public class Bill implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    // Building UUID
    @Column(name = "uuid")
    private String uuid;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    // we are saving contact number as contactnummber as opposed to contactNumber as saving it as contactNumber
    // will revert it to contact_number in the database.
    @Column(name = "contactnumber")
    private String contactNumber;

    @Column(name = "paymentmethod")
    private String paymentMethod;

    @Column(name = "total")
    private Integer total;

    // We need to store all data that has been purchased in form of json format
    @Column(name = "productdetails", columnDefinition = "json")
    private String productDetails;

    @Column(name = "createdby")
    private String createdBy;

}
