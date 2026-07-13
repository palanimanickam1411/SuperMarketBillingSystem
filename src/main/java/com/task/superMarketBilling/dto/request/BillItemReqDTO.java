package com.task.superMarketBilling.dto.request;

public class BillItemReqDTO {

    private Long billId;
    private Long productId;
    private int quantity;
    private double price;

    public BillItemReqDTO() {
    }

    public BillItemReqDTO(Long billId, Long productId, int quantity, double price) {
        this.billId = billId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
