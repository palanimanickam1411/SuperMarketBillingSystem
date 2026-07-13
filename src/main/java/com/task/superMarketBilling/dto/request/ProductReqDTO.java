package com.task.superMarketBilling.dto.request;

public class ProductReqDTO {

    private String productName;
    private double price;
    private int quantity;
    private Long categoryId;

    public ProductReqDTO() {
    }

    public ProductReqDTO(String productName, double price, int quantity, Long categoryId) {
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.categoryId = categoryId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}