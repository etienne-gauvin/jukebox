var EventEmitter = require( 'events' ).EventEmitter;
var util = require('util');
var fs = require( 'fs' );

/**
 * A song
 * @param <Object> data : { title, albumartist, artist, duration, year, genre }
 * @param <String> filename : absolute path to a file
 * @param <String> [ source = "local" ] : youtube|user_upload|local
 */
function Song( data, filename, source ) {
  EventEmitter.call( this );
  
  this.set( data );
  this.filename = filename;
  this.source = source || 'local';
}

util.inherits(Song, EventEmitter);

/**
 * Set song's data
 */
Song.prototype.set = function ( data ) {
  this.title = data.title;
  this.artist = data.artist;
  this.albumartist = data.albumartist || data.artist;
  this.duration = data.duration;
  this.year = data.year;
  this.genre = data.genre;
}

/**
 * Valid song's data and file
 */
Song.prototype.isValid = function () {
  
  if ( /*this.title && this.duration &&*/ this.filename ) {
    try {
      var stat = fs.statSync( this.filename );
      
      if ( stat.isFile() ) {
        return true;
      }
    }
    catch ( e ) {
      return false;
    }
  }
  
  return false;
}

module.exports = Song;
