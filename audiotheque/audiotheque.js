var EventEmitter = require( 'events' ).EventEmitter;
var util = require('util');
var fs = require( 'fs' );
var path = require( 'path' );
var sqlite3 = require( 'sqlite3' );
var child_process = require( 'child_process' );
var YTSong = require( './ytsong' );

function Audiotheque( config ) {
  EventEmitter.call( this );
  
  this.config = config;
  
  // Opening & creating database
  this.db = new sqlite3.Database( config.db_filename );
  this.db.exec( "CREATE TABLE IF NOT EXISTS `songs` ("
    + "`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"
    + "`title`	TEXT NOT NULL,"
    + "`albumartist` TEXT,"
    + "`artist`	TEXT,"
    + "`duration`	INTEGER NOT NULL,"
    + "`year`	INTEGER,"
    + "`genre`	TEXT,"
    + "`filename`	TEXT NOT NULL,"
    + "`source`	TEXT NOT NULL DEFAULT 'local'"
    + ");" );
  
  // Inserting a new song statement
  this.insertSongStmt = this.db.prepare( "INSERT INTO songs (title, artist, albumartist, duration, year, genre, filename, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)" );
  
}

util.inherits( Audiotheque, EventEmitter) ;

/**
 * Get a music from Youtube
 * @param <String> url
 */
Audiotheque.prototype.downloadYTSong = function ( url ) {
  var output_filename = path.join( this.config.dl_directory, "%(title)s-%(id)s.%(ext)s" );
  
  var ytsong = new YTSong( url, output_filename );
  console.log( "starting a youtube download" );
  
  ytsong.on( 'error', function ( event ) {
    console.warn( event );
  } );
  
  ytsong.on( 'end', (function ( event ) {
    console.log( "sond titled " + ytsong.title + " valid = " + ytsong.isValid() );
    
    if ( event === 0 ) {
      this.saveSong( ytsong );
    }
  }).bind( this ));
};

/**
 * Save a song to db
 * @param <Song> song
 */
Audiotheque.prototype.saveSong = function ( song ) {
  if ( song.isValid() ) {
    this.insertSongStmt.run( [
      song.title,
      song.artist,
      song.albumartist,
      song.duration || 0,
      song.year,
      song.genre,
      song.filename,
      song.source
    ], ( function ( data ) {
      console.log( "song saved", data );
    }).bind( this ) );
  }
};

module.exports = Audiotheque
