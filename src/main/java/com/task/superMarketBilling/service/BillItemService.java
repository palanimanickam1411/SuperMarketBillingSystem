package com.task.superMarketBilling.service;

import com.task.superMarketBilling.dto.request.BillItemReqDTO;
import com.task.superMarketBilling.entity.Bill;
import com.task.superMarketBilling.entity.BillItem;
import com.task.superMarketBilling.entity.Product;
import com.task.superMarketBilling.repository.BillItemRepository;
import com.task.superMarketBilling.repository.BillRepository;
import com.task.superMarketBilling.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillItemService {

    private final BillItemRepository billItemRepository;
    private final BillRepository billRepository;
    private final ProductRepository productRepository;

    public BillItemService(BillItemRepository billItemRepository,
                           BillRepository billRepository,
                           ProductRepository productRepository) {
        this.billItemRepository = billItemRepository;
        this.billRepository = billRepository;
        this.productRepository = productRepository;
    }

    public BillItem addBillItem(BillItemReqDTO dto) {
        Bill bill = billRepository.findById(dto.getBillId())
                .orElseThrow(() -> new RuntimeException("Bill not found: " + dto.getBillId()));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

        BillItem item = new BillItem();
        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        item.setBill(bill);
        item.setProduct(product);
        return billItemRepository.save(item);
    }

    public List<BillItem> getAllBillItems() {
        return billItemRepository.findAll();
    }

    public BillItem getBillItemById(Long id) {
        return billItemRepository.findById(id).orElse(null);
    }

    public List<BillItem> getItemsByBillId(Long billId) {
        return billItemRepository.findByBillId(billId);
    }

    public void deleteBillItem(Long id) {
        billItemRepository.deleteById(id);
    }
}
