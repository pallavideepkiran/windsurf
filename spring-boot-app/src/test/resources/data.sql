INSERT INTO dbo.card_data (id, client_id, card_brand, card_type, card_number, expires, cvv, has_chip, num_cards_issued, credit_limit, acct_open_date, year_pin_last_changed, card_on_dark_web)
VALUES
  (1, 100, 'VISA', 'CREDIT', '4111111111111111', DATE '2027-12-31', '123', TRUE, 2, 5000.00, DATE '2020-05-01', 2023, FALSE),
  (2, 101, 'MASTERCARD', 'DEBIT', '5555555555554444', DATE '2026-06-30', '456', FALSE, 1, 0.00, DATE '2019-03-15', 2022, FALSE),
  (3, 102, 'AMEX', 'CREDIT', '378282246310005', DATE '2028-01-31', '999', TRUE, 3, 15000.00, DATE '2018-11-20', 2021, TRUE);
