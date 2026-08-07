<?php
/* VEIA — recibe el formulario de contacto y lo envía por correo */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
  exit;
}

$nombre   = trim($_POST['nombre'] ?? '');
$negocio  = trim($_POST['negocio'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$correo   = trim($_POST['correo'] ?? '');
$mensaje  = trim($_POST['mensaje'] ?? '');

/* Campo trampa anti-spam: los bots lo llenan, las personas no lo ven */
if (!empty($_POST['sitio'])) {
  echo json_encode(['ok' => true]);
  exit;
}

if ($nombre === '' || $mensaje === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Escribe tu nombre y tu mensaje']);
  exit;
}

$para   = 'contacto@veia.com.mx';
$asunto = 'Nuevo mensaje del sitio — ' . $nombre;
$cuerpo = "Nombre: $nombre\n"
        . "Negocio: $negocio\n"
        . "Teléfono: $telefono\n"
        . "Correo: $correo\n\n"
        . "Mensaje:\n$mensaje\n";

$headers  = "From: Sitio VEIA <contacto@veia.com.mx>\r\n";
if ($correo !== '' && filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  $headers .= "Reply-To: $correo\r\n";
}
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$enviado = mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $headers);

echo json_encode(['ok' => (bool) $enviado]);
