'use strict';

function createUnstemizer(buffer) {
  var tracks = [];
  if (buffer.toString('utf8', 4, 8) !== 'ftyp') throw new Error('Not an MP4 file.');

  // Parse the MP4 file format to extract the track headers...
  function readAtom(offset, max, parentInfo) {
    var bufferSize = buffer.readInt32BE(offset);
    var name = buffer.toString('utf8', offset + 4, offset + 8);
    if (name === 'moov') {
      return readAtom(offset + 8, offset + bufferSize);
    }
    if (name === 'trak') {
      readAtom(offset + 8, offset + bufferSize, {
        offset: offset,
        bufferSize: bufferSize,
        slice: buffer.slice(offset, offset + bufferSize)
      });
    }
    if (name === 'tkhd') {
      var long = !!buffer.readInt8(offset + 8);
      var enabledOffset = offset + 8 + 3;
      var enabled = !!buffer.readInt8(enabledOffset);
      var trackNumberOffset = offset + 8 + 4 + (long ? 16 : 8);
      var trackNumber = buffer.readInt32BE(trackNumberOffset);
      tracks.push(Object.assign({
        trackNumber: trackNumber,
        trackNumberOffset: trackNumberOffset,
        enabled: enabled,
        enabledOffset: enabledOffset
      }, parentInfo));
      return;
    }
    if (offset + bufferSize + 8 < max) {
      readAtom(offset + bufferSize, max);
    }
  }
  readAtom(0, buffer.length);

  if (tracks.length !== 5) throw new Error('Expected stem to have 5 tracks.');
  for (var i = 1; i < 5; i++) {
    if (tracks[i - 1].offset + tracks[i - 1].bufferSize !== tracks[i].offset) {
      throw new Error('Tracks ' + tracks[i].trackNumber + ' are not consecutive with previous track!');
    }
  }

  function getTrack(trackNumber) {
    var result = tracks.filter(function (track) {
      return trackNumber === track.trackNumber;
    })[0];
    if (!result) throw new Error('Cannot find track number: ' + trackNumber);
    return result;
  }
  function setTrackNumber(originalTrackNumber, targetTrackNumber) {
    var track = getTrack(originalTrackNumber);
    buffer.writeInt32BE(targetTrackNumber, track.trackNumberOffset);
  }
  function setEnabled(originalTrackNumber, enabled) {
    var track = getTrack(originalTrackNumber);
    buffer.writeInt8(enabled ? 1 : 0, track.enabledOffset);
  }
  function write() {
    var offset = tracks[0].offset;

    for (var _len = arguments.length, sourceTrackNumbers = Array(_len), _key = 0; _key < _len; _key++) {
      sourceTrackNumbers[_key] = arguments[_key];
    }

    for (var _i = 0; _i < 5; _i++) {
      var sourceTrackNumber = sourceTrackNumbers[_i];
      var targetTrackNumber = _i + 1;
      var track = getTrack(sourceTrackNumber);
      track.slice.writeInt32BE(targetTrackNumber, track.trackNumberOffset - track.offset);
      track.slice.writeInt8(_i ? 0 : 1, track.enabledOffset - track.offset);
      track.slice.copy(buffer, offset);
      offset += track.bufferSize;
    }
  }

  return {
    reset: function reset() {
      write(1, 2, 3, 4, 5);
    },
    drums: function drums() {
      write(2, 1, 3, 4, 5);
    },
    bassline: function bassline() {
      write(3, 1, 2, 4, 5);
    },
    melody: function melody() {
      write(4, 1, 2, 3, 5);
    },
    vocal: function vocal() {
      write(5, 1, 2, 3, 4);
    }
  };
}

module.exports = createUnstemizer;