const StudentCertificateModel = require('../models/student-certificate');

const router = require('express').Router();

router.use('/', async (req, res) => {
	const certificates = await StudentCertificateModel.find({});
	res.send({
		msg: 'Hello from the certificate service',
		data: certificates,
	});
});

module.exports = router;