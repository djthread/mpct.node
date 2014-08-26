// Create this dir for caching
var cacheDir = process.env['HOME'] + '/.mpct.node';

// For a given genre folder name, this is all the
// different places to look. These will prefix
// the genre name
var locations = [
  // ''
  'tmp/stage/',
  'tmp/stage2/',
  'tmp/stage3/',
  'tmp/stage4/',
];

// My toplevel dir names
var toplevels = {
  am: 'Ambient',
  ab: 'Ambient Beats',
  bb: 'Breakbeat',
  bc: 'Breakcore, Gabber, and Noise',
  ch: 'Chill Out and Dub',
  cl: 'Classical',
  co: 'Compilations',
  dj: 'DJ Beats',
  db: "Drum 'n Bass",
  dt: 'Dub Techno',
  du: 'Dubstep',
  el: 'Electronic and Electro',
  fo: 'Folk',
  go: 'Goa',
  ho: 'House',
  id: 'IDM',
  ja: 'Jazz',
  me: 'Metal',
  mi: 'Minimalistic',
  po: 'Pop',
  pr: 'Post-rock',
  ra: 'Rap and Hip Hop',
  re: 'Reggae and Dub',
  ro: 'Rock',
  sl: 'Soul',
  so: 'Soundtracks',
  te: 'Techno',
  tr: 'Trance',
  th: 'Trip-Hop',
  we: 'Weird',
  wo: 'World and New Age',
};


module.exports.cacheDir  = cacheDir;
module.exports.locations = locations;
module.exports.toplevels = toplevels;
