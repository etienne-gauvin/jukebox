var EventEmitter = require( 'events' ).EventEmitter;
var util = require( 'util' );
var fs = require( 'fs' );

/**
 * A song
 * @param <Object> data
 */
function Song( data ) {
  EventEmitter.call( this );

  this.hydrate( data );
}

util.inherits( Song, EventEmitter );

/**
 * Valid song's data and file
 */
Song.prototype.isValid = function () {
  console.log( this.filename );

  if ( this.title && this.filename ) {
    try {
      var stat = fs.statSync( this.filename );

      if ( stat.isFile() ) {
        return true;
      }
    } catch ( e ) {
      return false;
    }
  }

  return false;
}

/**
 * Set song's data
 */
Song.prototype.hydrate = function ( data ) {
  this._id = data._id;
  this.id = data.id;

  this.title = data.title;
  this.duration = data.duration;
  this.extractor = data.extractor;
  this.uploader = data.uploader;

  this.status = data.status;
  this.download_percent = data.download_percent;

  this.filename = data.filename;
  this.source = data.source;
}

/**
 * Return <Object> for database or client
 */
Song.prototype.dehydrate = function () {
  return {
    _id: this._id,
    id: this.id,

    title: this.title,
    extractor: this.extractor,
    uploader: this.uploader,
    duration: this.duration,

    status: this.status,
    download_percent: this.download_percent,

    filename: this.filename,
    source: this.source
  };
}


module.exports = Song;
