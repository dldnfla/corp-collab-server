const moment = require('moment');

function fromatMessage(name, text) {
    return {
        name,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = fromatMessage;