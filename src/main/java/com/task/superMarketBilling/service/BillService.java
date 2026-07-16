package com.task.superMarketBilling.service;

import com.task.superMarketBilling.entity.Bill;
import com.task.superMarketBilling.repository.BillRepository;
import com.task.superMarketBilling.repository.BillItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;

    public BillService(BillRepository billRepository, BillItemRepository billItemRepository) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
    }

    public Bill createBill(Bill bill) {
        // Assign monthly invoice number: count of bills in same month + 1
        if (bill.getBillDate() != null) {
            int year  = bill.getBillDate().getYear();
            int month = bill.getBillDate().getMonthValue();
            long count = billRepository.countByYearAndMonth(year, month);
            bill.setMonthlyInvoiceNumber((int) count + 1);
        } else {
            bill.setMonthlyInvoiceNumber(1);
        }
        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
    }

    @Transactional
    public void deleteBill(Long id) {
        billItemRepository.deleteByBillId(id);
        billRepository.deleteById(id);
    }
}