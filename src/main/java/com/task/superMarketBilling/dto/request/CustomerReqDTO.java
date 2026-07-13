package com.task.superMarketBilling.dto.request;

public class CustomerReqDTO {

    private String customerName;
    private String phone;

    public CustomerReqDTO() {
    }

    public CustomerReqDTO(String customerName, String phone) {
        this.customerName = customerName;
        this.phone = phone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}