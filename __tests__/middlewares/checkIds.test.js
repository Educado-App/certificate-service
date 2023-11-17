const mongoose = require('mongoose');
const checkIds = require('../../middlewares/checkIds');


describe('checkIds middleware', () => {
	it('Calls next if ids are valid', async () => {
		const req = {
			body: {
				creatorId: new mongoose.Types.ObjectId(),
				courseId: new mongoose.Types.ObjectId(),
				name: 'test',
			}
		};
		const res = {
			status: jest.fn(() => res),
			send: jest.fn(),
		};
		const next = jest.fn();

		checkIds(req, res, next);

		expect(next).toHaveBeenCalled();
	});

	it('Calls next if admin', async () => {
		const req = {
			body: {
				admin: true,
			}
		};
		const res = {
			status: jest.fn(() => res),
			send: jest.fn(),
		};
		const next = jest.fn();

		checkIds(req, res, next);

		expect(next).toHaveBeenCalled();
	});

	it('Returns 400 if id is null', async () => {
		const req = {
			body: {
				creatorId: null,
			}
		};
		const res = {
			status: jest.fn(() => res),
			send: jest.fn(),
		};
		const next = jest.fn();

		checkIds(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({ message: 'creatorId is required' });
	});

	it('Returns 400 if id is not valid', async () => {
		const req = {
			body: {
				creatorId: '123',
			}
		};
		const res = {
			status: jest.fn(() => res),
			send: jest.fn(),
		};
		const next = jest.fn();

		checkIds(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({ error: { code: 'CE0101', message: 'Field creatorId must be a valid ObjectId' } });
	});
});