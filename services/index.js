import History from './history/index.js';
import Board from './board/index.js';
import Build from './build/index.js';
import Modal from './modal/index.js';

const services = {
  build: new Build(),
  history: new History(),
  board: new Board(),
  modal: new Modal(),
};

export default services;