<?php
setcookie('username', '', time() - 1000);
setcookie('password', '', time() - 1000);
header("location: ./index.php");
exit;