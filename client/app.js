class FDatos {
    constructor(lugar, temperaturas, fechaHoras) {
        this.lugar = lugar;
        this.temperaturas = temperaturas;
        this.fechaHoras = fechaHoras;
    }
};

App = {

    contracts: {},

    init: async () => {
        App.cargaEthereum()
        if (App.web3Provider != undefined) {
            App.loadAccount()
            await App.cargaWRFContract()
            //await App.cargarDatos()
            //await App.renderizarDatos()

            await App.cargarPaises()
            await App.cargaProvincias(`España`)
        }
        App.obtenerLugar(38.95, -1.88)
        App.obtenerLugar(40.41, -3.70)
        App.obtenerLugar(51.51, -0.09)
    },

    cargaEthereum: async () => {
        if (window.ethereum) {
            console.log('Existe ethereum')
            App.web3Provider = window.ethereum
        } else if(window.web3){
            App.web3Provider = window.web3.givenProvider;
        } else {
            console.log('No existe web3 ni ethereum. Prueba instalando metamask.')
            document.querySelector("#tablon").innerHTML = `<h4 id="aviso">ERROR: No existe web3 ni ethereum. Prueba instalando metamask.</h4>`
        }
    },

    cargaWRFContract: async () => {

        try {
            const res = await fetch("WRFContract.json")
            const wrfJson = await res.json()

            App.contracts.WRFContract = TruffleContract(wrfJson)

            App.contracts.WRFContract.setProvider(App.web3Provider)

            App.wrfContract = await App.contracts.WRFContract.deployed()
        } catch (error) {
            console.error(error);
        }
    },

    loadAccount: async () => {

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        App.account = accounts[0]


        document.getElementById("account").innerText = App.account;

        const admin = "0xdD7197014D4460A4DCE12De49d7b4A202098c300";

        if (App.account === admin.toLowerCase()) {
            dropArea.removeAttribute("hidden");
        }
    },

    cargarPaises: async () => {
        var cont = await App.wrfContract.contador()
        var contador = cont.toNumber()

        let html = "";
        let paises = [];
        App.lugares = [];

        for (let i = 0; i < contador; i++) {
            let tDatos = await App.wrfContract.Datos(i);  //carga fichero subido
            let tLugar = tDatos[1]  //obtiene lugar 

            let tPais = tLugar.split(',')[2]
            let element = '';

            if (!paises.includes(tPais)) element = `<option value="${tPais}">${tPais}</option>`; //cargamos desplegable de paises

            paises[i] = tPais;  //guarda el pais para no repetirlo 
            App.lugares[i] = tLugar; //guardamos lugar completo para luego obtener provincia

            html += element;
        }
        document.getElementById("dPais").innerHTML = html;
    },

    cargaProvincias: (pais) => {
        let html = '';
        let provincias = [];

        for (let i = 0; i < App.lugares.length; i++) {
            if (pais == App.lugares[i].split(',')[2]) {
                let provincia = App.lugares[i].split(',')[1];
                if (!provincias.includes(provincia)) {      // para que no repita provincias
                    let element = `<br><button class="button" id="lButton" onClick="App.filtraProvincia('${provincia}')">${provincia}</button>`;
                    html += element;
                }
                provincias.push(provincia);
            }
        }
        document.getElementById('lProvincias').innerHTML = html;
    },

    renderizarDatos: async () => {

        try {
            var cont = await App.wrfContract.contador()
            var contador = cont.toNumber()
            let html = "";

            for (let i = 0; i < contador; i++) {
                let tLugar;
                await App.getLugar(i).then(v => tLugar = v);

                let tempElement = `<div class="card bg-dark rounded-0 mb-2">
                    <div class="card-body">
                        <span>Lugar: ${tLugar}</span><br>
                    `;
                html += tempElement;

                for (let index = 0; index < 49; index++) {
                    let tTemp;
                    await App.getTemperatura(i, index).then(v => tTemp = v);

                    let tFechaH;
                    await App.getFechaHora(i, index).then(v => tFechaH = v);

                    tempElement = `
                            <span>${tTemp}º, ${tFechaH.toLocaleString()} </span><br>`;
                    html += tempElement;

                }

                tempElement = `</div> </div>`;
                html += tempElement;
            }

            document.querySelector("#tablon").innerHTML = html;

            console.log()
        } catch (error) {
            console.log(error);
        }
    },

    comprobarFicheros: () => {

        files.forEach(file => {

            let fileType = file.type; //getting selected file type
            let validExtensions = ["text/plain"]; //adding some valid image extensions in array
            if (validExtensions.includes(fileType)) { //if user selected file is an image file

                document.querySelector(".subirDatos").style.visibility = "visible";

            } else {
                alert("No esta en formato .txt!");
                dropArea.classList.remove("active");
                dragText.textContent = "Arrastra y suelta archivo de datos WRF";
            }

        });
    },

    subidaFichero: async (lugar, temperaturas, fechaHoras) => {
        try {
            await App.wrfContract.crearDatos(lugar, temperaturas, fechaHoras, { from: App.account, });
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    },

    procesarFicheros: () => {
        var lat;
        var lon;
        var temperaturas = [];
        var fechaHoras = [];
        var lugar = '';

        btnSubir.disabled = true;
        files.forEach(file => {
            let fileReader = new FileReader();

            fileReader.onload = () => {
                let fileText = fileReader.result;
                let lineas = fileText.split('\n');

                posC = lineas[0].indexOf(",", 23);

                lon = lineas[0].slice(23, posC);
                lat = lineas[0].slice(posC + 1, lineas[0].length);

                for (let i = 2; i < lineas.length && lineas[i] != ''; i++) {

                    posE = lineas[i].indexOf(" ");
                    temperaturas[i] = (new Number(lineas[i].slice(0, posE)) * 1000000).toFixed(0);

                    posB = lineas[i].indexOf("_");

                    año = lineas[i].slice(posB - 10, posB - 6);
                    mes = lineas[i].slice(posB - 5, posB - 3);
                    dia = lineas[i].slice(posB - 2, posB);
                    hora = lineas[i].slice(posB + 1, posB + 3);
                    minuto = lineas[i].slice(posB + 4, posB + 6);
                    segundo = lineas[i].slice(posB + 7, posB + 9);

                    let date = new Date(año, mes - 1, dia, hora, minuto, segundo);
                    fechaHoras[i] = Date.parse(date) / 1000;

                };

                App.obtenerLugar(lat, lon).then(lugar =>
                    App.subidaFichero(lugar, temperaturas, fechaHoras)
                );

            }
            fileReader.readAsText(file);

        })

    },

    obtenerLugar: async (lat, lng) => {
        var latlng = new google.maps.LatLng(lat, lng);
        var geocoder = new google.maps.Geocoder();
        var lug;

        await geocoder.geocode({ 'latLng': latlng }, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) {
                alert('No se ha podido leer la latitud ni longitud');
                lug = '';
            }

            if (status == google.maps.GeocoderStatus.OK) {
                lug = results[5].formatted_address.replace(/[0-9]+/g, '');
                lug = App.quitarEspacios(lug);
                console.log(lug)
            }

        });
        return lug;
    },

    quitarEspacios: (lug) => {
        let lugar = lug.split(',');
        for (let i = 0; i < lugar.length; i++) {
            lugar[i] = lugar[i].trim()
        }
        lug = lugar.join()
        return lug;
    },

    ponerEspacios: (lug) => {
        let lugar = lug.split(',');
        for (let i = 0; i < lugar.length; i++) {
            lugar[i] = ' ' + lugar[i]
        }
        lug = lugar.join()
        return lug;
    },

    filtraProvincia: async (provincia) => {
        //mostrar en pantalla meses disponibles y seleccionar dia
        var cont = await App.wrfContract.contador()
        var contador = cont.toNumber()
        App.meses = [];
        App.años = [];
        App.dias = [];
        App.idsP = [];
        for (let i = 0; i < contador; i++) {
            let lugar;
            await App.getLugar(i).then(v => lugar = v)
            if (provincia == lugar.split(',')[1]) {
                let fecha;
                await App.getFechaHora(i, 0).then(v => fecha = v)
                App.meses.push(fecha.getMonth());
                App.años.push(fecha.getFullYear()); //obtenemos meses y años para llenar desplegableAños y renderizarMeses, dias para llenar calendario e ids del fichero para buscar dia seleccionado
                App.dias.push(fecha.getDate());
                App.idsP.push(i);
            }
        }
        App.creaDesplegableAños(App.años);
        App.renderizaMeses(App.meses, App.años, new Date().getFullYear());
    },

    renderizaMeses: (meses, años, año) => {
        App.ocultaCalendario();
        let nombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        html = `<div id="col1" class="col-md-6"></div>
              <div id="col2" class="col-md-6"></div>`;
        col = 'col1'
        col1 = '';
        col2 = '';
        document.getElementById("tablon").innerHTML = html;

        for (let i = 0; i < nombres.length; i++) {
            let boton = ``;

            for (let index = 0; index < meses.length; index++) {
                if (meses[index] == i && años[index] == año) {
                    boton = `<br><div><button type="button" id="bMes${i}" class="btn button bMes" onclick="App.alternaCalendario(${i})">${nombres[i]}</button><button id="bBuscaDia${i}" onclick="App.verTemperaturasClick()" hidden>Ver temperaturas</button><div class="calendario" id="dCal${i}"></div></div>`;
                    break;
                } else { boton = `<br><button type="button" class="btn button bMes" disabled>${nombres[i]}</button><div></div>` };
            }

            if (col == "col1") { col1 += boton; col = "col2"; }
            else { col2 += boton; col = "col1" }
        }
        document.getElementById('col1').innerHTML = col1;
        document.getElementById('col2').innerHTML = col2;
    },

    creaDesplegableAños: (anos) => {
        document.getElementById('dAno').removeAttribute("hidden");
        const años = anos.filter((valor, indice) => {
            return anos.indexOf(valor) === indice;
        });
        htmlAños = ``;
        años.forEach(element => {
            htmlAños += `<option value="${element}">${element}</option>`;
        });

        document.getElementById('dAno').innerHTML = htmlAños;
    },

    ocultaCalendario: () => {

        if (App.mes != undefined) {
            $('#dCal' + App.mes).multiDatesPicker('destroy');
            document.getElementById('bBuscaDia' + App.mes).setAttribute("hidden", true);
        }
        App.mes = undefined;
    },

    alternaCalendario: (mes) => {
        if (App.mes == mes) App.ocultaCalendario();
        else {
            App.ocultaCalendario();
            App.muestraCalendario(mes);
        }
    },

    muestraCalendario: (mes) => {
        var año = document.getElementById('dAno').value;
        App.mes = mes;  //para saber que calendario de boton cerrar

        var diasDes = App.diasDesactivados(año, mes);

        $('#dCal' + mes).multiDatesPicker({
            addDisabledDates: diasDes,
            maxPicks: 1,
            dateFormat: "yy-m-d",
            defaultDate: año + "-" + (mes + 1) + "-1"
        })

        document.getElementById('bBuscaDia' + mes).removeAttribute("hidden");
    },

    diasDesactivados: (año, mes) => {
        var diasDes = [];
        App.diasCalen = [];   //arrays con dias disponibles en calendario
        App.idsCalen = [];   // e ids del fichero respectivo
        for (let i = 0; i < App.meses.length; i++) {
            if (App.meses[i] == mes && App.años[i] == año) {
                App.diasCalen.push(App.dias[i]);
                App.idsCalen.push(App.idsP[i]);
            }
        }

        for (let i = 1; i <= 31; i++) {
            if (!App.diasCalen.includes(i)) diasDes.push(new Date().setFullYear(año, mes, i));
        }

        return diasDes;
    },

    verTemperaturasClick: async () => {
        var fecha = $('#dCal' + App.mes).multiDatesPicker('value');

        if (fecha != "") {
            var dia = new Date(fecha).getDate();
            await App.muestraTemperaturas(App.idsCalen[App.diasCalen.indexOf(dia)]);
            //console.log(App.idsCalen[App.diasCalen.indexOf(dia)])

        } else alert("Selecciona un dia");
    },

    muestraTemperaturas: async (id) => {
        App.ocultaCalendario();
        let tLugar;
        await App.getLugar(id).then(v => tLugar = v);

        let tempElement = `<div class="card bg-dark rounded-0 mb-2">
                    <div class="card-body">
                        <span>Lugar: ${tLugar}</span><br>
                    `;
        html += tempElement;

        for (let index = 0; index < 49; index++) {
            let tTemp;
            await App.getTemperatura(id, index).then(v => tTemp = v);

            let tFechaH;
            await App.getFechaHora(id, index).then(v => tFechaH = v);

            tempElement = `
                            <span>${tTemp}º, ${tFechaH.toLocaleString()} </span><br>`;
            html += tempElement;

        }
        tempElement = `</div> </div>`;
        html += tempElement;


        document.querySelector("#tablon").innerHTML = html;
    },

    getLugar: async (i) => {
        let datos = await App.wrfContract.Datos(i);
        let lugar = datos[1];
        return lugar;
    },

    getTemperatura: async (i, index) => {
        let temp = await App.wrfContract.getTemperatura(i, index);
        temp = temp.toNumber() / 1000000;
        return temp;
    },

    getFechaHora: async (i, index) => {
        let fechaH = await App.wrfContract.getFechaHora(i, index);
        fechaH = new Date(fechaH * 1000)
        return fechaH;
    }

}

