import services from '../services/index.js';
import {declension, contains} from '../utils/index.js';

const saveFile = document.getElementById('btn-save-file');
const resetData = document.getElementById('btn-new-fie');
const fileNameNode = document.getElementById('file-name');
let boardWrapper = null;
let common = {};

saveFile.addEventListener('click', () => {
  // const history = services.history.getUserHistory();
  // const listOfEditedOptions = history.map(optData => {
  //   return optData.name;
  // });
  const text = document.querySelector('.doc__view .doc__data').textContent;
  const formData = new URLSearchParams();

  formData.append('text', text);
  formData.append('filename', 'output.docx');

  fetch('http://legaltech.viwo.ru/docx.jsp', {
    method: 'POST',
    body: formData,
  })
    .then(async response => {
      const filename = 'output';
      const extension = 'docx';

      const resBlob = await response.blob();

      const blob = new Blob([resBlob], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const blobURL = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');

      tempLink.style.display = 'none';
      tempLink.href = blobURL;
      tempLink.setAttribute('download', `${filename}.${extension}`);

      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }

      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
      }, 100);
    })
    .catch(e => {
      services.alert.alertShow('Что-то пошло не так, попробуйте еще раз.', 'danger');
      console.error('Ошибка сохранения файла: ', e);
    });
});

resetData.addEventListener('click', () => {
  let resetDataConfirmation = confirm('Вы хотите отменить все изменения в текущем файле?');

  if (resetDataConfirmation) onInit();
});

window.onload = () => onInit();

function onInit() {
  localStorage.clear();
  saveFile.classList.add('d-none', 'disabled');
  resetData.classList.add('d-none');
  fileNameNode.innerHTML = '';

  common = {};
  common.allowTooltips = false;
  common.app = document.getElementById('app');
  common.app.innerText = '';
  common.app.classList.add('step__1');
  common.app.insertAdjacentHTML('afterbegin', `
    <button class="btn btn--primary mb-32" id="uploadFileBtn">Проверить документ</button>
    <div class="subtitle">Поддерживаются документы следующих форматов: doc, docx, rtf, pdf, txt, html.</div>
    <input style="display: none" type="file" name="uploadedDocument" id="uploadedDocument">
  `);

  const uploadDocBtn = document.getElementById('uploadFileBtn');

  uploadDocBtn.addEventListener('click', () => {
    const inputElement = document.getElementById('uploadedDocument');
    inputElement.addEventListener('change', handleFile, false);
    inputElement.click();
  });

  if (boardWrapper) {
    boardWrapper.removeEventListener('mousedown', services.modal.hideModal);
  }

  services.board.destroyLeaderLines();
}

function handleFile(e) {
  const file = e.target.files[0];
  const formData = new FormData();

  formData.append('uploadedDocument', file);

  if (contains(file.name, ['.docx', '.doc', '.pdf', '.rtf', '.html', '.txt'])) {
    common.fileName = file.name;
    fileNameNode.textContent = common.fileName;
    common.app.classList.add('step__2');
    common.app.innerHTML = '';
    common.app.insertAdjacentHTML('afterbegin', `
      <div class="mb-32"><div class="loader"></div></div>
      <div class="subtitle">Подождите документ обрабатывается</div>
    `);

    fetch('http://legaltech.viwo.ru/process.jsp', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        common.initialDocData = data;
        localStorage.setItem('data', JSON.stringify(data))
      })
      .then(onInitResults)
      .catch(e => {
        services.alert.alertShow('Что-то пошло не так, попробуйте еще раз.', 'danger');
        onInit();
        console.error('Ошибка загрузки файла: ', e);
      });
  } else {
    services.alert.alertShow('Формат файла не поддерживается.', 'danger');
  }
}

function onInitResults() {
  resetData.classList.remove('d-none');

  common.app.innerHTML = '';
  common.app.className = '';
  common.app.classList.add('step__3');
  common.app.scrollTo(0,0);

  const initialDocData = common.initialDocData;

  common.foundComponentsList = initialDocData.found_components.map(item => {
    const descriptionText = initialDocData.description[item.component_name];
    return {descriptionText, ...item};
  });

  common.unfoundComponentsList = initialDocData.unfound_components.map(item => {
    const descriptionText = initialDocData.description[item.component_name];
    return {descriptionText, ...item};
  });

  common.app.insertAdjacentHTML('afterbegin', `
    <div class="title">Результат проверки документа</div>
      <div class="subtitle file--name mb-42">${common.fileName}</div>
      <div class="result-container">
        <div class="box">
          <div class="box__title error">
            <span class="amount">
              ${common.unfoundComponentsList.length}
            </span>
            ${declension(common.unfoundComponentsList.length, ['раздел отсутствует', 'раздела отсутствуют', 'разделов отсутствуют'])}
          </div>
          <div class="box__list">
            ${services.build.parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="box">
          <div class="box__title valid">
            <span class="amount">
              ${common.foundComponentsList.length}
            </span>
            ${declension(common.foundComponentsList.length, ['валидный раздел', 'валидных разделов', 'валидных разделов'])}
          </div>
          <div class="box__list">
            ${services.build.parseComponentsList(common.foundComponentsList)}
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <button type="button" class="btn btn--primary" id="show-structure">Показать структуру</button>
      </div>
  `);

  const showStructureBtn = document.getElementById('show-structure');

  showStructureBtn.addEventListener('click', showStructure);
}

async function showStructure() {
  const initialDocData = common.initialDocData;

  saveFile.classList.remove('d-none');

  common.app.innerHTML = '';
  common.app.className = '';
  common.app.classList.add('step__4');
  common.app.insertAdjacentHTML('afterbegin', `
      <div class="result-container">
        <div class="box error">
          <div class="box__header">
            <div class="box__title" data-amount="${common.unfoundComponentsList.length}">
              <span class="amount">
                 ${common.unfoundComponentsList.length}
              </span> 
              ${declension(common.unfoundComponentsList.length, ['Отсутсвует', 'Отсутсвуют', 'Отсутсвуют'])}
            </div>
            <div class="box__undo">
              <img src="../images/icon-undo.svg" alt="undo">
            </div>   
          </div>
          <div class="box__list" data-simplebar data-simplebar-auto-hide="false">
            ${services.build.parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="doc__view" data-simplebar data-simplebar-auto-hide="false">
          <div class="doc__data" id="doc-data">${initialDocData.text}</div>
        </div>
        <div class="box valid">
          <div class="box__header">
            <div class="box__title" data-amount="${common.foundComponentsList.length}">
              <span class="amount">${common.foundComponentsList.length}</span>
              ${declension(common.foundComponentsList.length, ['Присутствует', 'Присутствуют', 'Присутствуют'])}
            </div>
            <div class="">
              <div class="slider-checkbox">
                <input type="checkbox" id="view-trigger" name="view-trigger">
                <label for="view-trigger"></label>
              </div>
            </div>
          </div>
          <div class="box__list" data-simplebar data-simplebar-auto-hide="false" id="box-valid">
            ${services.build.parseComponentsList(common.foundComponentsList)}
          </div>
        </div>
      </div>
  `);

  const docView = document.querySelector('.doc__view');
  const docData = document.getElementById('doc-data');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');
  const viewTrigger = document.getElementById('view-trigger');
  const undoBtn = document.querySelector('.box.error .box__undo');
  boardWrapper = document.querySelector('#app.step__4');

  //оборачиваем все валидные текстовые объекты
  services.build.wrapValidTextComponents(validOptions, errorOptions, common.initialDocData.text);
  services.modal.createModal(common.initialDocData.description);

  //гетим выделенный фрагмент текста
  docData.addEventListener('mouseup', e => {
    if (e.target.closest('.doc__view')) {
      services.modal.showModal(e)
    }
  });

  boardWrapper.addEventListener('mousedown', services.modal.hideModal);

  viewTrigger.addEventListener('change', () => {
    common.allowTooltips = !common.allowTooltips;
    docView.classList.toggle('highlighted');

    services.board.setTooltips(common.allowTooltips);
  });

  undoBtn.addEventListener('click', () => {
      const historyData = services.history.getUserHistory();

      if (historyData.length) {
        services.board.updateOptionsTitles(false, common.unfoundComponentsList.length);
        services.board.clearBoard();

        //переносим елемент
        const errorOptionsContainerList = document.querySelector('.box.error .simplebar-content');
        const removedElData = historyData[historyData.length - 1];
        const revertedTextContent = document.querySelector(`.doc__view .highlight[name='#${removedElData.name}#']`);

        //удаляем ревертнутый текст из дома
        revertedTextContent.remove();

        services.board.revertAttributes(removedElData.startIndex, removedElData.lengthOfData);
        services.history.popHistoryData();

        removedElData.hideOption.removeEventListener('click', validFunc)
        removedElData.hideOption.addEventListener('click', errorFunc)
        errorOptionsContainerList.insertBefore(removedElData.hideOption, errorOptionsContainerList.firstChild);
      }
  });

  validOptions.forEach(function (validOption) {
    validOption.addEventListener('click', validFunc);
  });

  errorOptions.forEach(function (errorOption) {
    errorOption.addEventListener('click', errorFunc);
  });
}

function validFunc() {
  const docView = document.querySelector('.doc__view');
  const componentName = this.getAttribute('name');

  services.board.clearBoard();

  this.classList.add('active');

  //скролим к нужному элементу
  services.board.scrollToEl(
    docView,
    docView.querySelector(`.highlight[name*='#${componentName}#']`),
    20
  );

  services.board.addLeaderLineToEl(this, componentName, false);
}

function errorFunc() {
  const initialDocData = common.initialDocData;
  const docData = document.getElementById('doc-data')
  const docView = document.querySelector('.doc__view');
  const setContentIndex = +this.getAttribute('set-content-index');
  const name = this.getAttribute('name');

  services.board.clearBoard();
  services.board.setTooltips(common.allowTooltips);

  this.classList.add('active');

  docData.innerHTML =
    docData.innerHTML.substring(0, setContentIndex) +
      '<div id="btn-paste-content" class="btn-paste-content">' +
        '<div class="inner">Вставить</div>' +
      '</div>' +
    docData.innerHTML.substring(setContentIndex, docData.innerHTML.length);

  const btnPasteMissingOption = document.querySelector('#btn-paste-content');

  services.board.scrollToEl(docView, btnPasteMissingOption, 90);
  services.board.addLeaderLineToEl(this, '', true);

  btnPasteMissingOption.addEventListener('click', () => {
    const validOptionsContainerList = document.querySelector('.box.valid .simplebar-content');
    const componentName = this.getAttribute('name');
    const index = +this.getAttribute('set-content-index');
    const pasteData = initialDocData.unfound_components.find((component) => {
      return component.component_name === componentName;
    });
    const pastedDataContent = `<div name="#${name}#" class="highlight">${pasteData.text}</div>`;

    services.board.updateOptionsTitles(true, common.unfoundComponentsList.length);
    services.board.clearBoard();

    docData.innerHTML =
      docData.innerHTML.substring(0, setContentIndex) +
        pastedDataContent +
      docData.innerHTML.substring(setContentIndex, docData.innerHTML.length);

    this.removeEventListener('click', errorFunc);
    this.addEventListener('click', validFunc);

    validOptionsContainerList.insertBefore(this, validOptionsContainerList.firstChild);

    services.history.updateHistory(this, pastedDataContent.length, index, name);
    services.board.updateAttributes(index, pastedDataContent.length);
    services.board.setTooltips(common.allowTooltips);
  });
}