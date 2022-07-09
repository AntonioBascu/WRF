// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract WRFContract {

    uint256 public contador=0;

    struct fDatos {
        uint256 id;
        string latLon;
        uint256[] temperaturas;
        uint256[] fechaHoras;

    }

    event SubidaDatos(
        uint256 id,
        string latLon,
        uint256[] temperaturas,
        uint256[] fechaHoras
    );

    constructor() {
        
    }

    mapping (uint256 => fDatos) public Datos;

    function crearDatos(string memory _latLon, uint256[] memory _temperaturas, uint256[] memory _fechaHoras) public{

        Datos[contador]= fDatos(contador, _latLon, _temperaturas, _fechaHoras);
        emit SubidaDatos(contador, _latLon, _temperaturas, _fechaHoras);
        contador++;
        /*

        temperaturas[contador]= Datos(latLon, _latitud, _longitud, _temperatura);
        emit DatosSubidos(contador+1, block.timestamp, _latitud, _longitud, _temperatura);
        contador++;*/
    }

    function eliminarDatos() public{
        for (uint256 i = 0; i < contador; i++) {
            delete Datos[i];
        }
    }
    
    function getTemperatura(uint256 id, uint i) public view returns(uint256){     
        return Datos[id].temperaturas[i];
    }

    function getFechaHora(uint256 id, uint i) public view returns(uint256){     
        return Datos[id].fechaHoras[i];
    }

}