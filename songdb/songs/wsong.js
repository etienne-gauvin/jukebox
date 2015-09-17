var Song = require( './song' );
var util = require( 'util' );
var child_process = require( 'child_process' );
var fs = require( 'fs' );
var path = require( 'path' );

/**
 * Download a song from Youtube
 * @param <String> url
 * @param <String> output_filename
 */
function WSong( url, output_filename ) {
  Song.call( this, {
    status: "downloading",
    download_percent: 0,

    filename: null,
    source: url
  } );

  this.status = "downloading";

  var ytdl = child_process.spawn( 'youtube-dl', [
    "--no-playlist",
    "--restrict-filenames",
    "--output=" + output_filename,
    "--extract-audio",
    "--audio-format=best",
    //"--embed-thumbnail",
    "--newline",
    "--write-info-json",
    url
  ] );

  // Listeners
  ytdl.stdout.on( 'data', this.onData.bind( this ) );
  ytdl.stderr.on( 'data', this.onError.bind( this ) );
  ytdl.on( 'close', this.onClose.bind( this ) );
}

util.inherits( WSong, Song );

WSong.prototype.onData = function ( data ) {
  data = data.toString().trim();

  console.log( "[ytdl]\t" + data );

  if ( data.match( /^\[download\]/ ) ) {
    if ( d = data.match( /^\[download\] +([.0-9]+)% of ([.0-9]+)([a-z]+) at ([.0-9]+)([a-z]+\/s) ETA ([:0-9]+)/i ) ) {
      var status = {
        percent: +d[ 1 ],

        size: +d[ 2 ],
        size_unit: d[ 3 ],

        speed: +d[ 4 ],
        speed_unit: d[ 5 ],

        eta: d[ 6 ]
      };

      this.download_percent = status.percent;
      this.emit( "update_download_percent", this );

    } else if (
      ( d = data.match( /^\[download\] +Destination: (.+)$/ ) ) ||
      ( d = data.match( /^\[download\] +(.+) has already been downloaded$/ ) ) ) {
      this.filename = d[ 1 ];
    }
  } else if ( data.match( /^\[info\]/ ) ) {
    if ( d = data.match( /^\[info\] +Writing video description metadata as JSON to: (.+)$/ ) ) {
      var metadata_file = d[ 1 ].trim();

      setTimeout( ( function () {
        try {
          var data = fs.readFileSync( metadata_file ).toString();
          var metadata = JSON.parse( data );

          this.title = metadata.fulltitle || metadata.title;
          this.extractor = metadata.extractor;
          this.uploader = metadata.uploader;
          this.filename = metadata._filename;
          this.source = metadata.webpage_url;
          this.id = this.extractor + "_" + metadata.id + "_" + Math.floor( Math.random() * 0xFFFFFFFF );

          this.emit( 'id', this );

        } catch ( e ) {
          console.warn( "[dl]\tJSON metadata parse error", e );
        }
      } ).bind( this ), 500 );
    }
  }
};

WSong.prototype.onError = function ( data ) {
  this.emit( 'error', data + "" );
};

WSong.prototype.onClose = function ( code ) {
  switch ( code ) {
    case 0:
      if ( this.status === 'downloading' ) {
        this.status = 'downloaded';
      }

      this.download_percent = 1;

      break;

    default:
      this.status = 'error';
  }

  setTimeout( ( function () {
    this.emit( "end", code );
  } ).bind( this ), 1000 );
};

WSong.prototype.isValid = function () {
  return this.status === 'downloaded' && Song.prototype.isValid.call( this );
};

module.exports = WSong;
