(function() {
  
  var paddingOffset  = 40;  // スライド要素の左右パディング
  var borderOffset   = 0;   // スライド要素の左右ボーダーの太さ
  var swipeThreshold = 40;  // スワイプ判定のしきい値
  
  // コンストラクタ
  function SliderContent(box) {
    this.box        = box;
    this.sliderMask = box.querySelector('#slider');
    this.wrapper    = box.querySelector('ul');    // スライド操作対象要素
    this.slides     = box.querySelectorAll('li'); // スライド表示要素
    this.arrows     = box.querySelectorAll('span.arrow'); // 矢印要素
    this.current    = 0;  // 現在表示しているスライド
    this.positionX  = 0;  // タッチ開始時のx座標
    this.offset     = 0;  // タッチ開始時のmargin-leftの値
    this.distance   = 0;  // タッチイベントでの移動距離
    this.maskWidth  = 0;
    
    // 初期化とイベントセット
    this.init()
  }
  
  // 初期化メソッド
  SliderContent.prototype.init = function() {
    // スライド要素の幅を計算する
    this.calculateWidth();
    
    // 左の矢印は初期で非表示にする
    this.arrows[0].style.display = 'none';
    
    // タッチイベントを監視
    this.wrapper.style.marginLeft = '0px';
    this.wrapper.addEventListener('touchstart', this, false);
    this.wrapper.addEventListener('touchmove',  this, false);
    this.wrapper.addEventListener('touchend',   this, false);
    window.addEventListener('resize', this, false);
  };
  
  // スライド枠とスライド要素の横幅をセット
  SliderContent.prototype.calculateWidth = function() {
    var length = this.slides.length;
    var i;
    
    this.maskWidth  = this.sliderMask.offsetWidth;
    
    for (i = 0; i < length; i++) {
      this.slides[i].style.width = this.maskWidth - paddingOffset - borderOffset + 'px';
    }
    this.wrapper.className = '';
    this.wrapper.style.marginLeft = -(this.maskWidth * this.current) + 'px';
  };
  
  // イベントハンドラ
  SliderContent.prototype.handleEvent = function(evt) {
    var that = this;
    
    // デフォルトのイベント挙動をキャンセル（Android対策）
    evt.preventDefault();
    switch (evt.type) {
      
      case 'touchstart':
        // トランジションをオフ
        this.wrapper.className = '';
        
        // タッチ開始時の座標とmargin-leftの値を保存
        this.positionX = evt.touches[0].clientX;
        this.offset = parseInt(this.wrapper.style.marginLeft, 10);
        break;
      
      case 'touchmove':
        // 現在のタッチ座標とタッチ開始時の座標の差を計算
        this.distance = evt.touches[0].clientX - this.positionX;
        // タッチに追従してスクロールさせる
        this.wrapper.style.marginLeft = this.distance + this.offset + 'px';
        break;
      
      case 'touchend':
        // トランジションをオン
        this.wrapper.className = 'action';
        
        if (this.distance < -swipeThreshold) {       // 左方向へのスワイプ
          this.current++;
        } else if (this.distance > swipeThreshold) { // 右方向へのスワイプ
          this.current--;
        }
        // 移動対象のスライドの最大値、最小値に収まるように調整と、矢印のオンオフ
        if (this.current >= this.slides.length - 1) {
          this.current = this.slides.length - 1;
          // 最終スライドなので、右矢印は非表示
          this.arrows[0].style.display = 'block';
          this.arrows[1].style.display = 'none';
        } else if (this.current <= 0) {
          this.current = 0;
          this.arrows[0].style.display = 'none';
          this.arrows[1].style.display = 'block';
        } else {
          this.arrows[0].style.display = 'block';
          this.arrows[1].style.display = 'block';
        }
        // 目的の値までmargin-leftをトランジションで動かす
        this.wrapper.style.marginLeft = -(this.maskWidth * this.current) + 'px';
        break;
        
      case 'resize':
        // 回転・拡大縮小に合わせてスライド幅を再計算する
        this.calculateWidth();
        break;
    }
  };

  // グローバル空間に関数を移す
  window.AppSlider = SliderContent;
})();
