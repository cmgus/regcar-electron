const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Load store
const Datastore = require('nedb')
const CarnetStore = new Datastore({ filename: 'db/Carnet.db', autoload: true })
CarnetStore.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
  if (err) return
})

app.allowRendererProcessReuse = true

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 650,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// comunications
ipcMain.handle('find-by-dni', async (e, dni) => {
  try {
    const res = await find_by_dni(CarnetStore, dni)
    return res
  } catch (error) {
    return error
  }
})

ipcMain.handle('save-data', async (e, data) => {
  try {
    const res = await save_data(CarnetStore, data)
    return res
  } catch (error) {
    return error
  }
})
ipcMain.handle('update-data', async (e, data) => {
  try {
    const res = await update_data(CarnetStore, data)
    return res
  } catch (error) {
    return error
  }
})

function update_data(db, data) {
  return new Promise((resolve, reject) => {
    let response = { message: '', status: '', body: '' }
    //let newData = data
    db.update({ id: data.id }, data, async (err, numReplaced) => {
      if (err) {
        console.log(err.errorType, err)
        response.message = 'Hubo un error al actulizarla información.'
        response.status = 'error'
        return reject('error')
      }
      if (numReplaced === null || numReplaced === 0) {
        response.message = 'No se ha encontrado el registro. Intente de nuevo.'
        response.status = 'error'
      } else {
        response.message = 'La información ha sido actualizada.'
        response.status = 'success'
        const res = await find_by_dni(CarnetStore, data.id)
        console.log(res.body)
        response.body = res.body
      }
      resolve(response)
    })
  })
}

function save_data(db, data) {
  return new Promise((resolve, reject) => {
    let response = { message: '', status: '', body: '' }
    db.insert(data, (err, record) => {
      if (err) {
        if (err.errorType === 'uniqueViolated')
          response.message = 'El DNI ingresado ya está registrado.'
        else response.message = 'Ha ocurrido un error al intentar guardar la información.'
        response.status = 'error'
        return reject(response)
      }
      response.message = 'La información ha sido guardada exitosamente.'
      response.status = 'success'
      response.body = record
      resolve(response)
    })
  })
}

function find_by_dni(db, dni) {
  return new Promise((resolve, reject) => {
    let response = { message: '', status: '', body: '' }
    db.findOne({ id: dni }, (err, record) => {
      if (err) {
        console.log(err.errorType, err)
        response.message = 'Hubo un error al buscar el por DNI'
        response.status = 'error'
        return reject('error')
      }
      if (record === null) {
        response.message = 'El registro no se ha encontrado. Intente de nuevo.'
        response.status = 'error'
      } else {
        response.message = 'El registro se ha encontrado'
        response.status = 'success'
        response.body = record
      }
      resolve(response)
    })
  })
}
