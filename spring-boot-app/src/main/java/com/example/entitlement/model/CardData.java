package com.example.entitlement.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CardData {
    private Integer id;
    private Integer clientId;
    private String cardBrand;
    private String cardType;
    private String cardNumber;
    private LocalDate expires;
    private String cvv;
    private Boolean hasChip;
    private Integer numCardsIssued;
    private BigDecimal creditLimit;
    private LocalDate acctOpenDate;
    private Integer yearPinLastChanged;
    private Boolean cardOnDarkWeb;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getClientId() { return clientId; }
    public void setClientId(Integer clientId) { this.clientId = clientId; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public LocalDate getExpires() { return expires; }
    public void setExpires(LocalDate expires) { this.expires = expires; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public Boolean getHasChip() { return hasChip; }
    public void setHasChip(Boolean hasChip) { this.hasChip = hasChip; }

    public Integer getNumCardsIssued() { return numCardsIssued; }
    public void setNumCardsIssued(Integer numCardsIssued) { this.numCardsIssued = numCardsIssued; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public LocalDate getAcctOpenDate() { return acctOpenDate; }
    public void setAcctOpenDate(LocalDate acctOpenDate) { this.acctOpenDate = acctOpenDate; }

    public Integer getYearPinLastChanged() { return yearPinLastChanged; }
    public void setYearPinLastChanged(Integer yearPinLastChanged) { this.yearPinLastChanged = yearPinLastChanged; }

    public Boolean getCardOnDarkWeb() { return cardOnDarkWeb; }
    public void setCardOnDarkWeb(Boolean cardOnDarkWeb) { this.cardOnDarkWeb = cardOnDarkWeb; }
}
