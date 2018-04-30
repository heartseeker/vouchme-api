const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const _ = require('lodash');
const request = require('request');

/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// find(req, res) {
    //     User.find().populate('profile').exec((err, user) => {
    //         this.errorHandler(err, res);
    //         return res.ok(user);
    //     });
    // },

    verify(req, res) {
        const email = req.body.email;
        User.findOne({username: email}).exec((err, user) => {
            this.errorHandler(err, res);
            if (!user) {
                return res.status(404).send('Not Found');
            }
            return res.ok();
        });
    },

    create(req, res) {
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const username = req.body.username;
        const password = req.body.password;
        const type = req.body.type ? req.body.type : 1;

        let encryptedPassword;

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                encryptedPassword = hash;
            });
        });

        // create profile for the user
        Profile.create({first_name, last_name}).exec((err, profile) => {
            this.errorHandler(err, res);
            
            const profile_id = profile.id;
            // create user account
            User.create({username: username, password: encryptedPassword, profile: profile_id, type: type}).exec((err, user) => {
                this.errorHandler(err, res);
                return res.ok(user);
            });
        });
    },

    login(req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({username}).exec((err, user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, resp) => {
                    if (resp) {
                        this.generateAuthToken(user, res);
                    } else {
                        this.errorHandler('Not Found', res);
                    }
                  });
            } else {
                this.errorHandler('Not Found', res);
            }
        });
    },

    social(req, res) {
        const username = req.body.username;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const token = req.body.token;
        

        const url = `https://graph.facebook.com/me?access_token=${token}`;

        request(url, function(err, response, body) {
            const status = response.statusCode;
            const rs = JSON.parse(body);

            if (status === 200) {

                // if user already exist
                User.findOne({username}).exec((err, user) => {
                    const password = rs.id;
                    if (user) {
                        bcrypt.compare(password, user.password, (err, resp) => {
                            if (resp) {
                                // this.generateAuthToken(user, res);
                                const access = 'auth';
                                const token = jwt.sign({ id: user.id, access }, 'abc123').toString();

                                let tokens = [];
                                if (user.tokens) {
                                    tokens = user.tokens;
                                    tokens.push({ access, token });
                                } else {
                                    tokens.push({ access, token });
                                }

                                User.update({id: user.id}, {tokens: tokens}).exec((err, userResp) => {
                                    res.send(userResp);
                                })
                            } else {
                                this.errorHandler('Not Found', res);
                            }
                        });
                    } else {
                        // if new user
                        const password = rs.id;
                        let encryptedPassword;
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(password, salt, function(err, hash) {
                                encryptedPassword = hash;
                            });
                        });
                
                        // create profile for the user
                        Profile.create({first_name, last_name}).exec((err, profile) => {
                            if (err) {
                                res.status(400).send(err);
                            }
                            
                            const profile_id = profile.id;
                            // create user account
                            User.create({username: username, password: encryptedPassword, profile: profile_id}).exec((err, user) => {
                                if (err) {
                                    res.status(400).send(err);
                                }
                                console.log('<<<<create!!!!');
                                return res.ok(user);
                            });
                        });             
                        res.status(400).send('Not Found');
                    }
                });
            }
        });
    },

    generateAuthToken(user, res) {
        const access = 'auth';
        const token = jwt.sign({ id: user.id, access }, 'abc123', { expiresIn: '8h' }).toString();

        let tokens = [];
        if (user.tokens) {
            tokens = user.tokens;
            tokens.push({ access, token });
        } else {
            tokens.push({ access, token });
        }

        User.update({id: user.id}, {tokens: tokens}).exec((err, userResp) => {
            res.send({token: token});
        })
    },

    errorHandler(err, res) {
        if (err) { 
            return res.status(400).send(err); 
        }
    }
};

