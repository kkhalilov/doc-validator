import {declension} from '../../utils/index.js';

let leaderLines = {};

export default class Board {
  constructor() {
  }

  addLeaderLineToEl(start, name, isError) {
    const docDataWrapper = document.querySelector('.doc__view .simplebar-content-wrapper');
    const errorOptionsWrapper = document.querySelector('.box.error .simplebar-content-wrapper');
    const validOptionsWrapper = document.querySelector('.box.valid .simplebar-content-wrapper');

    this.destroyLeaderLines();

    let updateLeaderLinePosition = () => {
      Object.values(leaderLines).map(value => {
        value.position();
      });
    };

    if (!isError) {
      const validOptions = [...document.querySelectorAll(`#doc-data .highlight[name*='#${name}#']`)];
      validOptions.forEach((docElement, idx) => {
        docElement.classList.add('active');

        leaderLines[name + idx] = new LeaderLine(
          start, docElement,
          {
            path: 'grid',
            color: '#00CB5D',
            startPlug: 'behind',
            endPlug: 'arrow3',
            startSocket: 'left',
            endSocket: 'right',
            positionByWindowResize: false,
            showEffectName: 'draw',
          }
        );

        if (errorOptionsWrapper) {
          errorOptionsWrapper.removeEventListener('scroll', updateLeaderLinePosition)
        }

        if (docDataWrapper) {
          docDataWrapper.addEventListener('scroll', updateLeaderLinePosition);
        }

        if (validOptionsWrapper) {
          validOptionsWrapper.addEventListener('scroll', updateLeaderLinePosition);
        }
      });
    } else {
      let btnPasteMissingOption = document.querySelector('#btn-paste-content');

      leaderLines.lineToMissingOption = new LeaderLine(
        start, btnPasteMissingOption,
        {
          path: 'grid',
          color: '#ff2e86',
          startPlug: 'behind',
          endPlug: 'arrow3',
          startSocket: 'right',
          endSocket: 'left',
          positionByWindowResize: false
        }
      );

      if (validOptionsWrapper) {
        validOptionsWrapper.removeEventListener('scroll', updateLeaderLinePosition)
      }

      if (docDataWrapper) {
        docDataWrapper.addEventListener('scroll', updateLeaderLinePosition);
      }
      if (errorOptionsWrapper) {
        errorOptionsWrapper.addEventListener('scroll', updateLeaderLinePosition);
      }
    }
  }

  updateAttributes(index, shiftValue) {
    const listItems = [...document.querySelectorAll('.box.error .box__list .box__list__item')];

    listItems.forEach(item => {
      let setContentIndex = +item.getAttribute('set-content-index');

      if (setContentIndex >= index) {
        setContentIndex += shiftValue;
      }

      item.setAttribute('set-content-index', setContentIndex);
    });
  }

  revertAttributes(startIndex, lengthOfData) {
    const listItems = [...document.querySelectorAll('.box.error .box__list .box__list__item')];

    listItems.forEach(item => {
      let setContentIndex = +item.getAttribute('set-content-index');

      if (setContentIndex >= startIndex) {
        setContentIndex -= lengthOfData;
      }

      item.setAttribute('set-content-index', setContentIndex);
    });
  }

  scrollToEl(container, el, topIndent) {
    if (container.querySelector('.simplebar-content-wrapper')) {

      container.querySelector('.simplebar-content-wrapper')
        .scrollTo(
          {
            top: el.offsetTop - topIndent, behavior: 'auto'
          }
        );
    } else {
      container.scrollTo(
        {
          top: el.offsetTop - topIndent, behavior: 'auto'
        }
      );
    }
  }

  clearBoard() {
    const errorOptions = document.querySelectorAll('.box.error .box__list__item');
    const validOptions = document.querySelectorAll('.box.valid .box__list__item');
    const highlightedText = document.querySelectorAll('.doc__view .highlight.active');
    const btnAddContent = document.querySelector('#btn-paste-content');

    this.destroyLeaderLines();

    if (btnAddContent) btnAddContent.remove();

    [...validOptions, ...errorOptions, ...highlightedText].forEach(item => {
      item.classList.remove('active');
    });
  }

  updateOptionsTitles(fromError, initialLength) {
    const undoBtn = document.querySelector('.box.error .box__undo');
    const errorTitle = document.querySelector('.box.error .box__title');
    const validTitle = document.querySelector('.box.valid .box__title');
    const saveFile = document.getElementById('btn-save-file');

    let errListLength = Number(errorTitle.dataset.amount);
    let validListLength = Number(validTitle.dataset.amount);

    if (!fromError) {
      errListLength++;
      validListLength--;
    } else {
      errListLength--;
      validListLength++;
    }

    if (errListLength !== initialLength) {
      saveFile.classList.remove('disabled');
      undoBtn.classList.add('show');
    } else {
      saveFile.classList.add('disabled');
      undoBtn.classList.remove('show');
    }
    errorTitle.setAttribute('data-amount', errListLength.toString());
    validTitle.setAttribute('data-amount', validListLength.toString());

    errorTitle.innerHTML = `
      <span class="amount">${errListLength}</span>
      ${declension(errListLength, [
      'Присутствует',
      'Присутствуют',
      'Присутствуют',
    ])}`;

    validTitle.innerHTML = `
      <span class="amount">${validListLength}</span>
      ${declension(validListLength, [
      'Присутствует',
      'Присутствуют',
      'Присутствуют',
    ])}`;
  }

  setTooltips(allowTooltips) {
    if (allowTooltips) {
      const listOfHighlightElements = document.querySelectorAll('.doc__view .highlight');

      [...listOfHighlightElements].forEach(el => {
        let elName = el.getAttribute('name');
        elName = elName.replace(/#/g, '');

        let description = document.querySelector(`.box.valid .box__list__item[name="${elName}"]`);

        if (description) {
          description = description.getAttribute('description').replace(/-/g, ' ')
        } else {
          description = 'Сложный компонент. Непонятно, что с ним делать.'
        }

        tippy(el, {
          content: description,
          delay: 250,
          onShow() {
            return !!document.querySelector('.doc__view.highlighted');
          },
        });
      });
    }
  }

  destroyLeaderLines() {
    Object.values(leaderLines).map(value => {
      value.remove();
    });

    leaderLines = {};
  }
}