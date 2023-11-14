const express = require('express');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
request = require('supertest');
const router = require('../../routes/studentCertificateRoutes');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeStudent = require('../fixtures/fakeStudent');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');

app.use(express.json());
app.use('/api/student-certificates', router); // replace with actual route

const PORT = 1337; // Port for testing
const server = app.listen(PORT);
const baseUrl = `http://localhost:${PORT}`;
let db;

const fakeUser = makeFakeUser();
const fakeStudent = makeFakeStudent(fakeUser._id);

const anotherFakeUser = makeFakeUser();
const fakeContentCreator = makeFakeContentCreator(anotherFakeUser._id);

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
  it('Can get all student certificates', async () => {
    const anotherFakeCourse = makeFakeCourse();
    await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: anotherFakeCourse._id });
    await db.collection('student-certificates').insertOne({ studentId: fakeUser._id, courseId: fakeCourse._id });

    const response = await request(baseUrl)
      .get('/api/student-certificates')
      .send({ admin: true })

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
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

       console.log(response.body);
    expect(response.status).toBe(201);
    const certificate = await db.collection('student-certificates').findOne({ studentId: fakeUser._id, courseId: fakeCourse._id });
    expect(certificate).toBeTruthy();
  });
});

