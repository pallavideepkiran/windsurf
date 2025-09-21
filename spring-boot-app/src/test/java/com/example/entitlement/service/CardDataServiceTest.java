package com.example.entitlement.service;

import com.example.entitlement.model.CardData;
import com.example.entitlement.repository.CardDataRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardDataServiceTest {

    @Mock
    private CardDataRepository repository;

    @InjectMocks
    private CardDataService service;

    @Test
    void list_callsFindAll_whenNoCardType() {
        when(repository.findAll()).thenReturn(List.of(new CardData()));

        List<CardData> result = service.list(null);

        assertThat(result).hasSize(1);
        verify(repository, times(1)).findAll();
        verify(repository, never()).findByCardType(any());
    }

    @Test
    void list_callsFindByCardType_whenProvided() {
        when(repository.findByCardType("CREDIT")).thenReturn(List.of(new CardData()));

        List<CardData> result = service.list("CREDIT");

        assertThat(result).hasSize(1);
        verify(repository, times(1)).findByCardType(eq("CREDIT"));
        verify(repository, never()).findAll();
    }

    @Test
    void create_delegatesToRepository() {
        when(repository.insert(any())).thenReturn(1);
        int rows = service.create(new CardData());
        assertThat(rows).isEqualTo(1);
        verify(repository).insert(any());
    }

    @Test
    void deleteById_returnsTrue_whenRowsAffected() {
        when(repository.deleteById(5)).thenReturn(1);
        assertThat(service.deleteById(5)).isTrue();
        verify(repository).deleteById(5);
    }

    @Test
    void deleteById_returnsFalse_whenNoRowsAffected() {
        when(repository.deleteById(5)).thenReturn(0);
        assertThat(service.deleteById(5)).isFalse();
        verify(repository).deleteById(5);
    }
}
