<?php

// セッションを開始
session_start();
session_regenerate_id(true);

$ticket = sha1(uniqid(mt_rand(), true) . session_id());
$_SESSION['ticket'] = $ticket;

?>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="format-detection" content="telephone=no">
<title>参加申し込み - スマートフォンサイト制作実践ガイド</title>
<link href="css/normalize.css" rel="stylesheet">
<link href="css/common.css" rel="stylesheet">
<link href="css/form.css" rel="stylesheet">
<script src="js/main.js"></script>
<script src="js/form.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('form');
  
  new AppValidator(form);
}, false);
</script>
</head>
<body>

<header id="header">
  <h1>スマートフォンサイト制作実践ガイド<span>参加申し込み</span></h1>
  <a href="index.html">TOPページに戻る</a>
</header>

<nav id="sitemenu">
  <div>
    <ul>
      <li><a href="session.html">セッション概要</a></li>
      <li><a href="faq.html">よくある質問</a></li>
      <li><a href="access.html">会場アクセス</a></li>
      <li><a href="form.php">参加申し込み</a></li>
      <li><a href="index.html">トップページ</a></li>
    </ul>
    <p><button id="closenav">メニューを閉じる</button></p>
  </div>
  <h2><a href="#sitemenu">サイトメニュー</a></h2>
</nav>

<section id="contents">
  <h3>セッションの申し込みを行います。</h3>
  <div class="form_area">
    <form action="app/sendmail.php" method="post" id="form">
      <div class="form_item">
        <label for="form_name">名前</label><br>
        <input id="form_name" class="expect_string" type="text" name="name" required placeholder="例：杉本吉章">
      </div>
      <div class="form_item">
        <label for="form_age">年齢</label><br>
        <input id="form_age" type="number" name="age">&nbsp;歳
      </div>
      <div class="form_item">
        <label>性別</label><br>
        <label for="form_gender_m" class="expect_touch" onclick="">
          <input id="form_gender_m" type="radio" name="gender" value="male">男性
        </label>
        <label for="form_gender_f" class="expect_touch" onclick="">
          <input id="form_gender_f" type="radio" name="gender" value="female">女性
        </label>
      </div>
      <div class="form_item">
        <label for="form_area">お住まい</label><br>
        <select id="form_area" name="area">
          <option value="北海道・東北">北海道・東北エリア</option>
          <option value="関東">関東エリア</option>
          <option value="甲信越・北陸">甲信越・北陸エリア</option>
          <option value="東海">東海エリア</option>
          <option value="関西">関西エリア</option>
          <option value="中国">中国エリア</option>
          <option value="四国">四国エリア</option>
          <option value="九州・沖縄">九州・沖縄エリア</option>
        </select>
      </div>
      <div class="form_item">
        <label for="form_tel">電話番号</label><br>
        <input id="form_tel" type="tel" name="tel" required placeholder="例：1234567890">
      </div>
      <div class="form_item">
        <label for="form_mail">Eメール</label><br>
        <input id="form_mail" class="expect_string" type="email" name="mail" required>
      </div>
      <div class="form_submit">
        <input type="hidden" name="ticket" value="<?php echo $ticket;?>" id="ticket" />
        <input class="button_link" type="submit" name="submit" value="この内容で送信します">
      </div>
    </form>
  </div>
</section>

<footer id="footer">
  <p><small>Copyright Samplesite all rights reserved.</small></p>
</footer>

</body>
</html>
