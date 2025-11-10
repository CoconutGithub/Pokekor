package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.dto.PackDTO;
import com.pokekor.pokekor.service.PackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/packs") // 팩 관련 API
@RequiredArgsConstructor
public class PackController {

    private final PackService packService;

    /**
     * 전체 팩 목록 조회 API
     * GET /api/packs
     */
    @GetMapping
    public ResponseEntity<List<PackDTO>> getAllPacks() {
        List<PackDTO> packs = packService.getAllPacks();
        return ResponseEntity.ok(packs);
    }
}