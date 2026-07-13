package com.task.superMarketBilling.dto.request;

public class CategoryReqDTO {

    private String categoryName;

    public CategoryReqDTO() {
    }

    public CategoryReqDTO(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}