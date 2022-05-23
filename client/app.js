App = {

    contracts: {},

    init: async () => {
        await App.loadEthereum()
        await App.renderizarDatos()
        //await App.loadAccount()
    },

    loadEthereum: async () => {
        if (window.ethereum) {
            console.log('Existe ethereum')
            App.web3Provider = window.ethereum
            //await window.ethereum.request({ method: 'eth_requestAccounts' })
            await App.loadContracts()
        } else {
            console.log('No existe ethereum. Prueba instalando metamask')
            document.querySelector("#listaTemperaturas").innerHTML = `<h4 id="aviso">ERROR: No existe ethereum. Prueba instalando metamask</h4>`
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

        const admin = "0x6f8ad15bfd01e5a12b0878c54381e595ce6d126d";

        if (App.account === admin) {
            document.getElementById("holaAdmin").innerText = `HOLA ADMIN`;
        }
    },

    renderizarDatos: async () => {

        try {
            const cont = await App.wrfContract.contador()
            const contador = cont.toNumber()

            let html = "";

            for (let i = 0; i < contador; i++) {
                const t1 = await App.wrfContract.temperaturas(i)
                const tHora = await t1[1].toNumber()
                const tLatidud = await t1[2].toNumber()
                const tLongitud = await t1[3].toNumber()
                const tTemperatura = await t1[4].toNumber()

                let tempElement = `<div class="card bg-dark rounded-0 mb-2">
                <div class="card-body">
                    <span>Latitud: ${tLatidud}</span>
                    <span>Longitud: ${tLongitud}</span>
                    <p>${tTemperatura}º</p>
                    <p class="text-muted">${new Date(tHora * 1000).toLocaleString()}</p>
                    
                </div>
            </div>`;
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

    procesarFicheros: () => {

        btnSubir.disabled=true;
        files.forEach(file => {
            let fileReader = new FileReader(); //creating new FileReader object
            let latLon = '';
            let temperaturas = [];
            let fechaHora = [];

            fileReader.onload = () => {
                let fileText = fileReader.result;
                let lineas = fileText.split('\n');
                latLon = lineas[0].slice(23, 34)

                for (let i = 1; i < lineas.length; i++) {


                    temperaturas[i] = lineas[i].slice(0, 7)

                    console.log(temperaturas[i])
                };

                //textArea.innerHTML = fileText;
            }
            fileReader.readAsText(file);
        })
    },

};

