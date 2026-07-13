package com.task.superMarketBilling.repository;

import com.task.superMarketBilling.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

}