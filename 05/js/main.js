document.addEventListener('DOMContentLoaded', function() {
  // 4.3.3 フィードバックを返すボタンUI
  // アクティブ擬似クラスの再現

  if (/iP[hone|od|ad]/.test(navigator.userAgent)) {
    // iOSの場合
    // リスナー関数の中は、処理が何もなくて構いません
    document.addEventListener('touchstart', function() {}, false);
  } else {
    // Androidの場合
    // アクティブにしたい要素のマッチング用CSSセレクタ
    var selector = 'a, button, input[type="submit"], input[type="button"], label';

    // タッチイベントを指定し、アクティブにすべき要素にマッチすれば処理を行う
    document.addEventListener('touchstart', function(event) {
      if (event.target.webkitMatchesSelector(selector)) {
        toggleFakeActive(event.target);
      }
    }, false);
    document.addEventListener('touchend', function(event) {
      if (event.target.webkitMatchesSelector(selector)) {
        toggleFakeActive(event.target);
      }
    }, false);
  }

  // ナビゲーションメニューの開閉
  var openLink   = document.querySelector('#sitemenu h2 > a');
  var closeBtn   = document.getElementById('closenav');
  var navigation = document.querySelector('#sitemenu > div');

  openLink.addEventListener('click', openNavigation, false);
  closeBtn.addEventListener('click', closeNavigation, false);

  function toggleFakeActive(elm) {
    var rex = /(\s|^)active(\s|$)/;

    if (rex.test(elm.className)) {
      elm.className = elm.className.replace(rex, '');
    } else {
      elm.className += ' active';
    }
  }

  function openNavigation(event) {
    event.preventDefault();
    navigation.className = 'open';
  }
  
  function closeNavigation(event) {
    navigation.className = '';
  }
}, false);
