package com.example.entitlement.controller;

import com.example.entitlement.model.CardData;
import com.example.entitlement.service.CardDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/card-data")
public class CardDataController {

    private final CardDataService service;

    public CardDataController(CardDataService service) {
        this.service = service;
    }

    @GetMapping
    public List<CardData> list(@RequestParam(name = "cardType", required = false) String cardType) {
        return service.list(cardType);
    }
}
