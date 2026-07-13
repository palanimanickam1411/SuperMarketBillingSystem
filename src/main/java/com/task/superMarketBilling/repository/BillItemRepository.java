package com.task.superMarketBilling.repository;

import com.task.superMarketBilling.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {

}