package com.inn.cafe.POJO;

import jakarta.persistence.*;
import jdk.jfr.Name;
import lombok.Data;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.io.Serializable;

// C has to be capital because Category is from the public class declared below.
// select p.category from Product p where p.status='true" -> Extact all categories that exist in a product where the product status is true
// If you have a product whose status is true, it will extract that one
@NamedQuery(name="Category.getAllCategory", query = "select c from Category c where c.id in (select p.category.id from Product p where p.status='true')")

@Data
@Entity
@DynamicUpdate
@DynamicInsert
@Table(name = "category")

public class Category implements Serializable {
    private static final long serialVersionUID=1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Integer id;

    @Column(name="name")
    private String name;
}
