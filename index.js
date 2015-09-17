var fs = require( 'fs' );

/**
 * Configuration
 */
var config = require( "./config" );

// Create directories if not found
automkdir( config.base_directory );
automkdir( config.songs_directory );
automkdir( config.dl_directory );

/**
 * HTTP Server (webremote)
 */
var server = require( "./webserver" );

/**
 * SongDB
 */
var songdb = require( "./songdb" );

/**
 * Test
 */
//songdb.downloadWSong( "OI2CRYjLprY" );


/**
 * Create a directory if it does not exists
 */
function automkdir( dir ) {
  try {
    var stat = fs.statSync( dir );
  } catch ( e ) {
    console.log( "mkdir " + dir );
    fs.mkdirSync( dir );
  }
}
