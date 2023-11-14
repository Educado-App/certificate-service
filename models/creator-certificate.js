const mongoose = require('mongoose');
const { Schema } = mongoose;

const creatorCertificateSchema = new Schema({
	creatorId: {
		type: Schema.Types.ObjectId,
		ref: 'creators'
	},
	courseId: {
		type: Schema.Types.ObjectId,
		ref: 'courses'
	},
});

const creatorCertificateModel = mongoose.model('creator-certificates', creatorCertificateSchema);

module.exports = creatorCertificateModel;