package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.dto.RarityDTO;
import com.pokekor.pokekor.service.RarityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rarities") // 레어도 관련 API
@RequiredArgsConstructor
public class RarityController {

    private final RarityService rarityService;

    /**
     * 전체 레어도 목록 조회 API
     * GET /api/rarities
     */
    @GetMapping
    public ResponseEntity<List<RarityDTO>> getAllRarities() {
        List<RarityDTO> rarities = rarityService.getAllRarities();
        return ResponseEntity.ok(rarities);
    }
}