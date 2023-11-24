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
    return res.status(400).json({ error: errorCodes('CE0102') }); // TODO: Implement error codes
  }

  try {
    const savedStudentCertificate = await newStudentCertificate.save();
    return res.status(201).json(savedStudentCertificate);
  } catch (err) {
		if(err.name === 'ValidationError') {
			return res.status(400).json({ error: errorCodes('CE0100', err.path) }); 
		}
    return res.status(400).send(err);
  }
});

// Get specific student-certificate route
router.get('/', checkIds, async (req, res) => {

  const { studentId, courseId } = req.query;
  const { admin } = req.body;

  //validate Ids
  if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
		if(admin) {
			const certificates = await StudentCertificateModel.find({});
			return res.status(200).send(certificates);
		}
		console.log('test')
		return res.status(401).json({ error: errorCodes('CE0200', 'creatorId and courseId') });
	} 

  // Find creator-certificate by creatorId and courseId
  const certificate = await StudentCertificateModel.findOne({ studentId: studentId, courseId: courseId });

  if (!certificate) {
    return res.status(204).send();
  }

  return res.status(200).send(certificate);
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