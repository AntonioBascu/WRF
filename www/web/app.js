
App = {

    contracts: {},

    init: async () => {

        App.cargaEthereum()
        if (App.web3Provider != undefined) {
            await App.cargaWRFContract()
            //await App.loadAccount()

            await App.cargarPaises()
            await App.cargaProvincias('España')
        }

    },

    cargaEthereum: async () => {
        if (window.ethereum) {
            console.log('Existe ethereum.')
            App.web3Provider = window.ethereum
        } else if (window.web3) {
            App.web3Provider = window.web3.givenProvider;
        } else {
            console.log('No existe web3 ni ethereum. Prueba instalando metamask.')
            document.querySelector("#tablon").innerHTML = `<h4 id="aviso">ERROR: No existe web3 ni ethereum. Prueba instalando metamask.</h4>`
        }
    },

    cargaWRFContract: async () => {

        try {
            const res = await fetch("/SmartContracts/WRFContract.json")
            const wrfJson = await res.json()

            App.contracts.WRFContract = TruffleContract(wrfJson)

            App.contracts.WRFContract.setProvider(App.web3Provider)

            App.wrfContract = await App.contracts.WRFContract.deployed()
        } catch (error) {
            console.error(error);
        }
    },

    loadAccount: async () => {

        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        App.account = accounts[0]

        document.getElementById("account").innerText = App.account;

        const admin = "0xdD7197014D4460A4DCE12De49d7b4A202098c300";

        if (App.account === admin.toLowerCase()) {
            dropArea.removeAttribute("hidden");
        }

        document.getElementById("txtConectar").innerText = "Conectado";
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
                    let element = `<button class="button" id="lButton" onClick="App.filtraProvincia('${provincia}')">${provincia}</button><br>`;
                    html += element;
                }
                provincias.push(provincia);
            }
        }
        document.getElementById('lProvincias').innerHTML = html;
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
            alert("¡Fichero subido con éxito!");
        } catch (error) {
            console.error(error);
            if(App.account==undefined) alert("¡No has conectado tu billetera con la web! Pulsa el botón azul a la derecha para poder realizar la transacción.");
            else alert("Ha habido un problema con la transacción.")
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

    inicializarAPIGMapas: async () => {
        var geocoder = new google.maps.Geocoder();
    },

    obtenerLugar: async (lat, lng) => {
        var latlng = new google.maps.LatLng(lat, lng);
        var lug;
        var geocoder = new google.maps.Geocoder();

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

        var cont = await App.wrfContract.contador()
        var contador = cont.toNumber()
        App.meses = [];
        App.años = [];
        App.dias = [];
        App.idsP = [];
        for (let i = 0; i < contador; i++) {   //se comprueban todos los contratos
            var lugar;
            await App.getLugar(i).then(v => lugar = v)
            if (provincia == lugar.split(',')[1]) {   // si la provincia seleccionada es igual a la del contrato actual del bucle
                let fecha;
                await App.getFechaHora(i, 0).then(v => fecha = v)
                App.meses.push(fecha.getMonth());
                App.años.push(fecha.getFullYear()); //obtenemos meses y años para llenar desplegableAños y renderizarMeses, dias para llenar calendario e id del fichero para despues buscar dia seleccionado
                App.dias.push(fecha.getDate());
                App.idsP.push(i);
            }
        }
        maximo = Math.max(...App.años);
        App.creaDesplegableAños(App.años, maximo);
        App.renderizaMeses(provincia, App.meses, App.años, maximo);
    },

    renderizaMeses: (provincia, meses, años, año) => {
        App.ocultaCalendario();
        let nombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        let html = `<h5 id="tituloLugar">${provincia}<i class="fas fa-map-marker-alt" id="iconoLugar"></i></h5>
              <div id="col1" class="col-md-6"></div>
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

    creaDesplegableAños: (anos, maximo) => {
        document.getElementById('dAno').removeAttribute("hidden");
        const años = anos.filter((valor, indice) => {
            return anos.indexOf(valor) === indice;
        });
        htmlAños = ``;
        años.forEach(element => {
            if (element == maximo) htmlAños += `<option value="${element}" selected>${element}</option>`;
            else htmlAños += `<option value="${element}">${element}</option>`
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
        App.idsCalen = [];   // ids del fichero respectivo
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

        let html = App.encabezadoTemperaturas(tLugar);

        barraProgreso = `<div class="progress"></div>`;
        document.querySelector("#tablon").innerHTML = barraProgreso;

        for (let index = 0; index < 49; index++) {
            let tTemp;
            await App.getTemperatura(id, index).then(v => tTemp = v);
            let icono = App.iconoTemperaturas(tTemp);

            let tFechaH;
            await App.getFechaHora(id, index).then(v => tFechaH = v);

            tempElement = `<tr>
                            <td>${tTemp}º</td>
                            <td>${App.obtenerHorasinMinu(tFechaH.toLocaleString())}</td>
                            <td>
                            ${icono}
                            </td>
                        </tr>`;
            html += tempElement;

            document.querySelector(".progress").innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${index * 2}%" aria-valuenow="${index * 2}" aria-valuemin="0" aria-valuemax="100">Cargando <br> ${index * 2}%</div>`;

        }

        tempElement = `</tbody>
                    </table>
                </div>`;
        html += tempElement;


        document.querySelector("#tablon").innerHTML = html;

        await App.getFechaHora(id, 0).then(v => tFechaH = v);
        tFechaH = App.fechaTemperaturas(tFechaH.toLocaleString());
        document.getElementById("tituloFecha").innerHTML = tFechaH;
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
        fechaH = new Date(fechaH * 1000);
        return fechaH;
    },

    obtenerHorasinMinu: (str) => {
        let sinDia = str.substr(str.indexOf(',') + 1)
        return sinDia.substring(0, sinDia.lastIndexOf(':'));
    },

    encabezadoTemperaturas: (lugar) => {
        let tempElement = `
                        <h5 id="tituloLugar">${lugar}<i class="fas fa-map-marker-alt" id="iconoLugar"></i></h5>
                        <h5 id="tituloFecha"></h5>
                        <div class="table-responsive">
                            <table class="table table-dark table-striped">
                            <thead>
                                <tr>  
                                    <th>Temperatura</th>
                                    <th>Hora</th>
                                    <th>Clima</th>
                                </tr>
                            </thead>
                            <tbody>`;

        return tempElement;
    },

    iconoTemperaturas: (tTemp) => {
        let icono;
        if (tTemp < 0) icono = `<i class='far fa-snowflake'></i>`;
        else if (0 < tTemp && tTemp < 10) icono = `<i class='fas fa-wind'></i>`;
        else if (10 < tTemp && tTemp < 15) icono = `<i class='fas fa-smog'></i>`;
        else if (15 < tTemp && tTemp < 20) icono = `<i class='fas fa-cloud-sun'></i>`;
        else icono = `<i class='fas fa-sun'></i>`;
        return icono;
    },

    fechaTemperaturas: (fechaH) => {
        return fechaH.substring(0, fechaH.indexOf(","))+`<i id="iconoCalendario" class="far fa-calendar-alt"></i>`;
    },

    logOut: ()=>{
        location.replace('../logout.php');
    }
}

