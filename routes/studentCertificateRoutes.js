const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const StudentCertificateModel = require('../models/student-certificate');
const checkIds = require('../middlewares/checkIds');
const errorCodes = require('../helpers/errorCodes');

const { generateStudentPDF } = require('../helpers/pdfGenerator');

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
    courseCategory,
  } = req.body;


  // Create new student-certificate
  const newStudentCertificate = new StudentCertificateModel({
    courseName,
    courseId,
    studentId,
    studentFirstName,
    studentLastName,
    courseCreator,
    estimatedCourseDuration,
    dateOfCompletion,
    courseCategory,
  });

  const duplicate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });

  if (duplicate) {
    return res.status(400).json({ error: errorCodes('CE0102') }); // TODO: Implement error codes
  }

  try {
    const savedStudentCertificate = await newStudentCertificate.save();
    return res.status(201).json(savedStudentCertificate);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: errorCodes('CE0100', err.path) });
    }
    return res.status(400).send(err);
  }
});


// Get all certificates for a specific student
router.get('/student/:id', checkIds, async (req, res) => {
  try {
    // const token = req.header('token');

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(401).json({ error: errorCodes('CE0200', 'studentId') });
    }

    const studentId = new mongoose.Types.ObjectId(req.params.id);

    // Find student-certificate by studentId and courseId
    let certificates = await StudentCertificateModel.find({ studentId: studentId });

    if (certificates.length === 0) {
      return res.status(204).send();
    }

    return res.status(200).send(certificates);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: errorCodes('CE0001') });
  }

});


// Delete student-certificate route
router.delete('/', checkIds, async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    // Find creator-certificate by creatorId and courseId
    const certificate = await StudentCertificateModel.findOneAndDelete({ studentId: studentId, courseId: courseId });

    if (!certificate) {
      return res.status(204).send();
    }

    return res.status(200).send(certificate);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: errorCodes('CE0001') });
  }
});

// Generate and download student-certificate
router.post('/download', async (req, res) => {
  let { studentId, courseId } = req.query;

  try {
    studentId = new mongoose.Types.ObjectId(studentId);
    courseId = new mongoose.Types.ObjectId(courseId);
  } catch (error) {
    return res.status(400).json({ error: errorCodes('CE0101', 'studentId and courseId') });
  }

  let certificate;

  try {
    certificate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: errorCodes('CE0001') });
  }

  if (!certificate) {
    console.log('CERT:', certificate);
    return res.status(404).send({ error: errorCodes('CE0002', 'Certificate')}); 
  }

  const pdfPath = await generateStudentPDF({
    studentName: `${certificate.studentFirstName} ${certificate.studentLastName}`,
    creatorName: certificate.courseCreator,
    courseName: certificate.courseName,
    dateOfCompletion: certificate.dateOfCompletion,
    estimatedCourseDuration: certificate.estimatedCourseDuration,
  }, studentId, courseId);

  return res.status(200).sendFile(pdfPath);
});

module.exports = router;