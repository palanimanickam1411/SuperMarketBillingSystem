package com.task.superMarketBilling.dto.request;

import java.time.LocalDate;

public class BillReqDTO {

    private LocalDate billDate;
    private double totalAmount;
    private String customerName;
    private String customerPhone;

    public BillReqDTO() {
    }

    public BillReqDTO(LocalDate billDate, double totalAmount, String customerName, String customerPhone) {
        this.billDate = billDate;
        this.totalAmount = totalAmount;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
    }

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
}