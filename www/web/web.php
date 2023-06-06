<?php
session_start();

if (!isset($_SESSION['user_id'])) {
  header('Location: /index.php');
}

require '../basedatos.php';

$records = $conn->prepare('SELECT id, email, pais, provincia FROM usuarios WHERE id = :id');
$records->bindParam(':id', $_SESSION['user_id']);
$records->execute();
$result = $records->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/web/main.css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <script src="\node_modules\bootstrap\dist\js\bootstrap.bundle.min.js"></script>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
  <script src="\node_modules\jquery-ui-multidatespicker\jquery-ui.multidatespicker.js"></script>
  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
  <link rel="stylesheet" href="\node_modules\jquery-ui-multidatespicker\jquery-ui.multidatespicker.css">
  <title>Predicciones WRF</title>
</head>

<body>
  <div class="container py-5">
    <div class="row">
      <div class="col-md-3">
        <div class="card card-body bg-dark mb-4">
          <h1 id="siglasWRF">
            DWRF
          </h1>
          <h6 class="text-muted">Decentralized WRF App</h6>
          <span>Bienvenido <?php echo $result['email'] ?></span>
          <span><?php echo $result['provincia'] ?></span>
          <span><?php echo $result['pais'] ?></span>
          <div class="d-flex align-items-center">
            <span class="ms-2">Wallet:</span>
          </div>
          <span id="account">Desconectado</span>
        </div>
        <button type="button" id="bLogOut" class="btn button">Cerrar sesión</button>
        <div class="card card-body bg-dark mb-4 container">
          <h5>Pais</h5>
          <select class="form-select" id="dPais" name="sellist1"></select> <br>
          <h5>Provincia</h5>
          <div id="lProvincias"></div>
        </div>
      </div>
      <div class="col-md-7 row">
        <div class="card bg-dark mb-4">
          <select class="form-select" id="dAno" hidden></select>
          <div class="row" id="tablon">
            <h2 id="portada">Bienvenido/a a la web descentralizada <br>de consulta de datos del modelo <br><br>Weather Research and Forecasting (WRF)</h2>
            <img src="../img/logo.jpg" class="avatar" alt="logo WRF">
            <span class="fa fa-arrow-left fa-2x" id="flecha">&nbsp;&nbsp;&nbsp;Selecciona tu pais y provincia</span>
          </div><br>
        </div>
      </div>
      <div class="col-md-2">
        <div>
          <button id="connect" class="button" style="vertical-align:middle" onclick="App.loadAccount()"><span id="txtConectar">Conectar
              con Metamask</span></button>
        </div>
        <br>
        <div class="drag-area" hidden>
          <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
          <header>Arrastra y suelta archivo de datos WRF </header>
          <span>O</span>
          <button>Subir archivo .txt</button>
          <input type="file" hidden>
        </div><br>
        <div class="subirDatos">
          <button id="subirDatos" type="button" class="btn btn-outline-primary btn-block">SUBIR DATOS</button>
        </div>
      </div>
    </div>
  </div>


  <!--<script src="/node_modules/web3/dist/web3.min.js"></script>-->
  <script src="/node_modules/@truffle/contract/dist/truffle-contract.min.js"></script>

  <script src="/web/app.js"></script>
  <script src="/web/ui.js"></script>
  <script src="https://maps.googleapis.com/maps/api/js?key=&callback=App.inicializarAPIGMapas" defer></script>

</body>

</html>