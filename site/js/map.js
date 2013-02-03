(function(google) {
  if (!google) {
    return;
  }
  
  // サービスの初期化と変数の宣言
  var geoCoder           = new google.maps.Geocoder();                // ジオコーダーオブジェクトの初期化
  var directionsService  = new google.maps.DirectionsService();       // ルート検索オブジェクトの初期化 
  var directionsRenderer = new google.maps.DirectionsRenderer();      // ルート検索結果描画オブジェクトの初期化
  var suggestMode        = google.maps.DirectionsTravelMode.WALKING;  // ルート検索モード（デフォルトは徒歩）
  
  var mapObject;      // メイン地図オブジェクト
  var mapTarget;      // 地図生成先要素
  var walkerLink;     // 徒歩でのルート検索リンク要素
  var driveLink;      // 車でのルート検索リンク要素
  var totalDistance;  // 検索ルートの合計距離表示要素
  var origin;         // 現在地のマーカーオブジェクト
  var destination;    // 目的地のマーカーオブジェクト
  var watchID;        // 現在地の定期監視ID
  
  // 会場の所在地
  var address = '愛知県名古屋市中村区上米野町4丁目20番地';
  
  // アプリケーション初期化関数
  function googleMapInitialize() {
    // HTML要素を取得
    mapTarget     = document.getElementById('map');            // 地図表示対象の要素
    walkerLink    = document.getElementById('walker');         // 徒歩ルート検索用ボタン
    driveLink     = document.getElementById('drive');          // 車ルート検索用ボタン
    totalDistance = document.getElementById('totaldistance');  // 合計距離表示要素
    
    // ジオコーダリクエストで会社の経緯度を取得する
    geoCoder.geocode({address: address}, geocoderCallback);
  }
  
  function geocoderCallback(result, status) {
    // ジオコーディングのステータスをチェック
    if (status != google.maps.GeocoderStatus.OK) {
      alert('住所の取得に失敗しました。');
      return;
    }
    // 経緯度オブジェクトを取得
    var latLng = result[0].geometry.location;
    
    // 地図作成
    mapObject = new google.maps.Map(mapTarget, {
      zoom:      16,                            // 拡大度
      center:    latLng,                        // 中心の経緯度
      mapTypeId: google.maps.MapTypeId.ROADMAP  // マップタイプ
    });
    
    // 所在地にマーカーを打つ
    destination = new google.maps.Marker({
      map:       mapObject,  // 地図オブジェクト 
      position:  latLng,     // マーカー座標
      animation: google.maps.Animation.BOUNCE
    });
    
    // Geolocation APIが有効なら、徒歩ルート検索と車ルート検索イベントをセットする
    if (navigator.geolocation) {
      walkerLink.addEventListener('click', function(evt) {
        if (suggestMode == google.maps.DirectionsTravelMode.WALKING) {
          return;
        }
        driveLink.rel = '';
        walkerLink.rel = 'selected';
        suggestMode = google.maps.DirectionsTravelMode.WALKING;
        navigator.geolocation.getCurrentPosition(geolocationSuccessCallback, geolocationErrorCallback);
      }, false);

      driveLink.addEventListener('click', function(evt) {
        if (suggestMode == google.maps.DirectionsTravelMode.DRIVING) {
          return;
        }
        walkerLink.rel = '';
        driveLink.rel = 'selected';
        suggestMode = google.maps.DirectionsTravelMode.DRIVING;
        navigator.geolocation.getCurrentPosition(geolocationSuccessCallback, geolocationErrorCallback);
      }, false);
      
      // 現在地監視開始
      watchID = navigator.geolocation.watchPosition(geolocationSuccessCallback, geolocationErrorCallback);

      // 現在地監視はブラウザのリロード後も解放されないので、アンロードのタイミングでクリアする
      window.addEventListener('unload', function() {
        try {
          navigator.geolocation.clearWatch(watchID);
        } catch (e) {}
      }, false);
      
    } else {
      // Geolocation APIが利用できない場合はボタンを非表示にする
      document.querySelector('.mapcontrol').style.display = 'none';
      totalDistance.style.display = 'none';
    }
  }
  
  // Geolocation APIで現在地を取得できた際のコールバック関数
  function geolocationSuccessCallback(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latLng = new google.maps.LatLng(lat, lng);
    
    // 現在地のマーカーが打たれてなければ生成
    if (!origin) {
      origin = new google.maps.Marker({
        map:       mapObject,
        position:  latLng,
        animation: google.maps.Animation.DROP
      });
    } else {
      // マーカーが既にあれば、位置をセット
      origin.setPosition(latLng);
    }
    // マーカー間のルート検索をリクエスト
    directionsService.route({
      origin:      origin.getPosition(),                     // 現在地の経緯度
      destination: destination.getPosition(),                // 目的地の経緯度
      travelMode:  suggestMode,                              // ルート検索モード
      unitSystem:  google.maps.DirectionsUnitSystem.METRIC,  // 検索距離の単位
      optimizeWaypoints: true                                // 検索ルートを最適化するかどうか
    }, directionsServiceCallback);                           // コールバック関数の指定
  }
  
  // Geolocation APIで現在値の秀徳に失敗した際のコールバック関数
  function geolocationErrorCallback(error) {
    destination.setAnimation(null);
    switch(error.code) {
      case 2:
        alert('位置情報が取得できませんでした。');
        // 現在地の定期監視をストップ
        navigator.geolocation.clearWatch(watchID);
        break;
      case 3:
        alert('位置情報取得がタイムアウトしました。');
        // 現在地の定期監視をストップ
        navigator.geolocation.clearWatch(watchID);
        break;
    }
  }
  
  // ルート検索リクエスト完了後のコールバック関数
  function directionsServiceCallback(response, status) {
    if (status != google.maps.DirectionsStatus.OK) {
      return;
    }
    var distance = 0;
    var routes  = response.routes[0].legs;
    var length  = routes.length;
    var i;
    
    // ルート検索結果から合計距離の計算
    for (i = 0; i < length; i++) {
      distance += routes[i].distance.value;
    }
    totalDistance.textContent = distance / 1000;
    
    // ルート検索描画オブジェクトの初期設定 
    directionsRenderer.setOptions({
      map:              mapObject,  // 描画対象の地図オブジェクト
      draggable:        false,      // ルートをドラッグで移動できるかどうか
      suppressMarkers:  true,       // ルート間に新しくマーカーを打つ制御を無効にするかどうか
      preserveViewport: false,      // ルートを描画した後も、地図の表示位置と拡大をしないかどうか
      directions:       response    // ルート描画対象の結果オブジェクト
    });
    
  }
  
  window.AppGoogleMap = googleMapInitialize;
  
})(window.google);