CREATE OR REPLACE FUNCTION is_duplicate(_id CHAR(14), _uid CHAR(32), _machine machine) RETURNS BOOLEAN
AS $$
#variable_conflict use_variable
DECLARE
	_present BOOLEAN;
	_time TIMESTAMP;
BEGIN
	SELECT count(1) > 0 INTO _present
		FROM teams
		WHERE teams.id = _id;
	
	IF _present = FALSE THEN
		RETURN true;
	END IF;
	
	SELECT machines.created_at INTO _time
		FROM machines
		WHERE machines.uid = _uid AND machines.id = _id;

	IF _time IS NULL THEN
		INSERT INTO machines VALUES (
			_id, _uid, NOW()
		);

		RETURN false;
	END IF;

	SELECT count(1) > 0, MAX(machines.created_at) INTO _present, _time
		FROM machines
		WHERE machines.uid = _uid AND machines.id = _id AND machines.created_at > _time;
	
	IF _present AND NOW() - _time < '300 sec'::interval THEN
		RETURN true;
	END IF;

	RETURN false;
END;
$$ LANGUAGE plpgsql;