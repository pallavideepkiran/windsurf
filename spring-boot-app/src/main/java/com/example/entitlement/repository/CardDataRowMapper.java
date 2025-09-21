package com.example.entitlement.repository;

import com.example.entitlement.model.CardData;
import org.springframework.jdbc.core.RowMapper;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;

public class CardDataRowMapper implements RowMapper<CardData> {
    @Override
    public CardData mapRow(ResultSet rs, int rowNum) throws SQLException {
        CardData cd = new CardData();
        cd.setId(getInteger(rs, "id"));
        cd.setClientId(getInteger(rs, "client_id"));
        cd.setCardBrand(rs.getString("card_brand"));
        cd.setCardType(rs.getString("card_type"));
        cd.setCardNumber(rs.getString("card_number"));
        cd.setExpires(getLocalDate(rs, "expires"));
        cd.setCvv(rs.getString("cvv"));
        cd.setHasChip(getBooleanObj(rs, "has_chip"));
        cd.setNumCardsIssued(getInteger(rs, "num_cards_issued"));
        cd.setCreditLimit(getBigDecimal(rs, "credit_limit"));
        cd.setAcctOpenDate(getLocalDate(rs, "acct_open_date"));
        cd.setYearPinLastChanged(getInteger(rs, "year_pin_last_changed"));
        cd.setCardOnDarkWeb(getBooleanObj(rs, "card_on_dark_web"));
        return cd;
    }

    private Integer getInteger(ResultSet rs, String column) throws SQLException {
        int val = rs.getInt(column);
        return rs.wasNull() ? null : val;
    }

    private Boolean getBooleanObj(ResultSet rs, String column) throws SQLException {
        boolean val = rs.getBoolean(column);
        return rs.wasNull() ? null : val;
    }

    private BigDecimal getBigDecimal(ResultSet rs, String column) throws SQLException {
        return rs.getBigDecimal(column);
    }

    private LocalDate getLocalDate(ResultSet rs, String column) throws SQLException {
        java.sql.Date d = rs.getDate(column);
        return d != null ? d.toLocalDate() : null;
    }
}
