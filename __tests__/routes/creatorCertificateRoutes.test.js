const express = require('express');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
request = require('supertest');
const router = require('../../routes/creatorCertificateRoutes');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');
const makeFakeCourse = require('../fixtures/fakeCourse');

app.use(express.json());
app.use('/api/creator-certificates', router); // replace with actual route

const PORT = 1337; // Port for testing
const server = app.listen(PORT);
const baseUrl = `http://localhost:${PORT}`;
let db;

const fakeUser = makeFakeUser();
const fakeContentCreator = makeFakeContentCreator(fakeUser._id);
const fakeCourse = makeFakeCourse();

beforeAll(async () => {
  db = await connectDb();
});

beforeEach(async () => {
  await db.collection('users').insertOne(fakeUser);
  await db.collection('content-creators').insertOne(fakeContentCreator);
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

describe('GET /', () => {
  it('Can get all creator certificates', async () => {
    const anotherFakeCourse = makeFakeCourse();
    await db.collection('creator-certificates').insertOne({ creatorId: fakeUser._id, courseId: anotherFakeCourse._id });
    await db.collection('creator-certificates').insertOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });

    const response = await request(baseUrl)
      .get('/api/creator-certificates')
      .send({ admin: true })

  expect(response.status).toBe(200);
  expect(response.body.length).toBe(2);
});
});


describe('PUT /', () => {
  it('Can create content creator certificate', async () => {
    const response = await request(baseUrl)
      .put('/api/creator-certificates')
      .send({ creatorId: fakeUser._id, courseId: fakeCourse._id })

    expect(response.status).toBe(201);
    const certificate = await db.collection('creator-certificates').findOne({ creatorId: fakeUser._id, courseId: fakeCourse._id });
    expect(certificate).toBeTruthy();
  });
});

