package com.example.entitlement.service;

import com.example.entitlement.model.CardData;
import com.example.entitlement.repository.CardDataRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardDataService {

    private final CardDataRepository repository;

    public CardDataService(CardDataRepository repository) {
        this.repository = repository;
    }

    public List<CardData> list(String cardType) {
        if (cardType == null || cardType.isBlank()) {
            return repository.findAll();
        }
        return repository.findByCardType(cardType);
    }
}
