CREATE OR REPLACE FUNCTION submit_flag(_id CHAR(14), _flag CHAR(128), _removed BOOLEAN) RETURNS SMALLINT
AS $$
#variable_conflict use_variable
DECLARE
	_present BOOLEAN;
	_machine machine;
	_points SMALLINT;
	_change SMALLINT;
BEGIN
	SELECT count(1) > 0 INTO _present
		FROM teams
		WHERE teams.id = _id;
	
	IF _present = FALSE THEN
		RETURN 0;
	END IF;
	
	SELECT flags.machine, flags.points INTO _machine, _points
		FROM flags
		WHERE flags.hash = _flag;
	
	IF _machine IS NULL THEN
		RETURN 0;
	END IF;
	
	SELECT points.change INTO _change
		FROM points
		WHERE points.hash = _flag
		ORDER BY time DESC
		LIMIT 1;

	_present := _change IS NULL OR (_removed = FALSE AND _change = -_points) OR (_removed = TRUE AND _change = _points);
	
	IF _present = FALSE THEN
		RETURN 0;
	END IF;
	
	IF _removed = FALSE THEN
		INSERT INTO points VALUES (
			_points, _machine, NOW(), _flag, _id
		);

		IF _points >= 0 THEN
			RETURN 1;
		ELSE
			RETURN -1;
		END IF;
	ELSE
		INSERT INTO points VALUES (
			-_points, _machine, NOW(), _flag, _id
		);

		IF _points < 0 THEN
			RETURN 1;
		ELSE
			RETURN -1;
		END IF;
	END IF;
END;
$$ LANGUAGE plpgsql;