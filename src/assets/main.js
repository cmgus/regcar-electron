(function () {
  const moment = require('moment')
  // set dispDate
  let startDate = new Date().toISOString().substring(0, 10)
  dispStartDate.value = startDate
  let endDate = moment(startDate).add(6, 'M').toISOString().substring(0, 10)
  dispEndDate.value = endDate
})()
const { ipcRenderer } = require("electron")

btnNew.onclick = e => { display(frmNewCarnet, true); txtID.disabled = false; txtValues(null); txtOption.value = '' }
btnDeleteFrmNewCarnet.onclick = e => display(frmNewCarnet, false)
btnFrmNewCarnetCancel.onclick = e => display(frmNewCarnet, false)

btnSearch.addEventListener('click', async e => {
  dispValues(null)
  const { message, status, body } = await ipcRenderer.invoke('find-by-dni', txtSearch.value)

  if (status === 'success') {
    dispValues(body)
  } else {
    dispDangerNotification.classList.remove('is-hidden')
    dispDangerNotificationMessage.innerHTML = message
  }
})

btnRegister.onclick = async e => {
  const data = {
    names: txtNames.value,
    surnames: txtSurnames.value,
    id: txtID.value,
    age: txtAge.value,
    telephone: txtTelephone.value,
    address: txtAddress.value,
    ch: txtCH.value,
  }
  dispValues(null)

  const { message, status, body } = txtOption.value === 'update' ?
    await ipcRenderer.invoke('update-data', data) : await ipcRenderer.invoke('save-data', data)


  // Display notification
  if (status === 'success') {
    dispValues(body)
    dispSuccessNotification.classList.remove('is-hidden')
    dispSuccessNotificationMessage.innerHTML = message
  } else {
    dispDangerNotification.classList.remove('is-hidden')
    dispDangerNotificationMessage.innerHTML = message
  }
  display(frmNewCarnet, false)
}

btnEdit.onclick = async e => {
  txtNames.value = dispNames.value
  txtSurnames.value = dispSurnames.value
  txtAge.value = dispAge.value
  txtID.value = dispID.value
  txtTelephone.value = dispTelephone.value
  txtAddress.value = dispAddress.value
  txtCH.value = dispCH.value
  txtOption.value = 'update'
  txtID.disabled = true
  display(frmNewCarnet, true)
}

btnTestValues.onclick = e => {
  txtValues('testValues')
}

function display(target, option) {
  if (option) target.style.display = 'block'
  else target.style.display = 'none'
}

function txtValues(data) {
  if (data) {
    txtNames.value = data.names
    txtSurnames.value = data.surnames
    txtAge.value = data.age
    txtID.value = data.id
    txtTelephone.value = data.telephone
    txtAddress.value = data.address
    txtCH.value = data.ch
    txtOption.value = ''
  } else {
    txtNames.value = ''
    txtSurnames.value = ''
    txtAge.value = ''
    txtID.value = ''
    txtTelephone.value = ''
    txtAddress.value = ''
    txtCH.value = ''
    txtOption.value = ''
  }
  if (data === 'testValues') {
    txtNames.value = 'GUSTAVO ALONSO'
    txtSurnames.value = 'CONDORI MAMANI'
    txtID.value = '100'
    txtAge.value = 21
    txtTelephone.value = '918273645'
    txtAddress.value = 'CALLE LOS PAPUS'
    txtCH.value = 'T-400'
  }
}

function dispValues(data) {
  if (data) {
    dispNames.value = data.names
    dispSurnames.value = data.surnames
    dispAge.value = data.age
    dispID.value = data.id
    dispTelephone.value = data.telephone
    dispAddress.value = data.address
    dispCH.value = data.ch

  } else {
    dispNames.value = ''
    dispSurnames.value = ''
    dispAge.value = ''
    dispID.value = ''
    dispTelephone.value = ''
    dispAddress.value = ''
    dispCH.value = ''
  }
}