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
	courseName: {
		type: String,
		required: [true, 'courseName is required']
	},
	creatorFirstName: {
		type: String,
		required: [true, 'creatorFirstName is required'],
	},
	creatorLastName: {
		type: String,
		required: [true, 'creatorLastName is required'],
	},
	estimatedCourseDuration: {
		type: Number,
		required: [true, 'estimatedCourseDuration is required']
	},
	dateOfPublication: {
		type: Date,
		required: [true, 'dateOfPublication is required'],
		validate: {
			validator: function (date) {
				return date < Date.now();
			}
		}
	},
	courseCategory: {
		type: String,
		required: [true, 'courseCategory is required']
	},
});

const creatorCertificateModel = mongoose.model('creator-certificates', creatorCertificateSchema);

module.exports = creatorCertificateModel;