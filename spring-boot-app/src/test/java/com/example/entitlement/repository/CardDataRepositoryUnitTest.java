package com.example.entitlement.repository;

import com.example.entitlement.model.CardData;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CardDataRepositoryUnitTest {

    @Mock
    JdbcTemplate jdbcTemplate;

    // We cannot use @InjectMocks because CardDataRepository has a non-default constructor
    // with a schema value. We'll manually construct it with schema "dbo".
    private CardDataRepository repository;

    private CardDataRepository repo() {
        if (repository == null) {
            repository = new CardDataRepository(jdbcTemplate, "dbo");
        }
        return repository;
    }

    @Test
    void findAll_buildsSelectAgainstSchema() {
        given(jdbcTemplate.query(anyString(), any(CardDataRowMapper.class)))
                .willReturn(List.of(new CardData()));

        List<CardData> result = repo().findAll();

        assertThat(result).hasSize(1);
        verify(jdbcTemplate).query(startsWith("SELECT id, client_id"), any(CardDataRowMapper.class));
    }

    @Test
    void findByCardType_appendsWhereAndBindsParam() {
        given(jdbcTemplate.query(anyString(), any(CardDataRowMapper.class), any()))
                .willReturn(List.of(new CardData()));

        List<CardData> result = repo().findByCardType("CREDIT");

        assertThat(result).hasSize(1);
        verify(jdbcTemplate).query(
                argThat(sql -> sql.contains("FROM dbo.card_data") && sql.contains("WHERE card_type = ?")),
                any(CardDataRowMapper.class),
                eq("CREDIT")
        );
    }

    @Test
    void insert_callsUpdateWithAllParams() {
        when(jdbcTemplate.update(
                anyString(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenReturn(1);

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

        int rows = repo().insert(cd);
        assertThat(rows).isEqualTo(1);

        verify(jdbcTemplate).update(
                argThat(sql -> sql.startsWith("INSERT INTO dbo.card_data") && sql.contains("VALUES (")),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void deleteById_executesDelete() {
        when(jdbcTemplate.update(anyString(), eq(5))).thenReturn(1);

        int rows = repo().deleteById(5);
        assertThat(rows).isEqualTo(1);

        verify(jdbcTemplate).update(
                argThat(sql -> sql.contains("DELETE FROM dbo.card_data WHERE id = ?")),
                eq(5)
        );
    }
}
