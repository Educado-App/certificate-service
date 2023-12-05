const express = require('express');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
const request = require('supertest');
const router = require('../../routes/creatorCertificateRoutes');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');
const makeFakeCourse = require('../fixtures/fakeCourse');

const axios = require('axios');

jest.mock('axios');

app.use(express.json());
app.use('/api/creator-certificates', router); // replace with actual route

const PORT = 1337; // Port for testing
const server = app.listen(PORT);
const baseUrl = `http://localhost:${PORT}`;
let db;

const fakeUser = makeFakeUser();
const fakeContentCreator = makeFakeContentCreator(fakeUser._id);
const fakeCourse = makeFakeCourse();

let actualUser;

jest.mock('../../middlewares/checkIds', () => {
	return (req, res, next) => { next(); };
});

beforeAll(async () => {
	db = await connectDb();
});

beforeEach(async () => {
	await db.collection('users').insertOne(fakeUser);
	await db.collection('content-creators').insertOne(fakeContentCreator);

	actualUser = await db.collection('users').findOne({ email: fakeUser.email });
	await db.collection('courses').insertOne(fakeCourse);
});

afterEach(async () => {
	await db.collection('users').deleteMany({});
	await db.collection('content-creators').deleteMany({});
	await db.collection('courses').deleteMany({});
	await db.collection('creator-certificates').deleteMany({});
});

afterAll(async () => {
	server.close();
	await mongoose.connection.close();
});

describe('GET /creator/:id', () => {

	axios.get.mockImplementation((url) => {
		if (url.includes('api/users')) {
			return { data: fakeUser };
		} else if (url.includes('api/courses')) {
			return { data: fakeCourse };
		}
	});

	it('Can get all of a content-creator\'s certificates', async () => {
		const anotherFakeCourse = makeFakeCourse();
		anotherFakeCourse._id = new mongoose.Types.ObjectId();
		await db.collection('creator-certificates').insertOne({ creatorId: fakeUser._id, courseId: anotherFakeCourse._id });
		await db.collection('creator-certificates').insertOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });

		const response = await request(baseUrl)
			.get('/api/creator-certificates/creator/' + fakeUser._id)
			.send({ token: 'test' });

		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
		response.body.forEach((certificate) => {
			expect(certificate.creator).toMatchObject({
				_id: fakeUser._id.toString(),
				firstName: fakeUser.firstName,
				lastName: fakeUser.lastName,
				email: fakeUser.email,
				joinedAt: fakeUser.joinedAt.toISOString(),
				dateUpdated: fakeUser.dateUpdated.toISOString(),
			});
			expect(certificate.course).toMatchObject({
				_id: fakeCourse._id.toString(),
				title: fakeCourse.title,
				description: fakeCourse.description,
				dateCreated: fakeCourse.dateCreated,
				dateUpdated: fakeCourse.dateUpdated,
			});
		});
	});
});

describe('PUT /', () => {
	it('Can create content creator certificate', async () => {
		const response = await request(baseUrl)
			.put('/api/creator-certificates')
			.send({ creatorId: fakeUser._id, courseId: fakeCourse._id });

		expect(response.status).toBe(201);
		const certificate = await db.collection('creator-certificates').findOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });
		expect(certificate).toBeTruthy();
	});
});

describe('DELETE /', () => {
	it('Can delete content creator certificate', async () => {
		await db.collection('creator-certificates').insertOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });

		const response = await request(baseUrl)
			.delete('/api/creator-certificates')
			.send({ creatorId: fakeUser._id, courseId: fakeCourse._id });

		expect(response.status).toBe(200);
		const certificate = await db.collection('creator-certificates').findOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });
		expect(certificate).toBeFalsy();
	});

	it('Returns 204 if certificate does not exist', async () => {
		const response = await request(baseUrl)
			.delete('/api/creator-certificates')
			.send({ creatorId: fakeUser._id, courseId: fakeCourse._id });

		expect(response.status).toBe(204);
	});
});