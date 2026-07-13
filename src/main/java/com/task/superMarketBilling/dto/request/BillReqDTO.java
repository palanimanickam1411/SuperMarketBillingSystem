package com.task.superMarketBilling.dto.request;

import java.time.LocalDate;

public class BillReqDTO {

    private LocalDate billDate;
    private double totalAmount;
    private Long customerId;

    public BillReqDTO() {
    }

    public BillReqDTO(LocalDate billDate, double totalAmount, Long customerId) {
        this.billDate = billDate;
        this.totalAmount = totalAmount;
        this.customerId = customerId;
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}