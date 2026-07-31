CREATE TABLE station (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    station_order INT NOT NULL UNIQUE
);
CREATE TABLE coach (
    id BIGSERIAL PRIMARY KEY,
    coach_number VARCHAR(20) NOT NULL,
    coach_type VARCHAR(20) NOT NULL
);
CREATE TABLE seat (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    CONSTRAINT fk_coach FOREIGN KEY(coach_id) REFERENCES coach(id)
);
CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    seat_id BIGINT NOT NULL,
    origin_station BIGINT NOT NULL,
    destination_station BIGINT NOT NULL,
    passenger_name VARCHAR(100),
    price NUMERIC(10, 2),
    booking_time TIMESTAMP,
    status VARCHAR(20),
    CONSTRAINT fk_seat FOREIGN KEY(seat_id) REFERENCES seat(id),
    CONSTRAINT fk_origin FOREIGN KEY(origin_station) REFERENCES station(id),
    CONSTRAINT fk_destination FOREIGN KEY(destination_station) REFERENCES station(id)
);