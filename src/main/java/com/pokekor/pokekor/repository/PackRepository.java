package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.Pack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackRepository extends JpaRepository<Pack, Long> {

}
