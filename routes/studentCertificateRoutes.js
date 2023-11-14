const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const StudentCertificateModel = require('../models/student-certificate');


// Create student-certificate route
router.put("/", async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ message: "studentId and courseId are required fields" }); // TODO: Implement error codes
  }

  if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    console.log("you have an invalid id")
    return res.status(400).json({ message: "studentId and courseId must be valid ObjectIds" }); // TODO: Implement error codes
  }

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
router.get('/', async (req, res) => {
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

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "studentId and courseId must be valid ObjectIds" }); // TODO: Implement error codes
    }

    // Find creator-certificate by creatorId and courseId
    const certificate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });
    return res.status(200).send(certificate);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "No works or something" }); //TODO: Implement errors codes
  }

});

module.exports = router;