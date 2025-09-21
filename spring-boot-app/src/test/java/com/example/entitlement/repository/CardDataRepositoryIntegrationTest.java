package com.example.entitlement.repository;

import com.example.entitlement.model.CardData;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@JdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import(CardDataRepository.class)
class CardDataRepositoryIntegrationTest {

    @Autowired
    private CardDataRepository repository;

    @Test
    void findAll_returnsAllRows() {
        List<CardData> all = repository.findAll();
        assertThat(all).hasSize(3);
    }

    @Test
    void findByCardType_filtersCorrectly() {
        List<CardData> credit = repository.findByCardType("CREDIT");
        assertThat(credit).extracting(CardData::getCardType).containsOnly("CREDIT");
    }

    @Test
    void insert_insertsRow() {
        CardData cd = new CardData();
        cd.setId(10);
        cd.setClientId(200);
        cd.setCardBrand("DISCOVER");
        cd.setCardType("CREDIT");
        cd.setCardNumber("6011111111111117");
        cd.setExpires(LocalDate.of(2029, 12, 31));
        cd.setCvv("321");
        cd.setHasChip(true);
        cd.setNumCardsIssued(1);
        cd.setCreditLimit(new BigDecimal("2000.00"));
        cd.setAcctOpenDate(LocalDate.of(2021, 1, 1));
        cd.setYearPinLastChanged(2024);
        cd.setCardOnDarkWeb(false);

        int rows = repository.insert(cd);
        assertThat(rows).isEqualTo(1);

        List<CardData> all = repository.findAll();
        assertThat(all).hasSize(4);
        assertThat(all).anyMatch(r -> r.getId() == 10 && "DISCOVER".equals(r.getCardBrand()));
    }

    @Test
    void deleteById_deletesRow_whenExists() {
        int rows = repository.deleteById(1);
        assertThat(rows).isEqualTo(1);
        assertThat(repository.findAll()).hasSize(2);
    }

    @Test
    void deleteById_returnsZero_whenNotExists() {
        int rows = repository.deleteById(9999);
        assertThat(rows).isEqualTo(0);
    }
}
