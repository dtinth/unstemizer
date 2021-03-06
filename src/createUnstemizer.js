'use strict'

function createUnstemizer (buffer) {
  const tracks = [ ]
  if (buffer.toString('utf8', 4, 8) !== 'ftyp') throw new Error('Not an MP4 file.')

  // Parse the MP4 file format to extract the track headers...
  function readAtom (offset, max, parentInfo) {
    const bufferSize = buffer.readInt32BE(offset)
    const name = buffer.toString('utf8', offset + 4, offset + 8)
    if (name === 'moov') {
      return readAtom(offset + 8, offset + bufferSize)
    }
    if (name === 'trak') {
      readAtom(offset + 8, offset + bufferSize, {
        offset,
        bufferSize,
        slice: buffer.slice(offset, offset + bufferSize)
      })
    }
    if (name === 'tkhd') {
      const long = !!buffer.readInt8(offset + 8)
      const enabledOffset = offset + 8 + 3
      const enabled = !!buffer.readInt8(enabledOffset)
      const trackNumberOffset = offset + 8 + 4 + (long ? 16 : 8)
      const trackNumber = buffer.readInt32BE(trackNumberOffset)
      tracks.push(Object.assign({
        trackNumber,
        trackNumberOffset,
        enabled,
        enabledOffset,
      }, parentInfo))
      return
    }
    if (offset + bufferSize + 8 < max) {
      readAtom(offset + bufferSize, max)
    }
  }
  readAtom(0, buffer.length)

  if (tracks.length !== 5) throw new Error('Expected stem to have 5 tracks.')
  for (let i = 1; i < 5; i ++) {
    if (tracks[i - 1].offset + tracks[i - 1].bufferSize !== tracks[i].offset) {
      throw new Error('Tracks ' + tracks[i].trackNumber + ' are not consecutive with previous track!')
    }
  }

  function getTrack (trackNumber) {
    const result = tracks.filter(track => trackNumber === track.trackNumber)[0]
    if (!result) throw new Error('Cannot find track number: ' + trackNumber)
    return result
  }
  function setTrackNumber (originalTrackNumber, targetTrackNumber) {
    const track = getTrack(originalTrackNumber)
    buffer.writeInt32BE(targetTrackNumber, track.trackNumberOffset)
  }
  function setEnabled (originalTrackNumber, enabled) {
    const track = getTrack(originalTrackNumber)
    buffer.writeInt8(enabled ? 1 : 0, track.enabledOffset)
  }
  function write (...sourceTrackNumbers) {
    let offset = tracks[0].offset
    for (let i = 0; i < 5; i ++) {
      const sourceTrackNumber = sourceTrackNumbers[i]
      const targetTrackNumber = i + 1
      const track = getTrack(sourceTrackNumber)
      track.slice.writeInt32BE(targetTrackNumber, track.trackNumberOffset - track.offset)
      track.slice.writeInt8(i ? 0 : 1, track.enabledOffset - track.offset)
      track.slice.copy(buffer, offset)
      offset += track.bufferSize
    }
  }

  return {
    reset () {
      write(1, 2, 3, 4, 5)
    },
    drums () {
      write(2, 1, 3, 4, 5)
    },
    bassline () {
      write(3, 1, 2, 4, 5)
    },
    melody () {
      write(4, 1, 2, 3, 5)
    },
    vocal () {
      write(5, 1, 2, 3, 4)
    }
  }
}

module.exports = createUnstemizer
