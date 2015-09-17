var songdb = require( "../songdb" );

module.exports = function ( http ) {

  // websocket server
  var io = require( 'socket.io' )( http );

  io.on( 'connection', function ( socket ) {
    console.log( "[io]\tuser connected" );

    songdb.songs.find().toArray( function( err, songs ) {
      songs.forEach( function ( song ) {
        socket.emit( "add_song", song );
      } );
    } );

    socket.on( 'req_song', function ( url ) {
      console.log( "[io]\tnew yt song request: " + url );

      songdb.downloadSong( url, function( song ) {

        io.emit( "add_song", song.dehydrate() );

      }, function ( song ) {

        io.emit( "song_download_update", song.dehydrate() );

      }, function ( err, song ) {

        if ( err ) {
          console.log( "[io]\treq_song_error", err );
        }
        else {
          console.log( "[io]\tsong_download_done: ", song.title );
        }

        socket.emit( 'req_song_done', song.dehydrate() );
        io.emit( "song_download_done", song.dehydrate() );
      } );
    } );

    socket.on( 'disconnect', function () {
      console.log( "[io]\tuser disconnected" );
    } );
  } );

};
