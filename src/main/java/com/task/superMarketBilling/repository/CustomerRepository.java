package com.task.superMarketBilling.repository;

import com.task.superMarketBilling.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

}