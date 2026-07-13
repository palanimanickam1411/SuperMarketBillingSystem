package com.task.superMarketBilling.controller;

import com.task.superMarketBilling.entity.BillItem;
import com.task.superMarketBilling.service.BillItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill-items")
@CrossOrigin("*")
public class BillItemController {

    private final BillItemService billItemService;

    public BillItemController(BillItemService billItemService) {
        this.billItemService = billItemService;
    }

    @PostMapping
    public BillItem addBillItem(@RequestBody BillItem billItem) {
        return billItemService.addBillItem(billItem);
    }

    @GetMapping
    public List<BillItem> getAllBillItems() {
        return billItemService.getAllBillItems();
    }

    @GetMapping("/{id}")
    public BillItem getBillItemById(@PathVariable Long id) {
        return billItemService.getBillItemById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteBillItem(@PathVariable Long id) {
        billItemService.deleteBillItem(id);
    }
}
