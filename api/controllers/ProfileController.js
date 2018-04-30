const jwt = require('jsonwebtoken');
const _ = require('lodash');
const request = require('request');

/**
 * ProfileController
 *
 * @description :: Server-side logic for managing profiles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	get(req, res) {
        const token = req.headers['x-auth'];
        let decoded;
        try {
            decoded = jwt.verify(token, 'abc123');
        } catch(err) {
        }
        if (!decoded) {
            res.status(401).send();
        }
        const id = decoded.id;
        User.findOne({id}).populate('profile').exec((err, user) => {
            if (user) {
                res.send(user);
            } else {
                res.status(401).send();
            }
        });
    }
};

