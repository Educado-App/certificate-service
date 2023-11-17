const mongoose = require('mongoose');
const errorCodes = require('../helpers/errorCodes');

// Middleware for checking if the ids are not null and valid
module.exports = (req, res, next) => {

	if(req.body.admin) {
		next();
		return;
	}

	for (let idField in req.body) {
		if(idField.toString().includes('Id')) {
			if (!req.body[idField]) {
				return res.status(400).send({ message: `${idField} is required` });
			}
			if (!mongoose.Types.ObjectId.isValid(req.body[idField])) {
				return res.status(400).send({ error: errorCodes('CE0101', idField) });
			}
		}
    
	}

	next();
};