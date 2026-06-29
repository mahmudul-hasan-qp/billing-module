CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(255) PRIMARY KEY,
    discount_amount DECIMAL(10, 2) NOT NULL,
    expiry_date DATETIME NULL,
    is_third_party BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_coupons (
    user_id VARCHAR(255),
    coupon_code VARCHAR(255),
    PRIMARY KEY (user_id, coupon_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE CASCADE
);

INSERT INTO users (id, name) 
VALUES ('usr_123', 'Mahmudul Hasan');

INSERT INTO coupons (code, discount_amount, expiry_date, is_third_party) 
VALUES 
('SUMMER50', 15.00, '2027-12-31 23:59:59', FALSE), 
('WELCOME10', 10.00, '2027-12-31 23:59:59', FALSE),
('EXPIRED99', 99.00, '2020-01-01 00:00:00', FALSE),
('PARTNER30', 30.00, NULL, TRUE);

INSERT INTO user_coupons (user_id, coupon_code) 
VALUES 
('usr_123', 'SUMMER50'),
('usr_123', 'WELCOME10'),
('usr_123', 'EXPIRED99'),
('usr_123', 'PARTNER30');