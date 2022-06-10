App = {

    contracts: {},

    init: async () => {
        await App.loadEthereum()
        await App.loadContracts()
        await App.renderizarDatos()
        await App.loadAccount()
    },

    loadEthereum: async () => {
        if (window.ethereum) {
            console.log('Existe ethereum')
            App.web3Provider = window.ethereum
        } else {
            console.log('No existe ethereum. Prueba instalando metamask')
            document.querySelector("#listaTemperaturas").innerHTML = `<h4 id="aviso">ERROR: Ethereum no está instalado. Prueba instalando metamask</h4>`
        }
    },

    loadContracts: async () => {

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

        const admin = "0xfEB2a1F251A0cb6Cf82B0cC31FcD69C1E4a2387A";

        if (App.account === admin.toLowerCase()) {
            document.getElementById("holaAdmin").innerText = `HOLA ADMIN`;
            dropArea.removeAttribute("hidden");
        }
    },

    renderizarDatos: async () => {

        try {
            var cont = await App.wrfContract.contador()
            var contador = cont.toNumber()

            let html = "";

            for (let i = 0; i < contador; i++) {
                let t1 = await App.wrfContract.Datos(i);
                let tLugar = t1[1]

                let tempElement = `<div class="card bg-dark rounded-0 mb-2">
                    <div class="card-body">
                        <span>Lugar: ${tLugar}</span><br>
                    `;
                html += tempElement;

                for (let index = 0; index < 49; index++) {

                    let tTemp = await App.wrfContract.getTemperatura(i, index)
                    tTemp = tTemp.toNumber() / 1000000
                    let tFechaH = await App.wrfContract.getFechaHora(i, index)
                    tFechaH = tFechaH

                    tempElement = `
                            <span>${tTemp}, ${new Date(tFechaH * 1000).toLocaleString()} </span><br>`;
                    html += tempElement;

                }

                tempElement = `</div> </div>`;
                html += tempElement;
            }

            document.querySelector("#listaTemperaturas").innerHTML = html;

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
        var lugar=''

        btnSubir.disabled = true;
        files.forEach(file => {
            let fileReader = new FileReader();

            fileReader.onload = () => {
                let fileText = fileReader.result;
                let lineas = fileText.split('\n');

                posC = lineas[0].indexOf(",", 23);

                lon = lineas[0].slice(23, posC);
                lat = lineas[0].slice(posC + 1, lineas[0].length);

                for (let i = 2; i < lineas.length; i++) {

                    posE = lineas[i].indexOf(" ");
                    temperaturas[i] = new Number(lineas[i].slice(0, posE)) * 1000000;

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

    obtenerLugar: async (lat, lng) =>{
        var latlng = new google.maps.LatLng(lat, lng);
        var geocoder = new google.maps.Geocoder();
        var lug;

        await geocoder.geocode({ 'latLng': latlng }, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) {
                alert('No se ha podido leer la latitud ni longitud');
                lug='';
            }
            // This is checking to see if the Geoeode Status is OK before proceeding
            if (status == google.maps.GeocoderStatus.OK) {
                lug = results[5].formatted_address;
            }
            
        });
        return lug;
    }

};

