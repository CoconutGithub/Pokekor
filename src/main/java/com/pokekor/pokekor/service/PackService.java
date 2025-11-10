package com.pokekor.pokekor.service;

import com.pokekor.pokekor.dto.PackDTO;
import com.pokekor.pokekor.repository.PackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackService {

    private final PackRepository packRepository;

    /**
     * 모든 팩 목록을 DTO로 조회
     * (출시일(releaseDate) 기준으로 정렬)
     * @return List<PackDTO>
     */
    public List<PackDTO> getAllPacks() {
        return packRepository.findAll().stream()
                .sorted((p1, p2) -> {
                    if (p1.getReleaseDate() == null) return 1;
                    if (p2.getReleaseDate() == null) return -1;
                    return p1.getReleaseDate().compareTo(p2.getReleaseDate());
                })
                .map(PackDTO::new)
                .collect(Collectors.toList());
    }
}
