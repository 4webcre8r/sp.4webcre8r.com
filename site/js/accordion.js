(function() {
  // ヘッド要素,コンテンツ要素を対とするアコーディオンセット
  // heightは指定されないケースもある
  function AccordionSet(head, body, height) {
    this.head = head;
    this.body = body;
    // 開いた時の高さ
    this.openHeight = height;
    // 開閉フラグ
    this.openFlag   = false;
    // タッチイベントセット
    this.head.addEventListener('click', this, false);
  }

  // タッチイベントハンドラ
  AccordionSet.prototype.handleEvent = function(evt) {
    // 開閉状態に応じて処理を分岐する
    if (!this.openFlag) {
      if (typeof this.openHeight === 'undefined') {
        this.body.style.height = this.getOriginalHeight(this.body) + 'px';
      } else {
        this.body.style.height = this.openHeight + 'px';
      }
      this.head.className += ' open';
      this.openFlag = true;
    } else {
      this.head.className = this.head.className.replace(' open', '');
      this.body.style.height = '0px';
      this.openFlag = false;
    }
  };
  
  // 要素の高さ検出
  AccordionSet.prototype.getOriginalHeight = function(element) {
    var height;
    
    // 一時的にheight:autoにすることで高さを検出できるようにする
    element.style.height = 'auto';
    height = element.offsetHeight;
    element.style.height = '0px';
    
    return height;
  };
  
  // アプリケーションロジックを記述
  function Accordion(targetSelector, height) {
    var i;
    // ヘッダ要素、コンテンツ要素を取得
    var heads  = document.querySelectorAll(targetSelector);
    var bodys  = document.querySelectorAll(targetSelector + ' + .body');
    var length = heads.length;
    
    for (i = 0; i < length; i++) {
      // アコーディオンセット生成
      new AccordionSet(heads[i], bodys[i], height);
     }
  }
  
  // アプリケーションをグローバル空間に移す
  window.AppAccordion = Accordion;
  
})();
