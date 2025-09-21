package com.example.entitlement.controller;

import com.example.entitlement.model.CardData;
import com.example.entitlement.service.CardDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<CardData> create(@RequestBody CardData cardData) {
        int rows = service.create(cardData);
        if (rows == 1) {
            return ResponseEntity.status(HttpStatus.CREATED).body(cardData);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        boolean deleted = service.deleteById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
