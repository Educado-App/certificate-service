const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentCertificateSchema = new Schema({
  courseName: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'courses'
  },
  studentId: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
  studentFirstName: {
    type: String,
    required: true,
  },
  studentLastName: {
    type: String,
    required: true,
  },
  courseCreator: {
    type: String,
    required: true
  },
  estimatedCourseDuration: {
    type: Number,
    required: true
  },
  dateOfCompletion: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return date < Date.now();
      }
    }
  },
});

const StudentCertificateModel = mongoose.model('student-certificates', studentCertificateSchema);

module.exports = StudentCertificateModel;