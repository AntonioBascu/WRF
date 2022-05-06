// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract WRFContract {

    uint256 public contador=0;

    struct Datos {
        uint256 id;
        uint256 fechaHora;
        int latitud;
        int longitud;
        int temperatura;
    }

    event DatosSubidos(
        uint256 id,
        uint256 fechaHora,
        int latitud,
        int longitud,
        int temperatura
    );

    constructor() {
        crearDatos(7, 8, 9);
    }

    mapping (uint256 => Datos) public temperaturas;

    function crearDatos(int _latitud, int _longitud, int _temperatura) public{
        temperaturas[contador]= Datos(contador, block.timestamp, _latitud, _longitud, _temperatura);
        emit DatosSubidos(contador+1, block.timestamp, _latitud, _longitud, _temperatura);
        contador++;
    }
    
}