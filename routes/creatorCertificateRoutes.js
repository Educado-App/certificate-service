const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const CreatorCertificateModel = require('../models/creator-certificate');
const checkIds = require('../middlewares/checkIds');
const errorCodes = require('../helpers/errorCodes');


// Create creator-certificate route
router.put('/', checkIds, async (req, res) => {
	const { creatorId, courseId } = req.body;

	if (!creatorId || !courseId) {
		return res.status(401).json({ error: errorCodes('CE0200')});
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

// Get specific creator-certificate route
router.get('/', async (req, res) => {
	try {
		const { creatorId, courseId } = req.query;
		const { admin } = req.body;

		if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(courseId)) {
			if(admin) {
				const certificates = await CreatorCertificateModel.find({});
				return res.status(200).send(certificates);
			}
			return res.status(401).json({ error: errorCodes('CE0200', 'creatorId and courseId') });
		} 

		// Find creator-certificate by creatorId and courseId
		const certificate = await CreatorCertificateModel.findOne({ creatorId, courseId });

		if (!certificate) {
			return res.status(204).send();
		}

		return res.status(200).send(certificate);

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

module.exports = router;