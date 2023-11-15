const mongoose = require('mongoose');
const { Schema } = mongoose;

const creatorCertificateSchema = new Schema({
	creatorId: {
		type: Schema.Types.ObjectId,
		ref: 'users',
    required: [true, 'creatorId is required'],
	},
	courseId: {
		type: Schema.Types.ObjectId,
		ref: 'courses',
    required: [true, 'courseId is required'],
	},
});

const creatorCertificateModel = mongoose.model('creator-certificates', creatorCertificateSchema);

module.exports = creatorCertificateModel;