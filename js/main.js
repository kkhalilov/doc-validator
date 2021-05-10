import {
  parseComponentsList,
  resetAttributes,
  wrapValidTextComponents,
  scrollToEl,
  addValidPlugLines
} from '../utils/index.js';

let common = {};

window.onload = () => onInit();

function onInit() {
  common.app = document.getElementById('app');
  const uploadDocBtn = document.getElementById('check-doc');

  uploadDocBtn.addEventListener('click', uploadDoc);
}

function uploadDoc() {
  common.app.innerHTML = '';
  common.app.insertAdjacentHTML('afterbegin', `
    <div class="mb-32"><div class="loader"></div></div>
    <div class="subtitle">Подождите документ обрабатывается</div>
  `);

  fetch('./data.json')
    .then(response => response.json())
    .then(data => {
      common.initialDocData = data;
      localStorage.setItem('data', JSON.stringify(data))
    })
    .then(onInitResults);
}

function onInitResults() {
  common.app.innerHTML = '';
  common.app.className = '';
  common.app.classList.add('step__3');

  const docData = common.initialDocData;

  common.foundComponentsList = docData.found_components.map(item => {
    const descriptionText = docData.description[item.component_name];
    return {descriptionText, ...item};
  })
  common.unfoundComponentsList = docData.unfound_components.map(item => {
    const descriptionText = docData.description[item.component_name];
    return {descriptionText, ...item};
  })

  common.app.insertAdjacentHTML('afterbegin', `
    <div class="title">Результат проверки документа</div>
      <div class="subtitle file--name mb-42">“Мой новый договор-new-lastversion.txt”</div>
      <div class="result-container">
        <div class="box">
          <div class="box__title error">
            <span class="amount">${common.unfoundComponentsList.length}</span> раздела отсутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="box">
          <div class="box__title valid">
            <span class="amount">${common.foundComponentsList.length}</span> валидных разделов
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
        <div class="box error" data-simplebar data-simplebar-auto-hide="false">
          <div class="box__title">
            <span class="amount">${common.unfoundComponentsList.length}</span> Отсутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(common.unfoundComponentsList)}
          </div>
        </div>
        <div class="doc__view" data-simplebar data-simplebar-auto-hide="false">
          <div id="doc-data">${initialDocData.text}</div>
        </div>
        <div class="box valid" data-simplebar data-simplebar-auto-hide="false" id="box-valid">
          <div class="box__title">
            <span class="amount">${common.foundComponentsList.length}</span> Присутствуют
          </div>
          <div class="box__list">
            ${parseComponentsList(common.foundComponentsList)}
          </div>
        </div>
      </div>
  `);

  const docView = document.querySelector('.doc__view');
  const docData = document.getElementById('doc-data');
  const validOptions = document.querySelectorAll('.box.valid .box__list__item');
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');
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

  validOptions.forEach(function(validOption, idx) {
    let timeout;
    const delay = 100;

    validOption.addEventListener('click', () => {
      timeout = setTimeout(() => {
        //очищаем от кнопки вставить в случае если она есть
        docData.innerHTML = common.wrappedData;

        const componentName = validOption.getAttribute('name');

        //удаляем все стрелки и остается одно (лютый костыль)
        // [...document.querySelectorAll('svg.leader-line')].forEach(item => {
        //   item.remove();
        // });

        [...validOptions, ...errorOptions].forEach(item => {
          item.classList.remove('active');
        });

        validOption.classList.add('active');

        //скролим к нужному элементу
        scrollToEl(
          docView,
          docView.querySelector(`.highlight[name="${componentName}"]`),
          20
        );

        addValidPlugLines(validOption, componentName);

      }, delay)
    });

    validOption.addEventListener('mouseleave', () => {
      clearTimeout(timeout);
    });
  });

  errorOptions.forEach(function(errorOption) {
    let timeout;
    const delay = 100;

    errorOption.addEventListener('click', () => {
      timeout = setTimeout(() => {
        //сетим глобально обернутые куски текста
        let docDataWrapped = docData.innerHTML;
        const setContentIndex = +errorOption.getAttribute('set-content-index');

        if (errorOption.getAttribute('disabled')) return

        // [...document.querySelectorAll('svg.leader-line')].forEach(item => {
        //   item.remove();
        // });

        [...validOptions, ...errorOptions].forEach(item => {
          item.classList.remove('active');
        });

        errorOption.classList.add('active');

        docDataWrapped =
          common.wrappedData.substring(0, setContentIndex) +
          '<div id="btn-paste-content" class="btn-paste-content">' +
            '<div class="inner">Вставть</div>' +
          '</div>' +
          common.wrappedData.substring(setContentIndex, common.wrappedData.length);

        docData.innerHTML = docDataWrapped;

        const pasteBtn = docView.querySelector('#btn-paste-content');

        //чтобы скролить к контенту в случае с overflow scroll
        scrollToEl(docView, pasteBtn, 90);

        pasteBtn.addEventListener('click', () => {
          const componentName = errorOption.getAttribute('name');
          const index = +errorOption.getAttribute('set-content-index');
          const pasteData = initialDocData.unfound_components
            .find((component) => component.component_name === componentName);

          index === 0
            ? pasteData.text = pasteData.text + '\n'
            : pasteData.text = '\n' + pasteData.text + '\n';

          common.wrappedData =
            common.wrappedData.substring(0, setContentIndex) +
            `${pasteData.text}` +
            common.wrappedData.substring(setContentIndex, common.wrappedData.length);
          docData.innerHTML = common.wrappedData;

          errorOption.setAttribute('disabled', 'true');
          resetAttributes(index, pasteData.text.length);
        });

        // if (errorOption !== null) {
        //   errorOption.arrow = new LeaderLine(
        //     errorOption, pasteBtn,
        //     {
        //       path: 'grid',
        //       color: '#FF2E86',
        //       startPlug: 'behind',
        //       endPlug: 'disc',
        //       startSocket: 'right',
        //       endSocket: 'left'
        //     }
        //   );
        // }
      }, delay);
    });

    errorOption.addEventListener('mouseleave', () => {
      clearTimeout(timeout);
    });
  });
}