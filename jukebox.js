#!/usr/bin/env node

/**
 * Modules
 */
var fs = require( 'fs' );

/**
 * Configuration
 */
var config = require("./config");

// Create directories if not found
automkdir( config.base_directory );
automkdir( config.songs_directory );
automkdir( config.dl_directory );

/**
 * Server
 */
var server = require("./webremote/bin/www");

/**
 * Audiotheque
 */
var audiotheque = require("./audiotheque");

/**
 * Test
 */
audiotheque.downloadYTSong( "https://www.youtube.com/watch?v=OI2CRYjLprY" );


/**
 * Create a directory if it does not exists
 */
function automkdir( dir ) {
  try {
    var stat = fs.statSync( dir );
  }
  catch ( e ) {
    console.log( "mkdir " + dir );
    fs.mkdirSync( dir );
  }
}
