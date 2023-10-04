const express = require("express");
const Router = express.Router();

const {
    viberbot
} = require("../Controller/viberbot");

Router.post('/sendViberMessage', viberbot);

module.exports = Router;