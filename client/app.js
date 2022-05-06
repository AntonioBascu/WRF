App = {

    contracts: {},
    
    init: async () => {
        await App.loadEthereum()
        await App.loadAccount()
        await App.renderizarCuenta()
        await App.loadContracts()
        await App.renderizarDatos()
    },

    loadEthereum: async () => {
        if (window.ethereum) {
            console.log('Existe ethereum')
            App.web3Provider= window.ethereum
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        } else {
            console.log('No existe ethereum. Prueba instalando metamask')
        }
    },

    loadContracts: async () => {

        try{
        const res = await fetch("WRFContract.json")
        const wrfJson = await res.json()
        
        App.contracts.WRFContract = TruffleContract(wrfJson)

        App.contracts.WRFContract.setProvider(App.web3Provider)
        
        App.wrfContract = await App.contracts.WRFContract.deployed()
        } catch (error){
            console.error(error);
        }
    },

    loadAccount: async () => {
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
       App.account = accounts[0] 
    },

    renderizarCuenta: async() => {
        document.getElementById("account").innerText = App.account;
    },

    renderizarDatos: async () => {

        try{
        const cont= await App.wrfContract.contador()
        const contador = cont.toNumber()

        let html = "";

        for (let i = 0; i < contador; i++) {
            const t1 = await App.wrfContract.temperaturas(i)
            const tHora= await t1[1].toNumber()
            const tLatidud = await t1[2].toNumber()
            const tLongitud = await t1[3].toNumber()
            const tTemperatura = await t1[4].toNumber()

            
            
        }
        
        console.log()
        }catch(error){
            console.log(error);
        }
    }

}

