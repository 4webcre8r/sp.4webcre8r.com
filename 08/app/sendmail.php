<?php

// アプリケーション起動フラグ
define('APPLICATION_PATH', dirname(__FILE__));

// 文字エンコーディング指定
mb_internal_encoding('UTF-8');
mb_language('ja');

// 設定ファイル読み込み
require_once(APPLICATION_PATH . '/config/config.php');
// 検証ライブラリ読み込み
require_once(APPLICATION_PATH . '/lib/Validation.php');

// セッションをスタート
session_start();
session_regenerate_id(true);

// Ajaxリクエストを識別するヘッダーがなければ処理を中断する
if ( ! isset($_SERVER['HTTP_X_REQUESTED_WITH']) ||
     $_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest' ) {
	exit('アクセスが拒否されました。');
}
// POSTリクエストでなければ処理を中断する
if ( $_SERVER['REQUEST_METHOD'] === 'GET' ) {
	exit('アクセスが拒否されました。');
}
// CSRF対策のため、form.phpで生成した　チケットの存在をチェック
if ( ! isset($_POST['ticket']) || ! isset($_SESSION['ticket']) ) {
	exit('アクセスが拒否されました。');
}
// チケットがあれば、値が一致するかどうかをチェック
if ( $_POST['ticket'] !== $_SESSION['ticket'] ) {
	exit('アクセスが拒否されました。');
}

$validation = new Validation();
$response   = array();

// 不正な文字が入っていないか、入力値をチェックする
if ( ! $validation->is_valid_input() ) {
	$response['status'] = 'invalid';
	$response['errors'] = '';
}
else if ( ! $validation->validate($setting) ) {
	// 検証をクリアしなかった場合、エラーステータスとメッセージをセット
	$response['status'] = 'error';
	$response['errors'] = $validation->get_errors();
}
else {
	// 検証をパスした場合はメール送信処理を行う
	$response['errors'] = '';
	
	// POSTデータを取得
	$posts   = $validation->get_post_data();
	$headers = array();
	$bodys   = array();
	$from    = '';
	
	// メール本文用に入力値を整形
	foreach ( $posts as $field => $post ) {
		list($label, $value) = $post;
		$bodys[] = sprintf('%s: %s', $label, $value);
		if ( $field === 'mail' ) {
			// emailフィールドを送信元アドレスにする
			$from = $value;
		} else if ( $field === 'name' ) {
			// nameフィールドを送信元名にする
			$from_name = str_replace("\n", '', $value);
		}
	}
	
	// 本文
	$body    = sprintf($mail['body'], implode("\n", $bodys));
	// 件名
	$subject = mb_encode_mimeheader($mail['subject']);
	// 送信先
	$to      = $mail['to'];
	
	// メールヘッダ生成
	$headers[] = 'Date: ' . date('D, j M Y H:i:s');
	$headers[] = 'Return-Path: ' . $from;
	$headers[] = sprintf('From: %s <%s>', mb_encode_mimeheader($from_name), $from);
	$headers[] = sprintf('Message-ID: <%s@%s>', md5(uniqid(mt_rand(), true)), $_SERVER['SERVER_NAME']);
	$headers[] = 'X-Mailer: ExampleMailer';
	$headers[] = 'Content-Transfer-Encoding: base64';
	$headers[] = 'Content-Type: text/plain; charset=UTF-8';
	
	$header  = implode("\n", $headers);
	
	// セーフモードにより、メール送信処理を振り分け
	if ( ini_get('safe_mode') ) {
		$send = mail($to, $subject, $body, $header);
	} else {
		$send = mail($to, $subject, $body, $header, sprintf('-oi -f %s', $from));
	}
	
	// メール送信の可否によりステータスを振り分け
	if ( $send ) {
		// メール送信成功
		$response['status'] = 'success';
		// セッションを破棄する
		$_SESSION = array();
		session_destroy();
	} else {
		$response['status'] = 'mail_error';
	}
}

// JSONフォーマットとしてレスポンスを返却
header('HTTP/1.1 200 OK');
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($response);
// end of script
