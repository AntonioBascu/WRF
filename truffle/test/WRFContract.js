const WRFContract = artifacts.require("WRFContract");

contract("WRFContract", () => {
    
    before(async() => {
        this.wrf = await WRFContract.deployed()
    })

    it('El contrato se desplegó correctamente', async() =>{
        const address = await this.wrf.address
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);  
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
    })

    it('Datos subidos correctamente', async() =>{
        const result= await this.wrf.crearDatos(1,2,3.5)
        const temp= result.logs[0].args;
        const cont = await this.wrf.contador();

        assert.equal(cont, 1)
        assert.equal(temp.id, 0)
        assert.equal(temp.latitud, 1)
        assert.equal(temp.longitud, 2)
        assert.equal(temp.temperatura, 3.5)
    })
})