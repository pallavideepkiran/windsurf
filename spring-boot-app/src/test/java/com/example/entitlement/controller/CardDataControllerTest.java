package com.example.entitlement.controller;

import com.example.entitlement.model.CardData;
import com.example.entitlement.service.CardDataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CardDataController.class)
class CardDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CardDataService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void list_returnsAll_whenNoFilter() throws Exception {
        CardData a = new CardData(); a.setId(1); a.setCardType("CREDIT");
        CardData b = new CardData(); b.setId(2); b.setCardType("DEBIT");
        given(service.list(null)).willReturn(List.of(a, b));

        mockMvc.perform(get("/api/card-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[1].id", is(2)));
    }

    @Test
    void list_filtersByCardType() throws Exception {
        CardData a = new CardData(); a.setId(1); a.setCardType("CREDIT");
        given(service.list("CREDIT")).willReturn(List.of(a));

        mockMvc.perform(get("/api/card-data").param("cardType", "CREDIT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].cardType", is("CREDIT")));
    }

    @Test
    void create_returns201_onSuccess() throws Exception {
        CardData req = new CardData();
        req.setId(10);
        req.setClientId(200);
        req.setCardBrand("VISA");
        req.setCardType("CREDIT");
        req.setCardNumber("4111111111111111");
        req.setExpires(LocalDate.of(2027, 12, 31));
        req.setCvv("123");
        req.setHasChip(true);
        req.setNumCardsIssued(1);
        req.setCreditLimit(new BigDecimal("1000.00"));
        req.setAcctOpenDate(LocalDate.of(2020, 1, 1));
        req.setYearPinLastChanged(2023);
        req.setCardOnDarkWeb(false);

        given(service.create(any(CardData.class))).willReturn(1);

        mockMvc.perform(post("/api/card-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.cardType", is("CREDIT")));
    }

    @Test
    void create_returns400_onFailure() throws Exception {
        CardData req = new CardData(); req.setId(10);
        given(service.create(any(CardData.class))).willReturn(0);

        mockMvc.perform(post("/api/card-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returns204_whenDeleted() throws Exception {
        given(service.deleteById(eq(5))).willReturn(true);
        mockMvc.perform(delete("/api/card-data/5"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_returns404_whenNotFound() throws Exception {
        given(service.deleteById(eq(5))).willReturn(false);
        mockMvc.perform(delete("/api/card-data/5"))
                .andExpect(status().isNotFound());
    }
}
