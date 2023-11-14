// Constant requires
const cors = require('./settings/cors');

const express = require('express');
const { connectToDb } = require('./db');
const keys = require('./config/keys');
const router = require('./routes');
const process = require('process');

const PORT = process.env.PORT || 8080; // Get dynamic port allocation when deployed by Heroku. Otherwise, by default, use port 5000

// Setup connection to database
connectToDb(keys.mongoURI, {
	dbName: 'certificate-service',
}, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const app = express(); // Configuration for listening, communicate to handlers

app.use(express.json());
app.use(cors);
app.use('', router);

// Run if running in production on Heroku
if (process.env.NODE_ENV === 'production') {
	// Make sure that express handles production correctly
	// Make sure that express serves prodcution assets
	app.use(express.static('client-web/build'));

	// Express will serve up the index.html file if it doesn't recognize the route
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

// Run server
app.listen(PORT, () => {
	console.log(`⚡ Running app at ${keys.WEB_HOST || 'http://localhost'}:${PORT}`);
});