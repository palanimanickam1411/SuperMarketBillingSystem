package com.task.superMarketBilling.repository;

import com.task.superMarketBilling.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {

}