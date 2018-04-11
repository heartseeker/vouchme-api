/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	find: function(req, res) {
        User.find().populate('profile').exec((err, user) => {
            this.errorHandler(err);
            return res.ok(user);
        });
    },

    create: function(req, res) {
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const username = req.body.username;
        const password = req.body.password;

        // create profile for the user
        Profile.create({first_name, last_name}).exec((err, profile) => {
            this.errorHandler(err);
            const profile_id = profile.id;
            // create user account
            User.create({username, password, profile: profile_id}).exec((err, user) => {
                this.errorHandler(err);
                return res.ok(user);
            });
        });
    },

    errorHandler: function(err) {
        if (err) { return res.serverError(err); }
    }
};

