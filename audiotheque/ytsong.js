var Song = require( './song' );
var util = require('util');
var child_process = require( 'child_process' );
var fs = require( 'fs' );
var path = require( 'path' );

// Status
const DOWNLOADING = "DOWNLOADING";
const DOWNLOADED = "DOWNLOADED";
const ERROR = "ERROR";


/**
 * Download a song from Youtube
 * @param <String> ytid
 * @param <String> output_filename
 */
function YTSong( ytid, output_filename ) {
  Song.call( this, {}, null, 'youtube' );
  
  this.status = DOWNLOADING;
  
  var ytdl = child_process.spawn( 'youtube-dl', [
      "--no-playlist",
      "--restrict-filenames",
      "--output=" + output_filename,
      "--extract-audio",
      "--audio-format=best",
      //"--embed-thumbnail",
      "--newline",
      "--write-info-json",
      "http://www.youtube.com/watch?v=" + ytid
    ]
  );
  
  // Listeners
  ytdl.stdout.on( 'data', this.onData.bind( this ) );
  ytdl.stderr.on( 'data', this.onError.bind( this ) );
  ytdl.on( 'close', this.onClose.bind( this ) );
}

util.inherits( YTSong, Song );

YTSong.prototype.onData = function ( data ) {
  data = data.toString().trim();
  
  if ( data.match( /^\[download\]/ ) ) {
    if ( d = data.match( /^\[download\] +([.0-9]+)% of ([.0-9]+)([a-z]+) at ([.0-9]+)([a-z]+\/s) ETA ([:0-9]+)/i ) ) {
      var status = {
        percent: +d[1],
        
        size: +d[2],
        size_unit: d[3],
        
        speed: +d[4],
        speed_unit: d[5],
        
        eta: d[6]
      };
      
      this.emit( "downloading", status );
    }
    
    else if (
      ( d = data.match( /^\[download\] +Destination: (.+)$/ ) ) || 
      ( d = data.match( /^\[download\] +(.+) has already been downloaded$/ ) ) ) {
      this.filename = d[1];
      this.title = this.title || path.basename( this.filename, path.extname( this.filename ) );
    }
  }
  else if ( data.match( /^\[info\]/ ) ) {
    if ( d = data.match( /^\[info\] +Writing video description metadata as JSON to: (.+)/ ) ) {
      var metadata_file = d[1].trim();
      
      fs.readFile( metadata_file, ( function( err, data ) {
        if ( ! err ) {
          try {
            var metadata = JSON.parse( data );
            this.title = metadata.title;
          }
          catch ( e ) {
            console.warn( "JSON metadata parse error", e );
          }
        }
      }).bind( this ));
    }
  }
  else if ( data.match( /^\[youtube\]/ ) ) {
    if ( d = data.match( /^\[youtube\] +(.+):/ ) ) {
      //this.ytid = d[1].trim();
    }
  }
};

YTSong.prototype.onError = function ( data ) {
  this.emit( 'error', data + "" );
};

YTSong.prototype.onClose = function ( code ) {
  switch ( code ) {
    case 0:
      this.status = DOWNLOADED;
    break;
    
    default:
      this.status = ERROR;
  }
  
  this.emit( "end", code );
};

YTSong.prototype.isValid = function () {
  return this.status === DOWNLOADED && Song.prototype.isValid.call( this );
};

module.exports = YTSong;
