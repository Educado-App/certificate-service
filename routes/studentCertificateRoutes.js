const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const StudentCertificateModel = require('../models/student-certificate');
const checkIds = require('../middlewares/checkIds');


// Create student-certificate route
router.put("/", checkIds, async (req, res) => {

  const {
    courseName,
    courseId,
    studentId,
    studentFirstName,
    studentLastName,
    courseCreator,
    estimatedCourseDuration,
    dateOfCompletion,
  } = req.body;


  // Create new creator-certificate
  const newStudentCertificate = new StudentCertificateModel({
    courseName,
    courseId,
    studentId,
    studentFirstName,
    studentLastName,
    courseCreator,
    estimatedCourseDuration,
    dateOfCompletion,
  });

  const duplicate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });

  if (duplicate) {
    return res.status(400).json({ message: "a certificate for this course and user already exists" }); // TODO: Implement error codes
  }

  try {
    const savedStudentCertificate = await newStudentCertificate.save();
    return res.status(201).json(savedStudentCertificate);
  } catch (err) {
    console.log("you have an error")
    console.log(err)
    return res.status(400).send(err);
  }
});

// Get specific student-certificate route
router.get('/', checkIds, async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    const { admin } = req.body;

    //validate Ids
    if (!studentId || !courseId) {
      if (admin) { // TODO: Implement security
        const list = await StudentCertificateModel.find();
        return res.status(200).send(list);
      }
      return res.status(400).json({ message: "studentId and courseId are required fields" }); // TODO: Implement error codes
    }

    // Find creator-certificate by creatorId and courseId
    const certificate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });

    if (!certificate) {
      return res.status(204).send();
    }

    return res.status(200).send(certificate);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "No works or something" }); //TODO: Implement errors codes
  }
});

// Delete student-certificate route
router.delete('/', checkIds, async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    // Find creator-certificate by creatorId and courseId
    const certificate = await StudentCertificateModel.findOneAndDelete({ studentId: studentId, courseId: courseId });

    if (!certificate) {
      return res.status(204).send(); // TODO: Implement error codes
    }

    return res.status(200).send(certificate);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "No works or something" }); //TODO: Implement errors codes
  }
});

module.exports = router;