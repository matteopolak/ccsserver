export const SubmitSchema: any = {
	body: {
		type: 'object',
		required: ['id', 'flag', 'removed'],
		properties: {
			id: { type: 'string', maxLength: 14, minLength: 14 },
			flag: { type: 'string', maxLength: 128, minLength: 128 },
			removed: { type: 'boolean' }
		}
	}
};

export type SubmitBody = {
	id: string,
	flag: string,
	removed: boolean
};

export const ScoreSchema: any = {
	querystring: {
		type: 'object',
		required: ['id', 'machine'],
		properties: {
			id: { type: 'string', maxLength: 14, minLength: 14 },
			machine: { type: 'string', maxLength: 16, minLength: 5 }
		}
	}
};

export type ScoreBody = {
	id: string,
	machine: string
};

export const TeamSchema: any = {
	querystring: {
		type: 'object',
		required: ['number'],
		properties: {
			number: { type: 'number', min: 1000, max: 10000 }
		}
	}
};

export type TeamBody = {
	number: string
};

export const PingSchema: any = {
	querystring: {
		type: 'object',
		required: ['id', 'uid', 'machine'],
		properties: {
			id: { type: 'string', maxLength: 14, minLength: 14 },
			uid: { type: 'string', maxLength: 36, minLength: 32 },
			machine: { type: 'string', maxLength: 16, minLength: 5 }
		}
	}
};

export type PingBody = {
	id: string,
	uid: string,
	machine: string
};