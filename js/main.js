import {
  parseComponentsList,
  resetAttributes,
  wrapValidTextComponents,
  scrollToEl,
  addLeaderLineToEl,
  destroyLeaderLines,
  declension,
  revertAttributes,
} from '../utils/index.js';

import {
  updateHistory,
  getUserHistory,
  popHistoryData,
} from '../utils/history.js'

let common = {};

window.onload = () => onInit();

function onInit() {
  common = {};
  common.app = document.getElementById('app');
  common.app.innerText = '';
  common.app.classList.add('step__1');
  common.app.insertAdjacentHTML('afterbegin', `
    <button class="btn btn--primary mb-32" id="load-file-btn">Проверить документы</button>
    <div class="subtitle">Мы поддерживаем документы в формете .txt</div>
    <input style="display: none" type="file" name="loadFileInput" id="load-file-input">
  `);

  const uploadDocBtn = document.getElementById('load-file-btn');

  uploadDocBtn.addEventListener('click', () => {
    const inputElement = document.getElementById('load-file-input');
    inputElement.addEventListener('change', handleFile, false);
      inputElement.click();
  });
}

function handleFile(e) {
  const fileNameNode = document.getElementById('file-name');
  const file = e.target.files[0];
  let formData = new FormData();
  formData.append(file.name, file);

  if (file.type === 'text/plain') {
    common.fileName = file.name;
    fileNameNode.textContent = common.fileName;
    common.app.classList.add('step__2');
    common.app.innerHTML = '';
    common.app.insertAdjacentHTML('afterbegin', `
      <div class="mb-32"><div class="loader"></div></div>
      <div class="subtitle">Подождите документ обрабатывается</div>
    `);


    // fetch('./data.json')
    //   .then(response => response.json())
    //   .then(data => {
    //     common.initialDocData = data;
    //     localStorage.setItem('data', JSON.stringify(data))
    //   })
    //   .then(onInitResults);
    setTimeout(() => {
      fetch('./data.json')
        .then(response => response.json())
        .then(data => {
          common.initialDocData = data;
          localStorage.setItem('data', JSON.stringify(data))
        })
        .then(onInitResults);
    }, 0);

  } else {
    console.log('!!!!error');
  }
}

function onInitResults() {
  common.app.innerHTML = '';
  common.app.className = '';
  common.app.classList.add('step__3');

  const initialDocData = common.initialDocData;

  common.foundComponentsList = initialDocData.found_components.map(item => {
    const descriptionText = initialDocData.description[item.component_name];
    return {descriptionText, ...item};
  })
  common.unfoundComponentsList = initialDocData.unfound_components.map(item => {
    const descriptionText = initialDocData.description[item.component_name];
    return {descriptionText, ...item};
  })

  common.app.insertAdjacentHTML('afterbegin', `
    <div class="title">Результат проверки документа</div>
      <div class="subtitle file--name mb-42">${common.fileName}</div>
      <div class="result-container">
        <div class="box">
          <div class="box__title error">
            <span class="amount">
              ${common.unfoundComponentsList.length}
            </span>
            ${declension(common.unfoundComponentsList.length, [
                'раздел отсутствует',
                'раздела отсутствуют',
                'разделов отсутствуют',
              ])
            }
          </div>
          <div class="box__list">
            ${parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="box">
          <div class="box__title valid">
            <span class="amount">
              ${common.foundComponentsList.length}
            </span>
            ${declension(common.foundComponentsList.length, [
                'валидный раздел',
                'валидных разделов',
                'валидных разделов',
              ])
            }
          </div>
          <div class="box__list">
            ${parseComponentsList(common.foundComponentsList)}
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

function showStructure() {
  window.scrollTo(0, 0);

  const initialDocData = common.initialDocData;

  common.app.innerHTML = '';
  common.app.className = '';
  common.app.classList.add('step__4');
  common.app.insertAdjacentHTML('afterbegin', `
      <div class="result-container">
        <div class="box error">
          <div class="box__header">
            <div class="box__title">
              <span class="amount" id="error-options-amount">
                 ${common.unfoundComponentsList.length}
              </span> 
              ${declension(common.unfoundComponentsList.length, [
                  'Отсутсвует',
                  'Отсутсвуют',
                  'Отсутсвуют',
                ])
              }
            </div>   
          </div>
          <div class="box__list" data-simplebar data-simplebar-auto-hide="false">
            ${parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="doc__view" data-simplebar data-simplebar-auto-hide="false">
          <div class="doc__data" id="doc-data">${initialDocData.text} <div id="cal1">&nbsp;</div>
          <div id="cal2">&nbsp;</div></div>
        
        </div>
        <div class="box valid">
          <div class="box__header">
            <div class="box__title">
              <span class="amount">${common.foundComponentsList.length}</span>
              ${declension(common.foundComponentsList.length, [
                  'Присутствует',
                  'Присутствуют',
                  'Присутствуют',
                ])
              }
            </div>
            <div class="">
              <div class="slider-checkbox">
                <input type="checkbox" id="view-trigger" name="view-trigger">
                <label for="view-trigger"></label>
              </div>
            </div>
          </div>
          <div class="box__list" data-simplebar data-simplebar-auto-hide="false" id="box-valid">
            ${parseComponentsList(common.foundComponentsList)}
          </div>
        </div>
      </div>
  `);

  const docView = document.querySelector('.doc__view');
  const docData = document.getElementById('doc-data');
  const validOptionsContainer = document.querySelector('.box.valid');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');
  const errorOptionsContainer = document.querySelector('.box.error');
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');
  const viewTrigger = document.getElementById('view-trigger');
  const errorOptionsAmount = document.querySelector('.box.error .amount');
  const validOptionsAmount = document.querySelector('.box.valid .amount');

  const modal = document.getElementById('modal');
  const modalInput = document.getElementById('name-of-component');

  //оборачиваем все валидные текстовые объекты
  wrapValidTextComponents(validOptions, errorOptions, common.initialDocData.text);
  common.wrappedData = docData.innerHTML;

  //гетим выделенный фрагмент текста
  // docData.addEventListener('mouseup', e => {
  //   setTimeout(() => {
  //     if (window.getSelection().toString().length) {
  //       let scrollTop = document.documentElement.scrollTop;
  //       modal.style.display = 'flex';
  //       modal.style.left = `${e.clientX}px`;
  //       modal.style.top = `${e.clientY + scrollTop}px`;
  //       let exactText = window.getSelection().toString();
  //       console.log('!!!!text', exactText);
  //
  //     }
  //   }, 10);
  // });
  // document.documentElement.addEventListener('mousedown', (e) => {
  //   if (e.target.closest('#modal')) {
  //     return;
  //   }
  //
  //   modal.style.display = 'none';
  // });

  const ele = document.getElementById('modal');
  const sel = window.getSelection();
  const rel1= document.createRange();
  rel1.selectNode(document.getElementById('cal1'));
  const rel2= document.createRange();
  rel2.selectNode(document.getElementById('cal2'));
  document.querySelector('.doc__view').addEventListener('mouseup', function () {
    if (!sel.isCollapsed) {
      console.log('selected text', sel)
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const rb1 = rel1.getBoundingClientRect();
      const rb2 = rel2.getBoundingClientRect();
      ele.style.top = (r.bottom - rb2.top)*100/(rb1.top-rb2.top) + 'px'; //this will place ele below the selection
      ele.style.left = (r.left - rb2.left)*100/(rb1.left-rb2.left) + 'px'; //this will align the right edges together

      //code to set content

      ele.style.display = 'block';
    }
  });

  viewTrigger.addEventListener('change', () => {
    console.log('click');
    docView.classList.toggle('highlighted');

  });

  document.onkeydown = () => {
    let evtobj = window.event ? event : e

    if (evtobj.keyCode === 90 && evtobj.ctrlKey) {
      const historyData = getUserHistory();
      console.log(historyData)
      if (historyData.length) {
        // common.wrappedData = historyData[historyData.length - 1].wrappedData;
        // docData.innerHTML = historyData[historyData.length - 1].wrappedData;

        destroyLeaderLines();
        const btnAddContent = document.querySelector('#btn-paste-content');
        if (btnAddContent) btnAddContent.remove();
        [...validOptions, ...errorOptions].forEach(item => {
          item.classList.remove('active');
        });


        //переносим елемент
        const errorOptionsContainerList = document.querySelector('.box.error .simplebar-content')
          ? document.querySelector('.box.error .simplebar-content')
          : document.querySelector('.box.error .box__list');
        const removedElData = historyData[historyData.length - 1];

        //удаляем ревертнутый текст из дома
        document.querySelector(`.doc__view .highlight[name="${removedElData.name}"]`).remove();

        revertAttributes(removedElData.startIndex, removedElData.lengthOfData);

        removedElData.hideOption.removeEventListener('click', validFunc)
        removedElData.hideOption.addEventListener('click', errorFunc)
        errorOptionsContainerList.insertBefore(removedElData.hideOption, errorOptionsContainerList.firstChild);

        popHistoryData();

        errorOptionsAmount.textContent = +errorOptionsAmount.textContent + 1;
        validOptionsAmount.textContent = +validOptionsAmount.textContent - 1;

      }
    }
  };

  validOptions.forEach(function(validOption, idx) {
    validOption.addEventListener('click', validFunc);
  });

  errorOptions.forEach(function(errorOption) {
    errorOption.addEventListener('click', errorFunc);
  });
}

function validFunc() {
  destroyLeaderLines();
  const btnAddContent = document.querySelector('#btn-paste-content');
  if (btnAddContent) btnAddContent.remove();

  const errorOptions = document.querySelectorAll('.box.error .box__list__item');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');
  const docView = document.querySelector('.doc__view');
  const docData = document.getElementById('doc-data')
  const componentName = this.getAttribute('name');

  //очищаем от кнопки вставить в случае если она есть
  // docData.innerHTML = common.wrappedData;


  [...validOptions, ...errorOptions].forEach(item => {
    item.classList.remove('active');
  });

  this.classList.add('active');

  //скролим к нужному элементу
  scrollToEl(
    docView,
    docView.querySelector(`.highlight[name="${componentName}"]`),
    20
  );

  addLeaderLineToEl(this, componentName, false);
}

function errorFunc() {
  destroyLeaderLines();
  const btnAddContent = document.querySelector('#btn-paste-content');
  if (btnAddContent) btnAddContent.remove();
  const initialDocData = common.initialDocData;
  const errorOptionsAmount = document.querySelector('.box.error .amount');
  const validOptionsAmount = document.querySelector('.box.valid .amount');
  const docData = document.getElementById('doc-data')
  const docView = document.querySelector('.doc__view');
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');

  //сетим глобально обернутые куски текста
  let docDataWrapped = docData.innerHTML;
  const setContentIndex = +this.getAttribute('set-content-index');
  const name = this.getAttribute('name');

  if (this.getAttribute('disabled')) return;

  [...validOptions, ...errorOptions].forEach(item => {
    item.classList.remove('active');
  });

  this.classList.add('active');

  console.log('setContentIndex', setContentIndex);
  docData.innerHTML =
    docData.innerHTML.substring(0, setContentIndex) +
    '<div id="btn-paste-content" class="btn-paste-content">' +
      '<div class="inner">Вставить</div>' +
    '</div>' +
    docData.innerHTML.substring(setContentIndex, docData.innerHTML.length);



  const btnPasteMissingOption = document.querySelector('#btn-paste-content');

  //чтобы скролить к контенту в случае с overflow scroll
  scrollToEl(docView, btnPasteMissingOption, 90);

  addLeaderLineToEl(this, '', true);

  btnPasteMissingOption.addEventListener('click', () => {
    const componentName = this.getAttribute('name');
    const index = +this.getAttribute('set-content-index');
    const pasteData = initialDocData.unfound_components
      .find((component) => component.component_name === componentName);

    this.classList.remove('active');

    errorOptionsAmount.textContent = +errorOptionsAmount.textContent - 1;
    validOptionsAmount.textContent = +validOptionsAmount.textContent + 1;

    destroyLeaderLines();
    const btnAddContent = document.querySelector('#btn-paste-content');
    if (btnAddContent) btnAddContent.remove();

    docData.innerHTML =
      docData.innerHTML.substring(0, setContentIndex) +
      `<div name="${name}" class="highlight">${pasteData.text}</div>` +
      docData.innerHTML.substring(setContentIndex, docData.innerHTML.length);

    //переносим елемент
    const validOptionsContainerList = document.querySelector('.box.valid .simplebar-content')
      ? document.querySelector('.box.valid .simplebar-content')
      : document.querySelector('.box.valid .box__list');
    // const removedElNode = document.querySelector(`.box.error .box__list__item[name="${name}"]`);
    // const removedElNodeClone = this.cloneNode(true);

    // removedElNode.style.display = 'block';
    console.log('this',this)
    this.removeEventListener('click', errorFunc);
    this.addEventListener('click', validFunc );
    validOptionsContainerList.insertBefore(this, validOptionsContainerList.firstChild);

    updateHistory(this, `<div name="${name}" class="highlight">${pasteData.text}</div>`.length, index, name);
    resetAttributes(index, `<div name="${name}" class="highlight">${pasteData.text}</div>`.length);

  });
}