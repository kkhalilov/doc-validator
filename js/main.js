
const app = document.getElementById('app');
const uploadDocBtn = document.getElementById('check-doc');


uploadDocBtn.addEventListener('click', uploadDoc)




function uploadDoc() {
  app.innerHTML = ''
  app.insertAdjacentHTML('afterbegin', `
    <div class="mb-32"><div class="loader"></div></div>
    <div class="subtitle">Подождите документ обрабатывается</div>
  `);

  fetch('./data.json')
    .then(response => response.json())
    .then(data => {
      const docResp = JSON.stringify(data)
      localStorage.setItem('data', docResp)
    })
    .then(onInitResults)


}

function onInitResults() {
  app.innerHTML = '';
  console.log(app)
  app.classList.add('step__3');

  const data = localStorage.getItem('data');
  const docData = JSON.parse(data)



  app.insertAdjacentHTML('afterbegin', `
    <div class="title">Результат проверки документа</div>
      <div class="subtitle file--name mb-42">“Мой новый договор-new-lastversion.txt”</div>
      <div class="result-container">
        <div class="box">
          <div class="box__title error">
            <span class="amount">6</span> валидных разделов
          </div>
          <div class="box__list">
            <div class="box__list__item">Наименование документа</div>
          </div>
        </div>
        <div class="box">
          <div class="box__title valid">
            <span class="amount">6</span> валидных разделов
          </div>
          <div class="box__list">
            <div class="box__list__item">Наименование документа</div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <button type="button" class="btn btn--primary">Показать структуру</button>
      </div>
  `)
}