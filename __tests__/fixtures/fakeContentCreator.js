const mongoose = require('mongoose');

module.exports = function makeFakeContentCreator(baseUserId) {
    return {
        baseUser: baseUserId,
    }
}