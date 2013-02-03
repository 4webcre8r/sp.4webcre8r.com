(function() {
  // XMLHttpRequest Level 2のFormDataのAPIが利用可能かを先に判定
  var formDataEnable = (window.FormData) ? true : false;
  // 検証対象のフォーム要素
  var form;
  // フィードバック用送信ボタン
  var submitButton;
  
  function formValidation() {
    var elements     = form.querySelectorAll('[id^=form_]');
    var length       = elements.length;
    var formData     = ( formDataEnable ) ? new FormData() : [];
    var tokenElement = document.getElementById('ticket');
    var errors       = [];
    var i;
    var element;
    
    
    for (i = 0; i < length; i++) {
      element = elements[i];
      // 入力値を検証するメソッドをコールする
      element.checkValidity();
      // 検証結果を確認
      if (element.validity.valid === false) {
        // エラーメッセージを取得してエラー配列に追加
        errors.push(getValidationMessage(element));
      } else {
        // ラジオボタンとチェックボックスはチェックされていなければスキップする
        if (element.type === 'radio' || element.type === 'checkbox') {
          if (element.checked === false) {
            continue;
          }
        }
        if (formDataEnable) {
          // FormData.append()でPOSTデータに追加
          formData.append(element.name, element.value);
        } else {
          // POSTデータの配列にURIエンコードした文字列を追加
          formData.push(encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value));
        }
      }
    }
    
    // 全ての要素の検証をクリアした場合
    if (errors.length === 0) {
      // オンラインであるかどうかをチェック
      if (!navigator.onLine) {
        alert('オフライン状態です。オンラインの環境でお試しください。');
        return;
      }
      if (confirm('入力された内容で送信します。\nよろしいですか？')) {
        // トークンの値を追加
        if (formDataEnable) {
          formData.append(tokenElement.name, tokenElement.value);
        } else {
          formData.push(encodeURIComponent(tokenElement.name) + '=' + encodeURIComponent(tokenElement.value));
        }
        // 確認ダイアログでOKが押されれば、送信開始
        sendFormData(form.action, formData);
      }
    } else {
      alert(errors.join('\n'));
    }
  }
  
  // 検証エラーメッセージを生成
  function getValidationMessage(element) {
    var msg = '';
    // 入力要素に対応する<label>要素内のテキストを取得
    var label     = document.querySelector('label[for="' + element.id + '"]');
    var labelName = label.firstChild.nodeValue;
    
    // element.validityのプロパティを見てメッセージを決定する
    if (element.validity.valueMissing) {
      msg = labelName + 'は必須入力です。';
    } else if (element.validity.patternMismatch || element.validity.typeMismatch) {
      msg = labelName + 'の形式が正しくありません。';
    } else if (element.validity.rangeUnderflow) {
      msg = labelName + 'の入力値が最小値を下回っています。';
    } else if (element.validity.rangeOverflow) {
      msg = labelName + 'の入力値が最大値を超えています。';
    } else if (element.validity.tooLong) {
      msg = labelName + 'の入力値が長過ぎます。';
    }
    return msg;
  }
  
  // POSTデータ送信メソッド
  function sendFormData(uri, formData) {
    var xhr = new XMLHttpRequest();
    // 送信パラメータを整形
    var params = (formDataEnable) ? formData : formdata.join('&');
    
    // 送信中であることをフィードバックし、多重送信も防ぐ
    submitButton.value = '送信中です...';
    submitButton.disabled = true;
    
    xhr.open('POST', uri);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    // FormDataの実装がない場合のみ、POST送信用のヘッダを付加する
    if (!formDataEnable) {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    // 通信完了のハンドリング
    xhr.onload = function() {
      if (xhr.status == 200) {
        // レスポンス文字列を解析して処理を分岐する
        parseResponse(xhr.responseText);
      } else {
        alert('通信に失敗しました。');
      }
      // 通信終了のフィードバック
      submitButton.value    = 'この内容で送信します';
      submitButton.disabled = false;
    }
    xhr.send(params);
  }
  
  // Ajax通信レスポンス処理メソッド
  function parseResponse(response) {
    var json;
    var success;
    
    try {
      // JSON形式の文字列をJSONオブジェクトに変換
      json = JSON.parse(response);
      // ステータス文字列で分岐する
      switch(json.status) {
        // 不正な文字列が送信された場合
        case 'invalid':
          // 再度送信されないようにフォーム要素をドキュメントツリーから取り除く
          form.parentNode.removeChild(form);
          break;
        // サーバ側の検証に通らなかった場合
        case 'error':
          // json.errorsの配列に入るメッセージをダイアログで表示
          alert(json.errors.join('\n'));
          break;
        // メール送信が出来なかった場合
        case 'mail_error':
          alert('メール送信に失敗しました。');
          break;
        // 処理成功の処理
        case 'success':
          // 完了メッセージを生成
          success = document.createElement('div');
          success.appendChild(document.createTextNode('申し込みが完了しました。ありがとうございます。メッセージをタップすればTOPページに戻ります。'));
          success.addEventListener('touchend', function(evt) {
            location.href = './index.html';
          }, false);
          // 完了メッセージ要素を挿入し、再送信できないようにフォーム要素をドキュメントツリーから取り除く
          form.parentNode.insertBefore(success, form);
          form.parentNode.removeChild(form);
          break;
      }
    } catch(e) {
      // アクセス拒否の場合はJSON形式でないレスポンスのため、ここでダイアログ表示を行う
      alert(response);
    }
  }
  
  // アプリケーション実装
  function appValidation(formElement) {
    form         = formElement;
    submitButton = form.querySelector('input[type="submit"]');
    
    form.addEventListener('submit', function(evt) {
      // デフォルトの送信処理をキャンセル
      evt.preventDefault();
      formValidation();
    }, false);
  }
  
  // アプリケーションをエクスポート
  window.AppValidator = appValidation;
  
})();
