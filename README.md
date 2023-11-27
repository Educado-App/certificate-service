# Educado Certificate Microservice

A microservice for handling creation, retrieval, download, and deletion of certificates given to students and content creators, upon completion and creation of a course, respectively in the Educado system. 

The certificate service is based on the following tools:

- Nodejs
- Express
- MongoDB/Mongoose
- Axios

### Setting up and running local repository

1. Clone repository from GitHub
2. Add .env file to config with the following values:
	- googleClientID
	- googleClientSecret
	- mongoURI
	- googleApplicationCredentials
	- mongoURITest (local)
	- tokenSecret
3. Navigate to repository folder
4. Run in terminal: `npm install`
5. Run in terminal: `npm run dev`

By default, the api runs on `http://localhost:8080`