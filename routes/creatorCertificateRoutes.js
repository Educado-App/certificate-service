const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const CreatorCertificateModel = require('../models/creator-certificate');
const checkIds = require('../middlewares/checkIds');
const errorCodes = require('../helpers/errorCodes');
const axios = require('axios');

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
		let certificates = await CreatorCertificateModel.find({ creatorId: creatorId });

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