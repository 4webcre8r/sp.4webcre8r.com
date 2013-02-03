<?php if ( ! defined('APPLICATION_PATH') ) exit('Disallowed direct access.');

// メール通知先
$mail['to'] = 'youraddress@example.com';
// メール件名
$mail['subject'] = 'イベント参加申し込みフォームからの送信';
// メール本文定形フォーマット
$mail['body'] = <<<END
イベント参加申し込みフォームからの送信がありました。
内容は以下のとおりです。

%s

よろしくお願いします。
END;

// 検証フィールドとルールセット
$setting[] = array(
	'label' => 'お名前',
	'field' => 'name',
	'rules' => array(
				'required',
				array('min_length', 3),
				array('max_length', 255)
			)
);
$setting[] = array(
	'label' => '年齢',
	'field' => 'age',
	'rules' => array(
				'number'
			)
);
$setting[] = array(
	'label' => '性別',
	'field' => 'gender',
	'rules' => array(
				array('expects', array('male', 'female'))
			)
);
$setting[] = array(
	'label' => 'お住まい',
	'field' => 'area',
	'rules' => array(
				array('expects', array('北海道・東北', '関東', '甲信越・北陸', '東海', '関西', '中国', '四国', '九州・沖縄'))
			)
);
$setting[] = array(
	'label' => '電話番号',
	'field' => 'tel',
	'rules' => array(
				'number'
			)
);
$setting[] = array(
	'label' => 'メールアドレス',
	'field' => 'mail',
	'rules' => array(
				'required',
				'email',
				array('max_length', 255)
			)
);
