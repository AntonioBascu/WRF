document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const dropArea = document.querySelector(".drag-area"),
  dragText = dropArea.querySelector("header"),
  button = dropArea.querySelector("button"),
  input = dropArea.querySelector("input"),
  btnSubir = document.getElementById("subirDatos");
var files = [];

const dPais = document.querySelector('#dPais');
const dAno = document.querySelector('#dAno');
const bLogOut = document.querySelector('#bLogOut');

button.onclick = () => {
  input.click();
}

input.addEventListener("change", function () {
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = this.files[0];
  dropArea.classList.add("active");
  App.comprobarFicheros(); //calling function
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault(); //preventing from default behaviour
  dropArea.classList.add("active");
  dragText.textContent = "Suelta para subir archivo";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  dragText.textContent = "Arrastra y suelta archivo de datos WRF";
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault(); //preventing from default behaviour
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  for (let i = 0; i < event.dataTransfer.files.length; i++) {
    files[i] = event.dataTransfer.files[i];
  }

  App.comprobarFicheros(); //calling function
});

btnSubir.addEventListener("click", App.procesarFicheros);

dPais.addEventListener('change', (event) => {
  App.cargaProvincias(event.target.value);
});

dAno.addEventListener('change', (event) => {
  App.renderizaMeses(App.meses, App.años, event.target.value);
});

bLogOut.addEventListener('click', App.logOut);

