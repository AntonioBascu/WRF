// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract WRFContract {

    uint256 public contador=0;

    struct Datos {
        string latLon;
        uint256[] temperatura;
        uint256[] fechaHora;

    }

    event DatosSubidos(
        uint256 id,
        uint256 fechaHora,
        int latitud,
        int longitud,
        int temperatura
    );

    constructor() {
        
    }

    mapping (uint256 => Datos) public temperaturas;

    function crearDatos() public{

        /*

        temperaturas[contador]= Datos(latLon, _latitud, _longitud, _temperatura);
        emit DatosSubidos(contador+1, block.timestamp, _latitud, _longitud, _temperatura);
        contador++;*/
    }
    
}