package com.task.superMarketBilling.dto.request;

public class CategoryReqDTO {

    private String categoryName;
    private double gstRate;

    public CategoryReqDTO() {
    }

    public CategoryReqDTO(String categoryName, double gstRate) {
        this.categoryName = categoryName;
        this.gstRate = gstRate;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public double getGstRate() {
        return gstRate;
    }

    public void setGstRate(double gstRate) {
        this.gstRate = gstRate;
    }
}