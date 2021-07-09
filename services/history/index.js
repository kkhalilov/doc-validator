let history = [];

export default class History {
  constructor() {}

  updateHistory(hideOption, lengthOfData, startIndex, name) {
    history.push({
      hideOption,
      lengthOfData,
      startIndex,
      name
    });
  }

  popHistoryData() {
    history.pop();
  }

  getUserHistory() {
    return history;
  }
}