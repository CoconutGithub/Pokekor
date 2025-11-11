package com.pokekor.pokekor.service;

import com.pokekor.pokekor.dto.RarityDTO;
import com.pokekor.pokekor.repository.RarityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RarityService {

    private final RarityRepository rarityRepository; //

    /**
     * 모든 레어도 목록을 DTO로 조회
     * @return List<RarityDTO>
     */
    public List<RarityDTO> getAllRarities() {
        // ID 기준 오름차순 정렬
        return rarityRepository.findAll(Sort.by(Sort.Direction.ASC, "rarityId")).stream()
                .map(RarityDTO::new)
                .collect(Collectors.toList());
    }
}
