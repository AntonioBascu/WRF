<?php
session_start();

if (isset($_SESSION['user_id'])) {
  //echo '<script>console.log("ID del usuario: '.$_SESSION['user_id'].'");</script>';
  header('Location: /web/web.php');
}
require 'basedatos.php';

$message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (!empty($_POST['email']) && !empty($_POST['password'])) {
    $records = $conn->prepare('SELECT id, email, password FROM usuarios WHERE email = :email');
    $records->bindParam(':email', $_POST['email']);
    $records->execute();
    $result = $records->fetch(PDO::FETCH_ASSOC);
    $password = sha1($_POST['password']);
    $message = '';

    if ($result && $records->rowCount() > 0 && $password == $result['password']) {
      $_SESSION['user_id'] = $result['id'];
      header("Location: /web/web.php");
    } else {
      $message = 'Datos incorrectos, vuelve a intentarlo.';
    }
  } else {
    $message = 'Debe ingresar su email y contraseña.';
  }
}
?>

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Inicio sesión WRF</title>
  <link rel="stylesheet" href="/master.css">
</head>

<body>

  <div class="login-box flex-container">
    <img src="img/logo.jpg" class="avatar" alt="Avatar Image">

    <h1>Inicio de sesión</h1>
    <?php if (!empty($message)) : ?>
      <p> <?= $message ?></p>
    <?php endif; ?>
    <form action="index.php" method="POST">
      <!-- USERNAME INPUT -->
      <label for="email">Email</label>
      <input type="text" name="email" placeholder="Introduce usuario">
      <!-- PASSWORD INPUT -->
      <label for="password">Contraseña</label>
      <input type="password" name="password" placeholder="Introduce contraseña">
      <input type="submit" value="Iniciar sesión">
      <a href="/creaCuenta.php">¿No tienes cuenta?</a>
    </form>
  </div>
</body>

</html>