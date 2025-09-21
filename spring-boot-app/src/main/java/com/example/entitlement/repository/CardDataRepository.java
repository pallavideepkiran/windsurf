package com.example.entitlement.repository;

import com.example.entitlement.model.CardData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CardDataRepository {

    private final JdbcTemplate jdbcTemplate;
    private final String schema;
    private final CardDataRowMapper rowMapper = new CardDataRowMapper();

    public CardDataRepository(JdbcTemplate jdbcTemplate,
                              @Value("${app.card-data.schema:dbo}") String schema) {
        this.jdbcTemplate = jdbcTemplate;
        this.schema = schema;
    }

    private String baseSelect() {
        return "SELECT id, client_id, card_brand, card_type, card_number, expires, cvv, has_chip, " +
                "num_cards_issued, credit_limit, acct_open_date, year_pin_last_changed, card_on_dark_web " +
                "FROM " + schema + ".card_data";
    }

    public List<CardData> findAll() {
        String sql = baseSelect();
        return jdbcTemplate.query(sql, rowMapper);
    }

    public List<CardData> findByCardType(String cardType) {
        String sql = baseSelect() + " WHERE card_type = ?";
        return jdbcTemplate.query(sql, rowMapper, cardType);
    }
}
