package com.task.superMarketBilling.repository;

import com.task.superMarketBilling.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query("SELECT COUNT(b) FROM Bill b WHERE YEAR(b.billDate) = :year AND MONTH(b.billDate) = :month")
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT b FROM Bill b WHERE YEAR(b.billDate) = :year AND MONTH(b.billDate) = :month")
    List<Bill> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}