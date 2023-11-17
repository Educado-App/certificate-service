module.exports = function makeFakeUser(email = 'fake@gmail.com', attempts = []) {
	return {
		email: email,
		password: 'ABC123456!',
		googleID: '1234567891011',
		joinedAt: new Date('2020-01-01'),
		dateUpdated: new Date('2020-01-01'),
		firstName: 'Fake first name',
		lastName: 'Fake last name',
		resetAttempts: attempts,
	};
};