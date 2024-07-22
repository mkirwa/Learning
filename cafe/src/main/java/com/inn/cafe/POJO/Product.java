package com.inn.cafe.POJO;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.io.Serializable;

// We are using  p.category.id, p.category.name as we can access these values from category object which has an id and name - refer to Category.class POJO.
@NamedQuery(name="Product.getAllProduct", query="select new com.inn.cafe.wrapper.ProductWrapper(p.id, p.name, p.description, p.price, p.status, p.category.id, p.category.name) from Product p")

@Data
@Entity
@DynamicUpdate
@DynamicInsert
@Table(name = "product")
public class Product implements Serializable {

    public static final long SerialVersionUID = 123456L;

    @Id
    // To make it autoincrement whenever a value is inserted
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    private String name;

    // You have one product and you need association between them
    // This books the reference between them like add pizza to another category
    // Many to one relationship because one category has many relationships
    // Multiple products can refer to one category
    // Fetchtype lazy means if you find a query to select all then it wont select all
    // If you specifically select this category, it will selecct data for that category
    @ManyToOne(fetch = FetchType.LAZY)
    // nullable is false as we don't want this field to be null
    // We want every product to be referencing some category
    @JoinColumn(name = "category_fk", nullable = false)
    private Category category;

    @Column(name = "description")
    private String description;

    @Column(name = "price")
    private Integer price;

    @Column(name = "status")
    private String status;

}
