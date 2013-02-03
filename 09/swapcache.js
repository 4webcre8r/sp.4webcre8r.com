window.addEventListener('load', function() {
  var appCache = window.applicationCache;

  appCache.addEventListener('updateready', function(evt) {
    // 現在のステータスがUPDATREADYであるかをチェック
    if (appCache.status == appCache.UPDATEREADY) {
      // キャッシュを更新
      appCache.swapCache();
    }
  }  , false);
  // オンラインの場合、かつキャッシュが存在する場合は
  // マニフェストファイルを再ダウンロード
  if (navigator.onLine && appCache.status != appCache.UNCACHED) {
    try {
      appCache.update();
    } catch (e) {}
  }
}, false);