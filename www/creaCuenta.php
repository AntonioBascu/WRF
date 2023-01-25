<?php
session_start();

require 'basedatos.php';

$message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (!empty($_POST['email']) && !empty($_POST['password'])) {
    $sql = "INSERT INTO usuarios (email, password, pais, provincia) VALUES (:email, :password, :pais, :provincia)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $_POST['email']);
    $password = sha1($_POST['password']);
    $confpassword = sha1($_POST['confirmpassword']);

    if ($password == $confpassword) {
      $stmt->bindParam(':password', $password);
      $stmt->bindParam(':pais', $_POST['pais']);
      $stmt->bindParam(':provincia', $_POST['provincia']);

      if ($stmt->execute()) {
        //echo '<script> alert("¡Usuario creado con éxito!"); </script>';
        $records = $conn->prepare('SELECT id,email FROM usuarios WHERE email = :email');
        $records->bindParam(':email', $_POST['email']);

        $records->execute();
        $result = $records->fetch(PDO::FETCH_ASSOC);

        if ($result && isset($result['id'])) {
          $_SESSION['user_id'] = $result['id'];
          //echo '<script>console.log("ID del usuario: '.$_SESSION['user_id'].'");</script>';
          header("Location: /web/web.php");
        } else {
          $message = 'No se pudo obtener el ID del usuario creado';
        }
      } else $message = 'Ha habido un problema creando el usuario';
    } else {
      $message = 'Las contraseñas no coinciden';
    }
  } else {
    $message = 'Los campos email y contraseñas son obligatorios.';
  }
}
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Crear cuenta WRF</title>
  <link rel="stylesheet" href="/master.css">
</head>

<body>

  <div class="login-box">
    <img src="img/logo.jpg" class="avatar" alt="Avatar Image">
    <h1>Crea una cuenta WRF</h1>
    <?php if (!empty($message)) : ?>
      <p> <?= $message ?></p>
    <?php endif; ?>
    <form action="creaCuenta.php" method="POST">

      <label for="email">Email</label>
      <input type="text" name="email" placeholder="Introduce tu email">

      <label for="password">Contraseña</label>
      <input type="password" name="password" placeholder="Introduce una contraseña">

      <label for="confirmpassword">Confirmar contraseña</label>
      <input type="password" name="confirmpassword" placeholder="Confirma la contraseña">

      <label for="pais">Pais</label>
      <input type="text" name="pais" placeholder="Introduce tu pais">

      <label for="provincia">Provincia</label>
      <input type="text" name="provincia" placeholder="Introduce tu provincia">

      <input type="submit" value="Crear cuenta">
      <a href="/index.php">Inicia sesión</a>
    </form>
  </div>
</body>

</html>