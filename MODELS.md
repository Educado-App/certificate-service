# Educado error codes

This file contains the error codes used on the Educado certificate microservice.

Please extend this documentation with any error codes you use in the certificate microservice. If you want to add a new category, please coordinate with the other teams by using this file. This way we ensure that there are no clashes in the error codes used.

> **Notice!**\
> This file does not and should not include Portugese translations for errors.\
> These error messages are not meant to be displayed to users.

## Guide for using errors in project

Error codes are defined as strings, in the form `"CE{Category}{Code}"`, where *category* and *code* are 2 decimals each, e.g. `"CE0101"`. This means there is 100 total possible categories with 100 possible error codes each.

These codes are mainly intended to be used in communication between the frontend(s) and the backend. As such they should be sent in the form of a JSON object.

**Example of JSON response containing an error**

```json
json_response: {
  error:{
    code: 'E0101',
    message: 'something went wrong'
  }
}
```

Both the frontend(s) and backend contain an `errorCodes.js` file, implementing the codes listed in this document. These can be used to easily import and use error codes.

> Error codes shown in parenthesis are reserved, but have not been implemented yet.

## CE00 General errors
- **CE0000** Unknown error

## CE01 Validation errors
- **CE0100** Field ${args} is required
- **CE0101** Field ${args} must be a valid ObjectId
- **CE0102** A certificate for this course and user already exists

## CE02 Authentication errors
- **CE0200** User not allowed to access all certificates. Use creatorId and courseId to get a specific certificate or creatorId to get all certificates from a creator