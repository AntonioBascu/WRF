<?php

$server = 'localhost:3306';
$username = 'root';
$password = '';
$database = 'wrf_login_bd';

try {
  $conn = new PDO("mysql:host=$server;dbname=$database;", $username, $password);
  $conn -> setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die('Connection Failed: ' . $e->getMessage());
}

?>