package com.inn.cafe.wrapper;
// com.inn.cafe.wrapper.ProductWrapper -> complete path for the POJO select db query
import lombok.Data;

@Data
// Class to specify which key and columns we want to return values from
public class ProductWrapper {

    Integer id;
    String name;
    String description;
    Integer price;
    String status;
    Integer categoryId;
    String categoryName;

    public ProductWrapper(){

    }

    // Creating a constructor for the @NamedQuery in product POJO class
    // Follows all the arguments in the query
    // --> @NamedQuery(name="Product.getAllProduct",
    // query="select new com.inn.cafe.wrapper.ProductWrapper(p.id, p.name, p.description, p.price, p.status, p.category.id, p.category.name) from Product p")
    // They have to follow the same format otherwise if the values are different you'll get mismatch
    public ProductWrapper(Integer id, String name, String description, Integer price, String status,
                          Integer categoryId, String categoryName){
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.status = status;
        this.categoryId = categoryId;
        this.categoryName = categoryName;

    }

}
