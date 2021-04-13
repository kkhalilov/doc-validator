export function parseComponentsList(data) {

  let listData;

  listData = data.map(item => {
    console.log(item)
    const dataItem = `
      <div 
        class="box__list__item" 
        ${setDocItemIndices(item)}
      >
        ${item.descriptionText}
      </div>
    `
    return dataItem
  })

  return listData.join('')
}

function setDocItemIndices(itemData) {
  if (itemData.indices) {
    let highlightIndices = [];

    itemData.indices.forEach(indices => {
      // const indexId = Math.floor(Math.random() * 10);
      highlightIndices.push(`${indices.start_index}/${indices.stop_index}`)
    })

    console.log(highlightIndices)
    return `highlight-indices="${highlightIndices}"`;
  } else {
      // const indexId = Math.floor(Math.random() * 100);

      return `set-content-index="${itemData.index}"`;
  }
}