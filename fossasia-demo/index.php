<?php
define('uname', 'minhaz');
define('pwd', 'password');

if (isset($_POST['uname']) && isset($_POST['password'])) {
	if ($_POST['uname'] == uname && $_POST['password'] == pwd) {
		setcookie('username', uname, time() + 10000);
		setcookie('password', md5(pwd), time() + 10000);
		header('location: portal.php');
		exit;
	} else {
		$error = 'incorrect login credentials';
	}
}

if (isset($_COOKIE['username']) && isset($_COOKIE['password'])) {
	if ($_COOKIE['username'] == uname && $_COOKIE['password'] == md5(pwd)) {
		// go to portal.php
		header('location: portal.php');
		exit;
	}
	setcookie('username', '', time() - 100);
	setcookie('password', '', time() - 100);
}
?>

<!doctype html>
<html class="no-js" lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sample Bank</title>
        <link rel="stylesheet" href="./css/foundation.css" />
        <link rel="stylesheet" href="./css/main.css" />
        <script src="./js/vendor/modernizr.js"></script>
    </head>
<body>
<div class="row" style="padding-top:100px">
	<div class="large-6 columns">
		<img src="./bank.jpg" width="300px">
		<h2>BestBank - features: </h2>
		<ul>
			<li>Online Banking</li>
			<li>Online Transfer</li>
			<li>Very Secure</li>
			<li>And more...</li>
		</ul>
	</div>
	<div class="large-6 columns">
		<h2>login</h2>
		<form action="./" method="post">
			<input type="text" placeholder="username.." name="uname">
			<input type="password" placeholder="password.." name="password">
			<input type="submit" value="login">
			<br><br>
			<?php if (isset($error)) {
				echo '<span style="color: red">' .$error .'</span>';
			} ?>
		</form>
	</div>

</div>

<script src="./js/jquery.js"></script>
<script src="./js/fastclick.js"></script>
<script src="./js/foundation.min.js"></script>
<script>
  $(document).foundation();
</script>
</body>
</html>

