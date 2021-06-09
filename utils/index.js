let leaderLines = {};

export function addLeaderLineToEl(start, name, isError) {
  let docDataWrapper = document.querySelector('.doc__view .simplebar-content-wrapper')
    ? document.querySelector('.doc__view .simplebar-content-wrapper')
    : document.querySelector('.doc__view');
  let errorOptionsWrapper = document.querySelector('.box.error .simplebar-content-wrapper')
    ? document.querySelector('.box.error .simplebar-content-wrapper')
    : document.querySelector('.box.error .box__list');
  let validOptionsWrapper = document.querySelector('.box.valid .simplebar-content-wrapper')
    ? document.querySelector('.box.valid .simplebar-content-wrapper')
    : document.querySelector('.box.valid .box__list');

  destroyLeaderLines();

  let updateLeaderLinePosition = () => {
    Object.values(leaderLines).map(value => {
      value.position();
    })
  };

  if (!isError) {
    const validOptions = [...document.querySelectorAll(`#doc-data .highlight[name="${name}"]`)];
    validOptions.forEach((docElement, idx) => {

      docElement.style.backgroundColor = '#5cde98';

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
        setTimeout(() => {
          docDataWrapper.addEventListener('scroll', updateLeaderLinePosition);

        }, 250);
      }
      if (validOptionsWrapper) {
        setTimeout(() => {
          validOptionsWrapper.addEventListener('scroll', updateLeaderLinePosition);
        }, 250);
      }
    });
  } else {
    let btnPasteMissingOption = document.querySelector('#btn-paste-content');

    leaderLines.lineToMissingOption = new LeaderLine(
      start, btnPasteMissingOption,
      {
        path: 'grid',
        color: '#FF2E86',
        startPlug: 'behind',
        endPlug: 'arrow3',
        startSocket: 'right',
        endSocket: 'left',
        positionByWindowResize: false
      }
    );

    // setTimeout(() => {
    //   docDataWrapper.onscroll = () => {
    //     leaderLines.lineToMissingOption.position();
    //   };
    //
    //   errorOptionsWrapper.onscroll = () => {
    //     leaderLines.lineToMissingOption.position();
    //   };
    //
    // }, 250);

    if (validOptionsWrapper) {
      validOptionsWrapper.removeEventListener('scroll', updateLeaderLinePosition)
    }

    if (docDataWrapper) {
      setTimeout(() => {
        docDataWrapper.addEventListener('scroll', updateLeaderLinePosition);
      }, 250);
    }
    if (errorOptionsWrapper) {
      setTimeout(() => {
        errorOptionsWrapper.addEventListener('scroll', updateLeaderLinePosition);
      }, 250);
    }
  }
}

export function destroyLeaderLines() {
  Object.values(leaderLines).map(value => {
    value.remove();
  });

  leaderLines = {};
}

export function getErrorOptionsIndexes() {
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');

  return [...errorOptions].map(option => {
    return +option.getAttribute('set-content-index');
  })
}

export function setErrorOptionsIndexes(indexes) {
  const errorOptions = document.querySelectorAll('.box.error .box__list__item');

  [...errorOptions].forEach((option, idx) => {
    option.setAttribute('set-content-index', indexes[idx]);
  });
}

export function parseComponentsList(data) {
  let listData;

  listData = data.map(item => {
    return (`
      <div
        class="box__list__item" 
        ${setDocItemIndices(item)}
      >
        ${item.descriptionText}
      </div>
    `);
  });

  return listData.join('');
}

export function resetAttributes(index, shiftValue) {
  const listItems = [...document.querySelectorAll('.box.error .box__list .box__list__item')];

  listItems.forEach(item => {
    const highlightIndices = item.getAttribute('highlight-indices');

    // if (highlightIndices) {
    //   let shiftedHighlightAttr = highlightIndices.split(',').map(indices => {
    //     let startIndex = +indices.split('/')[0];
    //     let stopIndex = +indices.split('/')[1];
    //
    //     if (startIndex >= index) {
    //       startIndex += shiftValue;
    //       stopIndex += shiftValue;
    //     }
    //
    //     return `${startIndex}/${stopIndex}`;
    //   }).join(',');
    //
    //   item.setAttribute('highlight-indices', shiftedHighlightAttr);
    // } else {
      let setContentIndex = +item.getAttribute('set-content-index');

      if (setContentIndex >= index) {
        setContentIndex += shiftValue;
      }

      item.setAttribute('set-content-index', setContentIndex);
    // }
  });
}

export function revertAttributes(startIndex, lengthOfData) {
  const listItems = [...document.querySelectorAll('.box.error .box__list .box__list__item')];

  listItems.forEach(item => {
    let setContentIndex = +item.getAttribute('set-content-index');

    if (setContentIndex >= startIndex) {
      setContentIndex -= lengthOfData;
    }

    item.setAttribute('set-content-index', setContentIndex);
  });
}

export function wrapValidTextComponents(validOptions, errorOptions, initialText) {
  let validData = [];
  let errorData = [];

  [...validOptions].forEach(validOption => {
    const componentName = validOption.getAttribute('name');
    const componentDescription = validOption.getAttribute('description');
    const highlightIndices = validOption.getAttribute('highlight-indices').split(',');

    highlightIndices.forEach((indices, idx) => {
      const startIndex = +indices.split('/')[0];
      const stopIndex = +indices.split('/')[1];

      validData.push({
        start: startIndex,
        length: stopIndex - startIndex,
        name: componentName,
        description: componentDescription,
      })
    });
  });

  [...errorOptions].forEach(errorItem => {
    const componentName = errorItem.getAttribute('name');
    const startIndex = +errorItem.getAttribute('set-content-index');

    errorData.push({
      start: startIndex,
      name: componentName,
    });
  });

  let doc = new Mark(document.getElementById('doc-data'));

  doc.markRanges(validData, {
    element: 'span',
    className: 'highlight',
    each: function(node, data) {
      node.setAttribute('name', data.name);
      errorData.forEach(errorItem => {
        if (data.start < errorItem.start) {
          const errorItemCurrent = document.querySelector(`.box.error .box__list__item[name="${errorItem.name}"]`);
          const errorItemIndex = +errorItemCurrent.getAttribute('set-content-index');

          errorItemCurrent.setAttribute(
            'set-content-index',
            errorItemIndex + (node.outerHTML.length - node.innerHTML.length)
          );
        }
      });
      //для тултипов
      tippy(node, {
        content: data.description.replace(/-/g, ' '),
        delay: 250,
        onShow() {
          return !!document.querySelector('.doc__view.highlighted');
        },
      });
    },
  });

}

export function scrollToEl(container, el, topIndent) {
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

export function declension(num, titles) {
  const number = parseInt(num);
  const  cases = [2, 0, 1, 1, 1, 2]
  const declination = titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
    ];

  return `${declination}`;
}

function setDocItemIndices(itemData) {
  if (itemData.indices) {
    let highlightIndices = [];

    itemData.indices.forEach(indices => {
      highlightIndices.push(`${indices.start_index}/${indices.stop_index}`)
    });

    let description = itemData.descriptionText.replace(/\s/g, '-');

    return `description=${description} name="${itemData.component_name}" highlight-indices="${highlightIndices}"`;
  } else {
      return `name=${itemData.component_name} set-content-index="${itemData.index}"`;
  }
}
