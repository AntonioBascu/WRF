<?php

  require 'basedatos.php';

  $message = '';

  if (!empty($_POST['email']) && !empty($_POST['password'])) {
    $sql = "INSERT INTO usuarios (email, password) VALUES (:email, :password)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $_POST['email']);
    $password = sha1($_POST['password']);
    $confpassword = sha1($_POST['confirmpassword']);

    if ($password == $confpassword) {
      $stmt->bindParam(':password', $password);
      if ($stmt->execute()) {
        $message = 'Usuario creado con éxito';
        header("Location: /web/web.html");
      }else $message = 'Ha habido un problema creando el usuario';
    } else {
      $message = 'Las contraseñas no coinciden';
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
      <?php if(!empty($message)): ?>
        <p> <?= $message ?></p>
      <?php endif; ?>
      <h1>Crea una cuenta WRF</h1>
      <form action="creaCuenta.php" method="POST">
        
        <label for="email">Email</label>
        <input type="text" name="email" placeholder="Introduce tu email">
        
        <label for="password">Contraseña</label>
        <input type="password" name="password" placeholder="Introduce una contraseña">

        <label for="confirmpassword">Confirmar contraseña</label>
        <input type="password" name="confirmpassword" placeholder="Confirma la contraseña">

        <input type="submit" value="Crear cuenta">
      </form>
    </div>
  </body>
</html>