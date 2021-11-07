import fastify from 'fastify';
import cors from 'fastify-cors';
import pg from 'pg';

import {
	SubmitSchema, SubmitBody,
	ScoreSchema, ScoreBody,
	TeamSchema, TeamBody,
	PingSchema, PingBody
} from './schemas.js';

const PORT: number = 3000;
const LOG_PREFIX = '[ \x1b[36m\x1b[1mAPI\x1b[0m ]';

const pool = new pg.Pool({
	user: process.env.DATABASE_USER ?? 'postgres',
	host: process.env.DATABASE_HOST ?? 'localhost',
	port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5432,
	database: process.env.DATABASE_NAME ?? 'cyberpatriot',
	password: process.env.DATABASE_PASSWORD ?? 'root'
});

const server = fastify({
	logger: true
}).register(cors, { 
  origin: true
});

await pool.connect();

server.get('/team', {
	schema: TeamSchema
}, async request => {
	const data = request.query as TeamBody;

	const { rows } = await pool.query<{ change: number, machine: string, time: number }>(`
		SELECT points.change, points.machine, points.time
			FROM teams
			JOIN points
				ON teams.id = points.id
			WHERE teams.number = $1
			ORDER BY points.time ASC;
	`, [ data.number ]);

	return rows;
})

server.get('/score', {
	schema: ScoreSchema
}, async request => {
	const data = request.query as ScoreBody;
	
	const { rows } = await pool.query<{ points: number, description: string }>(`
		SELECT CAST(SUM(points.change) AS SMALLINT) AS points, flags.description
			FROM points
			JOIN flags
				ON flags.hash = points.hash
			WHERE points.id = $1 AND points.machine = $2
			GROUP BY points.hash, points.machine, flags.description
			ORDER BY MAX(points.time);
	`, [ data.id, data.machine ]);

	return rows.filter(r => r.points !== 0);
});

server.get('/leaderboard', async () => {
	const { rows } = await pool.query<{ number: number, total: number }>(`
		SELECT number, total
			FROM leaderboard
			ORDER BY total DESC;
	`);

	return rows;
});

server.put('/submit', {
	schema: SubmitSchema
}, async (request, response) => {
	const data = request.body as SubmitBody;

	const { rows } = await pool.query<{ submit_flag: 1 | -1 | 0 }>(`
		SELECT submit_flag($1, $2, $3);
	`, [ data.id, data.flag, data.removed ]);

	const change = rows[0].submit_flag;

	console.log(`${LOG_PREFIX} Team \x1b[35m\x1b[1m${data.id}\x1b[0m has submitted \x1b[33m\x1b[1m${data.flag}\x1b[0m (${change < 0 ? '\x1b[31m\x1b[1mloss' : change > 0 ? '\x1b[32m\x1b[1mgain' : '\x1b[37m\x1b[1mno change'}\x1b[0m)`);

	return response
		.status(
			change === 0 ? 204 :
			change > 0 ? 202 :
			205
		)
		.send('');
});

server.head('/ping', {
	schema: PingSchema
}, async (request, response) => {
	const data = request.query as PingBody;
	const uid = data.uid.replaceAll('-', '');

	const { rows } = await pool.query<{ is_duplicate: boolean }>(`
		SELECT is_duplicate($1, $2, $3);
	`, [ data.id, uid, data.machine ]);

	const duplicate = rows[0].is_duplicate;

	console.log(`${LOG_PREFIX} \x1b[35m\x1b[1m${uid}\x1b[0m (\x1b[1m${data.machine}\x1b[0m) for team \x1b[35m\x1b[1m${data.id}\x1b[0m has pinged (${duplicate ? '\x1b[31m\x1b[1mduplicate' : '\x1b[32m\x1b[1munique'}\x1b[0m)`);

	if (!duplicate)
		return '';

	return response
		.status(403)
		.send('');
});

server.listen(PORT, '0.0.0.0', (err, address) => {
	if (err)
		throw err;

	return console.log(`Listening on ${address}`);
});