module.exports = (field, args = null) => {
	const errorCodes = {

		// General errors
		CE0000: {
			code: 'CE0000',
			message: 'Unknown error',
		},
		CE001: {
			code: 'CE0001',
			message: `Couldn't connect to database`,
		},
		CE002: {
			code: 'CE0002',
			message: `${args} not found`,
		},

		// Validation errors
		CE0100: {
			code: 'CE0100',
			message: `Field ${args} is required`,
		},
		CE0101: {
			code: 'CE0101',
			message: `Field ${args} must be a valid ObjectId`,
		},
		CE0102: {
			code: 'CE0102',
			message: `A certificate for this course and user already exists`,
		},

		// Authentication errors
		CE0200: {
			code: 'CE0200',
			message: `User not allowed to access all certificates. Use creatorId and courseId to get a specific certificate or creatorId to get all certificates from a creator`,
		},
	};

	return errorCodes[field];

};