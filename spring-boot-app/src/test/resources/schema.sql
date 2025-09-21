CREATE SCHEMA IF NOT EXISTS dbo;

CREATE TABLE IF NOT EXISTS dbo.card_data (
    id INT PRIMARY KEY,
    client_id INT NOT NULL,
    card_brand VARCHAR(50),
    card_type VARCHAR(50),
    card_number VARCHAR(20),
    expires DATE,
    cvv VARCHAR(4),
    has_chip BOOLEAN,
    num_cards_issued INT,
    credit_limit NUMERIC(12, 2),
    acct_open_date DATE,
    year_pin_last_changed INT,
    card_on_dark_web BOOLEAN
);
