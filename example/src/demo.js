
import createUnstemizer from '../../'

const app = document.querySelector('#app')
app.innerHTML = 'Please drop a .stem.mp4 file here. Please use Google Chrome.'

window.addEventListener('dragenter', onDragEnter, false)
window.addEventListener('dragover', onDragOver, false)
window.addEventListener('drop', onDrop, false)

function onDragEnter (e) {
  e.preventDefault()
  e.stopPropagation()
}

function onDragOver (e) {
  e.preventDefault()
  e.stopPropagation()
}

function onDrop (e) {
  e.preventDefault()
  e.stopPropagation()
  log('File dropped!')
  try {
    const file = e.dataTransfer.files[0]
    const reader = new FileReader()
    reader.onload = handleArrayBuffer
    reader.readAsArrayBuffer(file)
  } catch (e) {
    log('Error in onDrop: ' + e)
  }
}

function handleArrayBuffer () {
  try {
    const arrayBuffer = this.result
    const buffer = new Buffer(arrayBuffer.slice(0))
    const unstemizer = createUnstemizer(buffer)
    unstemizer.drums(); show('Drums')
    unstemizer.bassline(); show('Bassline')
    unstemizer.melody(); show('Melody')
    unstemizer.vocal(); show('Vocal')

    function show (title) {
      const blob = new Blob([ buffer ], { type: 'audio/mp4'})
      const url = URL.createObjectURL(blob)
      const audio = document.createElement('audio')
      audio.controls = true
      audio.src = url
      log(title + ':')
      app.appendChild(audio)
    }
  } catch (e) {
    log('Error in handleArrayBuffer: ' + e)
  }
}


function log (text) {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(text))
  app.appendChild(div)
}
