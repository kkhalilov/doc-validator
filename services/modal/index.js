import services from '../index.js';

let scrollTop = null;
let modalNode = null;
let selectedText = null;

export default class Modal {
  constructor() {
  }

  parseModalOptions(options) {
    return Object.keys(options).map(optionName => {
      return `<option value="${optionName}">${options[optionName]}</option>`
    }).join('');
  }

  createModal(options) {
    const body = document.querySelector('body');

    body.insertAdjacentHTML('afterbegin', `
      <div  class="modal" id="modal">
        <div class="modal__body">
          <form id="client-description">
            <div class="form-group">
              <label for="name-of-component">К какому компоненту вы бы отнесли выделенный фрагмент текста?</label>
              <select name="name-of-component" id="" class="modal__select">
                ${this.parseModalOptions(options)}
              </select>
            </div>
            <div class="modal__submit btn btn--green float-right">Отправить</div>
          </form>
        </div>
      </div>
    `);
    const modalSubmitBtn = document.querySelector('.modal__submit');
    const modalSelect = document.querySelector('.modal__select');

    modalSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('modalSelect.value', modalSelect.value);
      console.log('selectedText', selectedText);

      this.hideModal();

      services.alert.alertShow('Данные отправлены!', 'success');
    });
  }
  showModal(e) {
    setTimeout(() => {
      const docDataWrapper = document.querySelector('.doc__view .simplebar-content-wrapper');

      if (window.getSelection().toString().length) {
        const modal = document.getElementById('modal');

        selectedText = window.getSelection().toString();

        scrollTop = docDataWrapper.scrollTop;
        modalNode = modal;

        modal.classList.add('show');
        modal.style.left = `${e.clientX}px`;
        modal.style.top = `${e.clientY}px`;
        modal.style.transform = 'translate(0, 0)';


        docDataWrapper.addEventListener('scroll', this.updateModalPosition);
      }
    }, 1)
  }

  hideModal() {
    const docDataWrapper = document.querySelector('.doc__view .simplebar-content-wrapper');

    if (modalNode) {
      modalNode.classList.remove('show');
      docDataWrapper.removeEventListener('scroll', this.updateModalPosition)
    }
  }

  updateModalPosition(e) {
    modalNode.style.transform = `translate(0, ${-(e.target.scrollTop - scrollTop)}px)`;
  }
}