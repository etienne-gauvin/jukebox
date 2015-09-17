( function ( window ) {

  var svg

  var requesting_song = false;

  var socket = io();

  socket.on( 'connect', function () {
    console.log( "connected" );

    $( '#req_song_form [disabled]' ).removeAttr( "disabled" );
  } );

  /**
   * request a song from web
   */
  $( '#req_song_form' ).submit( function ( event ) {
    console.log( "req_song", url );

    event.preventDefault();

    requesting_song = true;
    $( '#req_song_form input' ).attr( "disabled", "disabled" );

    var url = $( '#req_song_form input[type="url"]' ).val();
    socket.emit( "req_song", url );
  } );

  /**
   *  req_song_done
   */
  socket.on( 'req_song_done', function ( song ) {
    console.log( "req_song_done", song );

    requesting_song = false;
    $( '#req_song_form [disabled]' ).removeAttr( "disabled" );
    $( '#req_song_form [type="url"]' ).val("");
  } );

  /**
   *  req_song_error
   */
  socket.on( 'req_song_error', function ( error ) {
    console.log( "req_song_error", wsong );

    requesting_song = false;
    $( '#req_song_form [disabled]' ).removeAttr( "disabled" );
    $( '#req_song_form [type="url"]' ).val("");
  } );

  /**
   * add song to playlist
   */
  socket.on( 'add_song', function ( song ) {
    var $playlist = $( "#playlist" );
    var $song = $( '<li class="song" />' );

    $song.attr( 'data-id', song.id );

    console.log( "add_song", song );

    $playlist.prepend( $song );

    $song.append( $( '<strong class="title" />' ).text( song.title ) );
    $song.append( $( '<em class="percent" />' ) );
    $song.append( $( '<a class="source" target="_blank">#</a>' ).attr( 'href', song.source ) );
    $song.append( $( '<p class="uploader" />' ).text( song.uploader ) );

    if ( song.status ) {
      $song.addClass( song.status );
    }
  } );

  /**
   * song_download_update
   */
  socket.on( 'song_download_update', updateSong );
  socket.on( 'song_download_done', updateSong );

  function updateSong( song ) {
    console.log( "song update", song );

    var $playlist = $( "#playlist" );
    var $song = $( '#playlist .song[data-id="' + song.id + '"]' );

    if ( song.status === "downloading" ) {
      $song.addClass( "downloading" );
      $song.children( ".percent" ).text( song.download_percent + "%" );
    }
    else if ( song.status === "downloaded" || song.status === "error" ) {
      $song.removeClass( "downloading" );
      $song.addClass( song.status );
      $song.children( ".percent" ).remove();
    }
  }


} )( window );
