var EventEmitter = require( 'events' ).EventEmitter;
var util = require( 'util' );
var path = require( 'path' );

var Db = require( 'tingodb' )().Db;
var assert = require( 'assert' );

var WSong = require( './songs/wsong' );

function SongDB( config ) {
  EventEmitter.call( this );

  this.config = config;

  // Opening & creating database
  this.db = new Db( config.base_directory, {} );

  // Song collection
  this.songs = this.db.collection( "songs.db" );
}

util.inherits( SongDB, EventEmitter );

/**
 * Get a music from the web
 * @param <String> url
 * @param <Function> downloadCallback( song )
 * @param <Function> endCallback( err, song )
 */
SongDB.prototype.downloadSong = function ( url, startCallback, downloadCallback, endCallback ) {

  var output_filename = path.join(
    this.config.dl_directory,
    "%(id)s-%(title)s/%(title)s.%(ext)s"
  );

  var wsong = new WSong( url, output_filename );

  console.log( "[dl]\tStarting a download: " + url.substring( 0, 20 ) );

  wsong.on( 'id', function ( song ) {
    console.log( "[dl]\tTitle: " + song.title );

    startCallback( song );
  } );

  wsong.on( 'update_download_percent', function ( song ) {
    downloadCallback( song );
  } );

  wsong.on( 'error', function ( event ) {
    console.warn( event );
  } );

  wsong.on( 'end', ( function ( event ) {
    assert.strictEqual( event, 0 );

    console.log( "[dl]\t" + wsong.title + " downloaded." );

    this.insert( wsong, endCallback );

  } ).bind( this ) );
};

/**
 * Save a song to db
 * @param <Song> song
 * @param <Function> callback( err, song )
 */
SongDB.prototype.insert = function ( song, callback ) {
  try {
    assert.equal( song.isValid(), true );

    this.songs.insert( [ song.dehydrate() ], function ( err, r ) {
      assert.equal( err, null );
      assert.equal( r.length, 1 );

      song._id = r[ 0 ]._id;

      console.log( "[db]\tSong inserted (id=" + song._id + ")" );

      callback( null, song );
    } );
  } catch ( e ) {
    console.error( "[db]\t" + e );

    callback( e );
  }
};

module.exports = SongDB;
