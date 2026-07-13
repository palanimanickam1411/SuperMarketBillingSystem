package com.task.superMarketBilling.service;

import com.task.superMarketBilling.entity.BillItem;
import com.task.superMarketBilling.repository.BillItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillItemService {

    private final BillItemRepository billItemRepository;

    public BillItemService(BillItemRepository billItemRepository) {
        this.billItemRepository = billItemRepository;
    }

    public BillItem addBillItem(BillItem billItem) {
        return billItemRepository.save(billItem);
    }

    public List<BillItem> getAllBillItems() {
        return billItemRepository.findAll();
    }

    public BillItem getBillItemById(Long id) {
        return billItemRepository.findById(id).orElse(null);
    }

    public void deleteBillItem(Long id) {
        billItemRepository.deleteById(id);
    }
}
