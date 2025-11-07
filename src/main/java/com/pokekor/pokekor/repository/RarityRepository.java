package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RarityRepository extends JpaRepository<Rarity, String> {
}
