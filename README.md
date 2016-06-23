
# unstemizer

`unstemizer` allows you to access each part of a [Stems](http://www.stems-music.com/) file.
A Stems file is a music format that contains four ‘stems’: Drums, Bassline, Melody, and Vocal stems.
This format allows DJs to control each track independently.


## createUnstemizer(buffer)

Takes a [Buffer](https://nodejs.org/api/buffer.html) and examines the file’s contents. It returns an `unstemizer` object, which you can use to extract parts.

- __drums()__, __bassline()__, __melody()__, __vocal()__

  Mutates the `buffer` by enabling/disabling and re-arranging the track numbers so that when decoded using an ordinary MP4 decoder, the selected stems will be played back.

- __reset()__

  Mutates the `buffer` to restore the original master track.

These functions are synchronous.
