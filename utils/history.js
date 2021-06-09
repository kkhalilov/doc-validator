let history = [];

export function revertLastChanges(e, ) {
  let evtobj = window.event ? event : e

  if (evtobj.keyCode === 90 && evtobj.ctrlKey) alert("Ctrl+z");
  return '1'
}

export function updateHistory(hideOption, lengthOfData, startIndex, name) {
  history.push({
    hideOption,
    lengthOfData,
    startIndex,
    name
  });
  console.log(history)
}

export function popHistoryData() {
  history.pop();
}

export function getUserHistory() {
  return history;
}