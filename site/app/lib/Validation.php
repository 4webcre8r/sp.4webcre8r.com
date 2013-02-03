<?php if ( ! defined('APPLICATION_PATH') ) exit('Disallowed direct access.');

/* =========================================================
 * 
 * 検証用Validationクラス
 * 
 * =========================================================
 */

class Validation {
	
	protected $_errors   = array();  // エラーメッセージ
	protected $_posts    = array();  // 検証ルールに基づく入力データ
	
	// ルールから検証を行う
	public function validate($settings) {
		$this->_errors = array();
		
		foreach ( $settings as $setting ) {
			// 検証ルールを変数に格納
			$field = $setting['field'];
			$label = $setting['label'];
			$rules = $setting['rules'];
			// 入力値の存在確認
			$value = ( isset($_POST[$field]) ) ? $_POST[$field] : '';
			$value = trim($value);
			// ルール群の配列をループで順に検証
			foreach ( (array)$rules as $rule ) {
				if ( is_array($rule) ) {
					list($rule, $condition) = $rule;
				} else {
					$condition = false;
				}
				// 検証用のメソッドがあれば実行する
				if ( method_exists($this, $rule) ) {
					$result = $this->{$rule}($label, $value, $condition);
					// 検証をクリアしなければ、後の検証はスキップする
					if ( $result === false ) {
						break;
					}
				}
			}
			// ラベルに対応した入力値を一時的に配列に格納
			$this->_posts[$field] = array($label, $value);
		}
		
		// エラーメッセージがなければ、検証はクリア
		if ( count($this->_errors) == 0 ) {
			return true;
		}
		// 検証をクリアしなかった場合
		return false;
	}
	
	// エラーメッセージを取得
	public function get_errors() {
		return $this->_errors;
	}
	
	// ラベルに対応した入力値配列を取得
	public function get_post_data() {
		return $this->_posts;
	}
	
	// 不正な入力値がなかったかを取得
	public function is_valid_input() {
		return $this->check_post($_POST);
	}
	
	// 不正な入力値がないかを検出
	protected function check_post($post) {
		foreach ( $post as $key => $value ) {
			if ( is_array($value) ) {
				// 配列の場合は、再帰的に検証する
				$recursive = $this->_check_post($value);
				if ( ! $recursive === false )
				{
					return false;
				}
				$post[$key] = $recursive;
			} else {
				// magic_quotes_gpc対策
				if ( get_magic_quotes_gpc() ) {
					$value = stripcslashes($value);
				}
				// 想定されるUTF-8エンコーディングであるかをチェック
				if ( ! mb_check_encoding($value, 'UTF-8') ) {
					return false;
				}
				// Nullbyteが含まれていないかをチェック
				if ( preg_match('/\0/', $value) ) {
					return false;
				}
				// 改行コードをLFに統一させる
				$post[$key] = str_replace(array("\r\n", "\r"), "\n", $value);
			}
		}
		$_POST = $post;
		return true;
	}
	
	// 必須入力チェック
	protected function required($label, $value, $condition) {
		if ( $value === '' ) {
			$this->_errors[] = $label . 'は必須入力です。';
			return false;
		}
		return true;
	}
	
	// メールアドレスの形式チェック
	protected function email($label, $value, $condition) {
		if ( $value !== '' && filter_var($value, FILTER_VALIDATE_EMAIL) === false ) {
			$this->_errors[] = 'メールアドレスの形式が正しくありません。';
			return false;
		}
		return true;
	}
	
	// 最大入力文字数チェック
	protected function max_length($label, $value, $condition) {
		$length = ( function_exists('mb_strlen')) ? mb_strlen($value) : strlen($value);
		if ( $length > $condition ) {
			$this->_errors[] = $label . 'は' . $condition . '文字以内で入力してください。';
			return false;
		}
		return true;
	}
	
	// 最小入力文字数チェック
	protected function min_length($label, $value, $condition) {
		$length = ( function_exists('mb_strlen')) ? mb_strlen($value) : strlen($value);
		if ( $length < $condition ) {
			$this->_errors[] = $label . 'は' . $condition . '文字以上で入力してください。';
			return false;
		}
		return true;
	}

	// 数値形式のみのチェック
	protected function number($label, $value, $condition) {
		if ( $value !== '' && ! ctype_digit($value) ) {
			$this->_errors[] = $label . 'は数値形式で入力してください。';
			return false;
		}
		return true;
	}

	// 指定した文字列のみの受け入れチェック
	protected function expects($label, $value, $condition) {
		if ( $value !== '' && ! in_array($value, $condition) ) {
			$this->_errors[] = $label . 'の入力値が正しくありません。';
			return false;
		}
		return true;
	}
}
