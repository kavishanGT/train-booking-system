INSERT INTO station(name, station_order)
VALUES ('Colombo Fort', 0),
    ('Polgahawela', 1),
    ('Peradeniya', 2),
    ('Kandy', 3),
    ('Nawalapitiya', 4),
    ('Hatton', 5),
    ('Nanu Oya', 6),
    ('Haputale', 7),
    ('Ella', 8),
    ('Badulla', 9);
INSERT INTO coach(coach_number, coach_type)
VALUES ('R1', 'RESERVED'),
    ('R2', 'RESERVED'),
    ('R3', 'RESERVED');
INSERT INTO seat(coach_id, seat_number)
VALUES (1, 'A1'),
    (1, 'A2'),
    (1, 'A3'),
    (1, 'A4'),
    (2, 'A1'),
    (2, 'A2'),
    (2, 'A3'),
    (3, 'A1'),
    (3, 'A2');