export default class Alert {
  constructor() {
  }

  alertShow(txt, type) {
    const body = document.querySelector('body');

    body.insertAdjacentHTML('afterbegin', `
    <div id="alert" class="alert alert-${type}">
      ${txt}
    </div>
    `);

    const alert = document.getElementById('alert');

    alert.classList.add('show');
    setTimeout(() => {
      alert.remove()
    },5000);
  }
}