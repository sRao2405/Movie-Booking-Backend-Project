package com.cfs.BMS.repository;

import com.cfs.BMS.entity.Theatre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TheatreRepository extends JpaRepository<Theatre, Long> {

    //List<Theatre> findByCityId(Long cityId);

    @Query("select t from Theatre t where t.city.id = :cityId")
    List<Theatre> findByCityId(@Param("cityId") Long cityId);
}
