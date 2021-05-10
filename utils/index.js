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
  const listItems = [...document.querySelectorAll('.box__list .box__list__item')];

  listItems.forEach(item => {
    const highlightIndices = item.getAttribute('highlight-indices');

    if (highlightIndices) {
      let shiftedHighlightAttr = highlightIndices.split(',').map(indices => {
        let startIndex = +indices.split('/')[0];
        let stopIndex = +indices.split('/')[1];

        if (startIndex >= index) {
          startIndex += shiftValue;
          stopIndex += shiftValue;
        }

        return `${startIndex}/${stopIndex}`;
      }).join(',');

      item.setAttribute('highlight-indices', shiftedHighlightAttr);
    } else {
      let setContentIndex = +item.getAttribute('set-content-index');

      if (setContentIndex >= index) {
        setContentIndex += shiftValue;
      }

      item.setAttribute('set-content-index', setContentIndex);
    }
  });
}

export function addValidPlugLines(start, componentName) {
  const docElements = [...document.querySelectorAll(`#doc-data [name="${componentName}"]`)];

  docElements.forEach((docElement, idx) => {
    let line = new LeaderLine(
      start, docElement,
      {
        path: 'grid',
        color: '#00CB5D',
        startPlug: 'behind',
        endPlug: 'disc',
        startSocket: 'left',
        endSocket: 'right',
        positionByWindowResize: false
      }
    );

    //let doc = document.querySelector('.doc__view')
    // doc.addEventListener('scroll', AnimEvent.add(function() {
    //   line.position();
    // }), false);
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
    element: 'mark',
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
      })
      //для тултипов
      // tippy(node, {
      //   content: data.description.replace(/-/g, ' '),
      //   delay: 400,
      // });
    },
  });

}

export function scrollToEl(container, el, topIndent) {
  container.querySelector('.simplebar-content-wrapper')
    .scrollTo(
      {
        top: el.offsetTop - topIndent, behavior: "smooth"
      }
    );
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