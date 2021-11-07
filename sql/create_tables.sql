CREATE TABLE IF NOT EXISTS flags (
	hash CHAR(128) NOT NULL PRIMARY KEY,
	description TEXT NOT NULL,
	points SMALLINT NOT NULL,
	machine machine NOT NULL,
	penalty BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS machines (
	id CHAR(14) NOT NULL,
	uid CHAR(32) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	machine machine NOT NULL,
	PRIMARY KEY(id, uid)
);

CREATE TABLE IF NOT EXISTS points (
	change SMALLINT NOT NULL,
	machine machine NOT NULL,
	time TIMESTAMP NOT NULL,
	hash CHAR(128) NOT NULL,
	id CHAR(14) NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
	id CHAR(14) NOT NULL PRIMARY KEY,
	number SMALLINT NOT NULL
);

CREATE OR REPLACE VIEW leaderboard AS
	SELECT teams.number,
    sum(points.change)::smallint AS total
   FROM teams
     JOIN points ON teams.id = points.id
  GROUP BY teams.number
  ORDER BY (sum(points.change)) DESC;