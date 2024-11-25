const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const CreatorCertificateModel = require('../models/creator-certificate');
const checkIds = require('../middlewares/checkIds');
const errorCodes = require('../helpers/errorCodes');
const axios = require('axios');

const { generateStudentPDF } = require('../helpers/pdfGenerator');
const { getStudentHtml } = require('../helpers/templates');

const { BACKEND_URL } = require('../config/keys');


// Create creator-certificate route
router.put('/', checkIds, async (req, res) => {
	const { creatorId, courseId } = req.body;

	if (!creatorId || !courseId) {
		return res.status(401).json({ error: errorCodes('CE0200') });
	}

	// Create new creator-certificate
	const newCreatorCertificate = new CreatorCertificateModel({
		creatorId,
		courseId,
	});

	const duplicate = await CreatorCertificateModel.findOne({ creatorId: creatorId, courseId: courseId });

	if (duplicate) {
		return res.status(400).json({ error: errorCodes('CE0102') });
	}

	try {
		const savedCreatorCertificate = await newCreatorCertificate.save();
		return res.status(201).json(savedCreatorCertificate);
	} catch (err) {
		return res.status(400).send(err);
	}
});


// Get all of a content-creator's certificates route
router.get('/creator/:id', async (req, res) => {
	try {
		const token = req.header('token');

		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(401).json({ error: errorCodes('CE0200', 'creatorId') });
		}

		const creatorId = new mongoose.Types.ObjectId(req.params.id);

		// Find creator-certificate by creatorId and courseId
		console.log(creatorId._id);
		let certificates = await CreatorCertificateModel.find({ creatorId: creatorId._id });

		if (certificates.length === 0) {
			return res.status(204).send();
		}

		const creator = await axios.get(
			`${BACKEND_URL}/api/users/${creatorId}`,
			{ headers: { token: token } }
		);

		const result = await makeCertificates(certificates, token, creator.data);

		return res.status(200).send(result);

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: errorCodes('CE0001') });
	}

});

// Delete creator-certificate route
router.delete('/', checkIds, async (req, res) => {
	try {
		const { creatorId, courseId } = req.body;

		//validate Ids
		if (!creatorId || !courseId) {
			return res.status(400).json({ error: errorCodes('CE0200') });
		}

		// Find creator-certificate by creatorId and courseId
		const certificate = await CreatorCertificateModel.findOneAndDelete({ creatorId, courseId });

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
	let { creatorId, courseId } = req.query;

	console.log('9fdsssssss', creatorId, courseId);
  
	try {
	  creatorId = new mongoose.Types.ObjectId(creatorId);
	  courseId = new mongoose.Types.ObjectId(courseId);
	} catch (error) {
	  return res.status(400).json({ error: errorCodes('CE0101', 'creatorId and courseId') });
	}
  
	let certificate;
  
	try {
	  certificate = await CreatorCertificateModel.findOne({ creatorId: creatorId, courseId: courseId });
	} catch (error) {
	  console.log(error);
	  return res.status(500).json({ error: errorCodes('CE0001') });
	}
  
	if (!certificate) {
	  console.log('CERT:', certificate);
	  return res.status(404).send({ error: errorCodes('CE0002', 'Certificate')}); 
	}
  
	const pdfPath = await generateStudentPDF({
	  studentName: 'navn',
	  creatorName: 'dfghjk',
	  courseName: 'certificate.courseName',
	  dateOfCompletion: new Date("2023-11-10T22:00:00.000+00:00"),
	  estimatedCourseDuration: '6',
	}, creatorId, courseId);

	console.log(pdfPath);
  
	return res.status(200).sendFile(pdfPath);
  });

  router.get('/preview', async (req, res) => {
	const returnVal = await getStudentHtml({
		studentName: 'navn',
		creatorName: 'dfghjk',
		courseName: 'certificate.courseName',
		dateOfCompletion: new Date("2023-11-10T22:00:00.000+00:00"),
		estimatedCourseDuration: '6',
		});

		console.log(returnVal);

	
	return res.status(200).send(returnVal);
  });
  

async function makeCertificates(certificateList, token, creator) {
	let certificates = [];

	for (let i = 0; i < certificateList.length; i++) {

		const course = await axios.get(
			`${BACKEND_URL}/api/courses/${certificateList[i].courseId}`,
			{ headers: { token: token } }
		);

		const certificate = {
			creator: creator,
			course: course.data,
		};

		certificates.push(certificate);
	}

	return certificates;
}

module.exports = router;