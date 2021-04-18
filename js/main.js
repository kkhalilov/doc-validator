import {parseComponentsList, resetAttributes} from '../utils/index.js';

window.onload = () => onInit()


function onInit() {
  window.app = document.getElementById('app');
  const uploadDocBtn = document.getElementById('check-doc');

  uploadDocBtn.addEventListener('click', uploadDoc);
}


function uploadDoc() {
  app.innerHTML = '';
  app.insertAdjacentHTML('afterbegin', `
    <div class="mb-32"><div class="loader"></div></div>
    <div class="subtitle">Подождите документ обрабатывается</div>
  `);

  fetch('./data.json')
    .then(response => response.json())
    .then(data => {
      window.initialDocData = data;
      localStorage.setItem('data', JSON.stringify(data))
    })
    .then(onInitResults);
}

function onInitResults() {
  app.innerHTML = '';
  app.className = '';
  console.log(app);

  app.classList.add('step__3');

  const docData = window.initialDocData;

  window.foundComponentsList = docData.found_components.map(item => {
    const descriptionText = docData.description[item.component_name];

    return {descriptionText, ...item};
  })
  window.unfoundComponentsList = docData.unfound_components.map(item => {
    const descriptionText = docData.description[item.component_name];

    return {descriptionText, ...item};
  })

  app.insertAdjacentHTML('afterbegin', `
    <div class="title">Результат проверки документа</div>
      <div class="subtitle file--name mb-42">“Мой новый договор-new-lastversion.txt”</div>
      <div class="result-container">
        <div class="box">
          <div class="box__title error">
            <span class="amount">${window.unfoundComponentsList.length}</span> раздела отсутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(window.unfoundComponentsList)}
          </div>
        </div>
        <div class="box">
          <div class="box__title valid">
            <span class="amount">${window.foundComponentsList.length}</span> валидных разделов
          </div>
          <div class="box__list">
            ${parseComponentsList(window.foundComponentsList)}
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <button type="button" class="btn btn--primary" id="show-structure">Показать структуру</button>
      </div>
  `);

  const showStructureBtn = document.getElementById('show-structure');

  showStructureBtn.addEventListener('click', showStructure)

}

function showStructure() {
  const docData = window.initialDocData;

  app.innerHTML = '';
  app.className = '';
  app.classList.add('step__4');
  app.insertAdjacentHTML('afterbegin', `
      <div class="result-container">
        <div class="box error">
          <div class="box__title">
            <span class="amount">${window.unfoundComponentsList.length}</span> Отсутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(window.unfoundComponentsList)}
          </div>
        </div>
        <div class="doc__view">
          <div id="doc-data">${docData.text}</div>
        </div>
        <div class="box valid" id="box-valid">
          <div class="box__title">
            <span class="amount">${window.foundComponentsList.length}</span> Присутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(window.foundComponentsList)}
          </div>
        </div>
      </div>
  `);

  const docDataContainer = document.getElementById('doc-data');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');


  //гетим выделенный фрагмент текста
  // docDataContainer.addEventListener('mouseup', event => {
  //   if (window.getSelection().toString().length) {
  //     let exactText = window.getSelection().toString();
  //     console.log('!!!!text', exactText)
  //     console.log('x', event.clientX)
  //     console.log('y', event.clientY)
  //   }
  // });

  validOptions.forEach(function(item) {
    item.addEventListener('mouseover', () => {
      const highlightIndices = item.getAttribute('highlight-indices').split(',');
      let docDataText = window.initialDocData.text;

      [...document.querySelectorAll('svg.leader-line')].forEach(item => {
        item.remove();
      });

      [...document.querySelectorAll('.box.valid  .box__list__item, .box.error  .box__list__item')].forEach(item => {
        item.classList.remove('active');
      });

      item.classList.add('active');

      highlightIndices.forEach(indices => {
        const startIndex = +indices.split('/')[0];
        const stopIndex = +indices.split('/')[1];

        docDataText =
          docDataText.substring(0, startIndex)  +
          '<span class="highlight">' +
            docDataText.substring(startIndex, stopIndex)  +
          '</span>' +
          docDataText.substring(stopIndex, docDataText.length);
      });

      docDataContainer.innerHTML = docDataText;

      highlightIndices.forEach((indices, index) => {
        const start = item;
        const end = document.querySelectorAll('.highlight')[index];

        if (start !== undefined && end !== null) {
          // item.arrow = new LeaderLine(
          //   start, end,
          //   {
          //     path: 'grid',
          //     color: '#00CB5D',
          //     startPlug: 'behind',
          //     endPlug: 'disc',
          //     startSocket: 'left',
          //     endSocket: 'right'
          //   }
          // );
        }
      })

    });

    item.addEventListener('mouseleave', event => {});
  });

  errorOptions.forEach(function(item) {
    item.addEventListener('mouseover', () => {
      const setContentIndex = +item.getAttribute('set-content-index');

      if (item.getAttribute('disabled')) return

      let docDataText = docData.text;

      [...document.querySelectorAll('svg.leader-line')].forEach(item => {
        item.remove();
      });

      [...document.querySelectorAll('.box.error  .box__list__item, .box.valid .box__list__item')].forEach(item => {
        item.classList.remove('active');
      });

      item.classList.add('active');

      docDataText =
        window.initialDocData.text.substring(0, setContentIndex) +
        '<div id="btn-paste-content" class="btn-paste-content">' +
          '<div class="inner">Вставть</div>' +
        '</div>' +
        window.initialDocData.text.substring(setContentIndex, window.initialDocData.text.length);

      docDataContainer.innerHTML = docDataText;

      const actionBtn = document.getElementById('btn-paste-content');

      actionBtn.addEventListener('click', (e) => {
        const componentName = item.getAttribute('component-name');
        const index = +item.getAttribute('set-content-index');
        const pasteData = docData.unfound_components.find((component) => component.component_name === componentName);

        index === 0
          ? pasteData.text = pasteData.text + '\n'
          : pasteData.text = '\n' + pasteData.text + '\n';

        window.initialDocData.text =
          window.initialDocData.text.substring(0, setContentIndex) +
          `${pasteData.text}` +
          window.initialDocData.text.substring(setContentIndex, window.initialDocData.text.length);

        docDataContainer.innerHTML = window.initialDocData.text;
        item.setAttribute('disabled', 'true');
        resetAttributes(index, pasteData.text.length)
      })

      if (item !== null && actionBtn !== null) {
        // item.arrow = new LeaderLine(
        //   item, actionBtn,
        //   {
        //     path: 'grid',
        //     color: '#FF2E86',
        //     startPlug: 'behind',
        //     endPlug: 'disc',
        //     startSocket: 'right',
        //     endSocket: 'left'
        //   }
        // );
      }
    });

    item.addEventListener('mouseleave', event => {});
  });
}