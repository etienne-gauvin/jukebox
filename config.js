var path = require("path");

var config = {};

// Base directory for binary files
config.base_directory = path.join( process.env.HOME, "jukebox-data" );

// Filename for the DB file
config.db_filename = path.join( config.base_directory, "song.db" );

// Directory for songs
config.songs_directory = path.join( config.base_directory, "songs" );

// Directory for downloaded songs
config.dl_directory = path.join( config.songs_directory, "downloads" );

module.exports = config;
