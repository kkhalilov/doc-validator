export default class Build {
  constructor() {}

  parseComponentsList(data) {
    let listData;

    listData = data.map(item => {
      return (`
        <div
          class="box__list__item" 
          ${this.setDocItemIndices(item)}
        >
          ${item.descriptionText}
        </div>
      `);
    });

    return listData.join('');
  }

  wrapValidTextComponents(validOptions, errorOptions) {
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
      each: function (node, data) {
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
      },
    });
  }

  setDocItemIndices(itemData) {
    const description = itemData.descriptionText.replace(/\s/g, '-');

    if (itemData.indices) {
      let highlightIndices = [];

      itemData.indices.forEach(indices => {
        highlightIndices.push(`${indices.start_index}/${indices.stop_index}`);
      });

      return `description=${description} name="${itemData.component_name}" highlight-indices="${highlightIndices}"`;
    } else {
      return `description=${description} name=${itemData.component_name} set-content-index="${itemData.index}"`;
    }
  }
}