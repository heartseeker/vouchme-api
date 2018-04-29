const jwt = require('jsonwebtoken');

/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    foobar: function (req, res, next) {
      console.log("Requested :: ", req.method, req.url);
      if (req.url === '/users') {
        return res.status(404).send('fail');
      };
      console.log("Requested :: ", req.method, req.url);
      return next();
    },

  /***************************************************************************
  *                                                                          *
  * The order in which middleware should be run for HTTP request. (the Sails *
  * router is invoked by the "router" middleware below.)                     *
  *                                                                          *
  ***************************************************************************/

 order: [
      
      'startRequestTimer',
      'cookieParser',
      'session',
      'myRequestLogger',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'authenticate',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],

  /****************************************************************************
  *                                                                           *
  * Example custom middleware; logs each request to the console.              *
  *                                                                           *
  ****************************************************************************/

    // myRequestLogger: function (req, res, next) {
    //     console.log("Requested :: ", req.method, req.url);
    //     return next();
    // }
   

    authenticate: function (req, res, next) {

      const excluded = [
        '/users/login',
        '/users/social',
        '/users'
      ];
      // excluded post method
      if (excluded.includes(req.url)) {
        if (req.method === 'POST' || req.method === 'OPTIONS') {
          return next();
        }
      }

      const token = req.header('x-auth');
      let decoded;
      try {
        decoded = jwt.verify(token, 'abc123');
      } catch (e) {
        return res.status(401).send('Not Allowed');
      }
      
      User.findOne({
        'id': decoded.id,
        'tokens.token': token,
        'tokens.access': 'auth'
      }).exec((err, user) => {
        if (user) {
          return next();
        } else {
          return res.status(401).send('Not Allowed');
        }
      })
    }


  /***************************************************************************
  *                                                                          *
  * The body parser that will handle incoming multipart HTTP requests. By    *
  * default,Sails uses [skipper](http://github.com/balderdashy/skipper). See *
  * https://github.com/expressjs/body-parser for other options. Note that    *
  * Sails uses an internal instance of Skipper by default; to override it    *
  * and specify more options, make sure to "npm install                      *
  * skipper@for-sails-0.12 --save" in your app first. You can also specify a *
  * different body parser or a custom function with req, res and next        *
  * parameters (just like any other middleware function).                    *
  *                                                                          *
  ***************************************************************************/


    // bodyParser: require('skipper')({strict: true})

  },


  /***************************************************************************
  *                                                                          *
  * The number of milliseconds to cache static assets in production.         *
  * These are any flat files like images, scripts, styleshseets, etc.        *
  * that are served by the static middleware.  By default, these files       *
  * are served from `.tmp/public`, a hidden folder compiled by Grunt.        *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000
};
