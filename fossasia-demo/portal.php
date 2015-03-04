<?php
define('uname', 'minhaz');
define('pwd', 'password');
define('HOST', 'localhost');
define('TOTAL', 1000000);
define('USER', 'root');
define('PASS', '');
define('DB', 'test');

date_default_timezone_set(UTC); 
include __DIR__ .'/libs/csrf/csrfprotector.php';
// csrfProtector::init();

if (isset($_COOKIE['username']) && isset($_COOKIE['password'])) {
	if ($_COOKIE['username'] != uname || $_COOKIE['password'] != md5(pwd)) {
		// go to portal.php
		header('location: logout.php');
		exit;
	}
} else {
	header("location: logout.php");
	exit;
}

$con = mysql_connect(HOST, USER, PASS);
mysql_select_db(DB);

if (isset($_POST['accno']) && isset($_POST['amount'])) {
	$q = mysql_query("SELECT count(amount) FROM `fossasia-bank`;");
	$r = mysql_fetch_array($q);
	$bal = TOTAL - $r[0];
	if ($bal > intval($_POST['amount'])) {
		$q = mysql_query("INSERT INTO `fossasia-bank`(`to`, `amount`) VALUES ('$_POST[accno]', '$_POST[amount]')");
		if ($q) {
			header("location: ./portal.php?success=true");
			exit;
		} else $error = mysql_error();
	} else {
		$error = 'insufficient balance';
	}
}
//

// -- get all transactions
$q = mysql_query("SELECT * FROM `fossasia-bank`;");
$d = array();
$i = 0;
$deduction = 0;
while($row = mysql_fetch_array($q)) {
	$d[$i++] = $row;
	$deduction += $row['amount'];
}
$balance = TOTAL - $deduction;
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
		<h2>Welcome <?= $_COOKIE['username']; ?></h2>
		<h2>Payment transfer</h2>
		<form action="./portal.php" method="post">
			<input type="text" name="accno" placeholder="reciever's account no">
			<input type="text" name="amount" placeholder="amount">
			<input type="submit" value="transfer">
			<br><br>
			<?php
				if (isset($_GET['success'])) echo '<span style="color: green">transfer successful </span>';
				else if (isset($error)) echo '<span style="color: red">' .$error ."</span>";
			?>
		</form>
		<hr>
		<a href="./logout.php">logout</a> &nbsp;
		<a href="./">portal</a>
		<br>
		
	</div>
	<div class="large-6 columns">
		<h2>Balance - <?= $balance; ?> units</h2>
		<h2>Payment history</h2>
		<table style="width: 100%">
			<tr>
				<th>#</th>
				<th>To</th>
				<th>Amount</th>
				<th>Time</th>
			</tr>
			<?php
				foreach ($d as $key => $value) {
					echo '<tr>';
						echo '<td>' .$value['id'] .'</td>';
						echo '<td>' .$value['to'] .'</td>';
						echo '<td>' .$value['amount'] .'</td>';
						echo '<td>' .$value['timestamp'] .'</td>';
					echo '</tr>';
				}
			?>
		</table>
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

