var express = require( 'express' );
var path = require( 'path' );

var app = express();

// Static files
app.use( express.static( path.join( __dirname, '../public' ) ) );

module.exports = app;
