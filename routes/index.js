const StudentCertificateModel = require('../models/student-certificate');
const CreatorCertificateRoutes = require('../routes/creatorCertificateRoutes');
const StudentCertificateRoutes = require('../routes/studentCertificateRoutes');

const router = require('express').Router();

router.use('/test', async (req, res) => {
	const certificates = await StudentCertificateModel.find({});
	res.send({
		msg: 'Hello from the certificate service!',
		data: certificates,
	});
});

router.use('/api/creator-certificates', CreatorCertificateRoutes);
router.use('/api/student-certificates', StudentCertificateRoutes);

module.exports = router;