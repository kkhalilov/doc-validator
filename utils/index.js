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
  })

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
  })
}

function setDocItemIndices(itemData) {
  if (itemData.indices) {
    let highlightIndices = [];

    itemData.indices.forEach(indices => {
      // const indexId = Math.floor(Math.random() * 10);
      highlightIndices.push(`${indices.start_index}/${indices.stop_index}`)
    })

    return `highlight-indices="${highlightIndices}"`;
  } else {
      // const indexId = Math.floor(Math.random() * 100);
      return `set-content-index="${itemData.index}"`;
  }
}