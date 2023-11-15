const express = require('express');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
const request = require('supertest');
const router = require('../../routes/studentCertificateRoutes');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeStudent = require('../fixtures/fakeStudent');
const makeFakeCourse = require('../fixtures/fakeCourse');

app.use(express.json());
app.use('/api/student-certificates', router); // replace with actual route

const PORT = 1337; // Port for testing
const server = app.listen(PORT);
const baseUrl = `http://localhost:${PORT}`;
let db;

const fakeUser = makeFakeUser();
const fakeStudent = makeFakeStudent(fakeUser._id);

const anotherFakeUser = makeFakeUser();

const fakeCourse = makeFakeCourse(anotherFakeUser._id);

beforeAll(async () => {
	db = await connectDb();
});

beforeEach(async () => {
	await db.collection('users').insertOne(fakeUser);
	await db.collection('students').insertOne(fakeStudent);
	await db.collection('courses').insertOne(fakeCourse);
});

afterEach(async () => {
	await db.collection('users').deleteMany({});
	await db.collection('students').deleteMany({});
	await db.collection('courses').deleteMany({});
	await db.collection('student-certificates').deleteMany({});
});

afterAll(async () => {
	server.close();
	await mongoose.connection.close();
});

describe('GET /', () => {
	it('Can get specific student certificate', async () => {
		await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: fakeCourse._id });

		const response = await request(baseUrl)
			.get('/api/student-certificates?studentId=' + fakeUser._id + '&courseId=' + fakeCourse._id)
			.send({ admin: true });

		expect(response.status).toBe(200);
		expect(response.body.courseId).toBe(fakeCourse._id.toString());
		expect(response.body.studentId).toBe(fakeUser._id.toString());
	});

	it('Can get all student certificates', async () => {
		const anotherFakeCourse = makeFakeCourse();
		await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: fakeCourse._id });
		await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: anotherFakeCourse._id });

		const response = await request(baseUrl)
			.get('/api/student-certificates')
			.send({ admin: true });

		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(2);
	});

	it('Returns 204 if certificate does not exist', async () => {
		const response = await request(baseUrl)
			.get('/api/student-certificates?studentId=' + fakeUser._id + '&courseId=' + fakeCourse._id);

		expect(response.status).toBe(204);
		expect(response.body).toEqual({});
	});
});


describe('PUT /', () => {
	it('Can create student certificate', async () => {
		const response = await request(baseUrl)
			.put('/api/student-certificates')
			.send({
				studentId: fakeUser._id,
				courseId: fakeCourse._id,
				courseName: fakeCourse.title,
				studentFirstName: fakeUser.firstName,
				studentLastName: fakeUser.lastName,
				courseCreator: 'Jacob Terpe',
				estimatedCourseDuration: fakeCourse.estimatedHours,
				dateOfCompletion: new Date()
			});

		expect(response.status).toBe(201);
		const certificate = await db.collection('student-certificates').findOne({ studentId: fakeUser._id, courseId: fakeCourse._id });
		expect(certificate).toBeTruthy();
	});

	it('Returns 400 if certificate already exists', async () => {
		await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: fakeCourse._id });

		const response = await request(baseUrl)
			.put('/api/student-certificates')
			.send({
				studentId: fakeUser._id,
				courseId: fakeCourse._id,
				courseName: fakeCourse.title,
				studentFirstName: fakeUser.firstName,
				studentLastName: fakeUser.lastName,
				courseCreator: 'Jacob Terpe',
				estimatedCourseDuration: fakeCourse.estimatedHours,
				dateOfCompletion: new Date()
			});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe('a certificate for this course and user already exists');
	});

	it('Returns 400 if any value is missing or null', async () => {
		const response = await request(baseUrl)
			.put('/api/student-certificates')
			.send({
				studentId: fakeUser._id,
				courseId: fakeCourse._id,
				courseName: fakeCourse.title,
				studentFirstName: fakeUser.firstName,
				studentLastName: fakeUser.lastName,
				courseCreator: 'Jacob Terpe',
				estimatedCourseDuration: fakeCourse.estimatedHours,
			});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe('student-certificates validation failed: dateOfCompletion: dateOfCompletion is required');
	});
});


describe('DELETE /', () => {
	it('Can delete student certificate', async () => {
		await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: fakeCourse._id });

		const response = await request(baseUrl)
			.delete('/api/student-certificates' + '?studentId=' + fakeUser._id + '&courseId=' + fakeCourse._id);

		expect(response.status).toBe(200);
		const certificate = await db.collection('student-certificates').findOne({ studentId: fakeUser._id, courseId: fakeCourse._id });
		expect(certificate).toBeFalsy();
	});

	it('Returns 204 if certificate does not exist', async () => {
		await db.collection('student-certificates').deleteMany({});

		const response = await request(baseUrl)
			.delete('/api/student-certificates' + '?studentId=' + fakeUser._id + '&courseId=' + fakeCourse._id);

		expect(response.status).toBe(204);
	});
});