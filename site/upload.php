<?php
if ($_FILES) {
  $destino = "uploads/" . $_FILES['arquivo']['name'];
  move_uploaded_file($_FILES['arquivo']['tmp_name'], $destino);
  echo "Arquivo enviado: " . $destino;
}
?>

<form method="POST" enctype="multipart/form-data">
  <input type="file" name="arquivo">
  <button type="submit">Enviar</button>
</form>
