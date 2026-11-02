let gameState = "start"; // 記錄目前畫面狀態，分為開始、測驗與結果三種狀態
let currentQuestion = 0; // 記錄目前正在作答的題目索引
let selectedAnswers = []; // 儲存每一題所選取的選項索引
let correctCount = 0; // 儲存交卷後答對的題數
let score = 0; // 儲存交卷後換算出的百分比成績
let passed = false; // 記錄成績是否嚴格高於百分之六十
let scoreSubmitted = false; // 控制交卷前不顯示成績與解析
let resultScrollY = 0; // 記錄結果解析區的垂直捲動距離
let resultTouchY = 0; // 記錄結果頁觸控開始時的垂直位置
let resultDragging = false; // 記錄結果頁是否正在以觸控方式捲動
let noticeText = ""; // 儲存短暫顯示的操作提示文字
let noticeUntil = 0; // 儲存操作提示的結束時間
let confetti = []; // 儲存通過後飄落的彩帶資料
let selectedRabbit = null; // 儲存玩家在開局選定的兔子索引
let healthyResult = false; // 記錄結果是否屬於九十分以上的健康級距
let needsCareResult = false; // 記錄結果是否屬於五十至八十九分的待加強級距
let deceasedResult = false; // 記錄結果是否屬於零至四十九分的死亡級距
const RABBIT_PROFILES = [ // 建立三種不使用外部圖片的幾何兔子外觀資料
  { name: "奶油兔", fur: [250, 248, 241], innerEar: [224, 177, 181], accent: [224, 137, 151], description: "溫柔奶油色" }, // 定義第一隻長耳奶油兔
  { name: "焦糖兔", fur: [205, 157, 111], innerEar: [244, 191, 177], accent: [172, 92, 67], description: "活潑焦糖色" }, // 定義第二隻暖色焦糖兔
  { name: "灰灰兔", fur: [177, 188, 197], innerEar: [221, 169, 181], accent: [104, 132, 157], description: "安靜灰藍色" }, // 定義第三隻灰藍兔
]; // 結束三種兔子外觀資料

const START_STATE = "start"; // 定義開始畫面狀態名稱
const QUIZ_STATE = "quiz"; // 定義測驗畫面狀態名稱
const RESULT_STATE = "result"; // 定義結果畫面狀態名稱
const OPTION_LABELS = ["A", "B", "C", "D"]; // 定義四個選項使用的英文字母標籤
const QUESTIONS = [ // 建立兔子照護十題單選題資料陣列
  { section: "一、飲食與消化篇", question: "兔子最主要的日常主食應該是什麼？", options: ["新鮮紅蘿蔔與蔬菜", "兔飼料（乾糧）", "無限量供應的乾草（如提摩西草）", "水果與堅果"], answer: "C", explanation: "兔子的消化系統與牙齒生長需要大量的粗纖維，無限量供應的乾草能維持腸道蠕動並磨牙。蔬菜與飼料僅能作為副食或定量補充，紅蘿蔔糖分高更不能當主食！" }, // 儲存第一題飲食主食與解析
  { section: "一、飲食與消化篇", question: "當發現兔子「連續 8-12 小時以上不吃不喝、也不排便」時，最適當的處理方式是？", options: ["繼續觀察一天，看會不會自己好", "視為緊急狀況，立刻帶去看特殊寵物（非犬貓）獸醫師", "強迫餵食大量紅蘿蔔或水果汁", "給牠吃人類的胃藥"], answer: "B", explanation: "這很可能是死亡率極高的「腸胃停滯（Stasis）」。兔子的消化系統絕不能停止運作，只要超過 8~12 小時沒進食排便，就屬於醫療緊急狀況。" }, // 儲存第二題腸胃停滯與解析
  { section: "一、飲食與消化篇", question: "關於兔子的飲水，下列哪種觀念才是正確的？", options: ["兔子喝水會腹瀉甚至死亡，所以不能給水", "只要給新鮮蔬菜，裡面的水分就足夠了", "兔子需要隨時補充乾淨的飲用水（煮沸過的冷開水）", "兔子只能喝牛奶"], answer: "C", explanation: "「兔子不能喝水」是極常見的謠言！兔子體重比比例所需的喝水量其實比狗還多，必須 24 小時提供乾淨的飲用水（建議用碗或滾珠水瓶裝盛）。" }, // 儲存第三題飲水觀念與解析
  { section: "二、居住與環境篇", question: "給兔子準備的生活環境，下列哪項條件最為重要且必要？", options: ["直接讓兔子踩在金屬網格底盤上，方便清便便", "鋪設止滑墊／地毯，保護腳底關節，並提供足夠活動空間", "長期關在小籠子裡，避免牠亂跑", "放養在陽台，不需要遮蔽物"], answer: "B", explanation: "兔子的腳底沒有厚厚的肉墊，只有毛，若長期踩在硬鐵網上極易引發疼痛不堪的「腳底潰瘍（Sore Hocks）」。此外，兔子每天需要足夠的跑跳空間。" }, // 儲存第四題環境安全與解析
  { section: "二、居住與環境篇", question: "夏季高溫時，適合兔子的室內適溫範圍大約是多少？", options: ["18℃ ～ 25℃（極度怕熱，超過 28℃ 易中暑）", "28℃ ～ 32℃", "33℃ ～ 36℃", "只要有開電風扇，幾度都沒關係"], answer: "A", explanation: "兔子有厚重的毛皮且汗腺不發達，極度怕熱。台灣夏天若沒開冷氣降溫，兔子極容易中暑死亡（電風扇吹出來的是熱風，對兔子散熱幫助有限）。" }, // 儲存第五題溫度照護與解析
  { section: "三、健康與護理篇", question: "兔子到底「能不能洗澡」？", options: ["需要像狗一樣，每週洗一次澡", "一般情況下不需要洗澡，兔子會自行清潔；洗澡易引發休克或失溫", "每天都要洗澡才能保持乾淨", "用人類的香水沐浴乳洗最乾淨"], answer: "B", explanation: "兔子極度愛乾淨會自我梳理。水洗容易讓兔子產生巨大壓力導致休克，且密厚的毛不易吹乾易致失溫或皮膚病。若髒污只需局部擦拭或使用乾洗粉／局部清洗。" }, // 儲存第六題洗澡照護與解析
  { section: "三、健康與護理篇", question: "為兔子進行「絕育（絕育手術／絕育）」的主要原因是什麼？", options: ["只是為了不讓牠生小兔子", "預防高發病率的生殖系統癌症（如母兔子宮癌）並改善噴尿、攻擊等行為", "絕育後兔子會變笨比較好管教", "沒特別作用，純粹隨浪潮跟風"], answer: "B", explanation: "未絕育的母兔在 3~4 歲後，患上子宮腺癌的機率高達 60%~80%！絕育不僅能防癌延壽，也能改善發情期的噴尿標記與地盤攻擊行為。" }, // 儲存第七題絕育照護與解析
  { section: "三、健康與護理篇", question: "兔子會吃自己的便便，這是正常的嗎？", options: ["不正常，代表牠生病了或肚子太餓", "正常，牠們會吃一種軟軟黏黏的「盲腸便」，藉此補充維生素 B 群與蛋白質", "不正常，這是缺乏微量元素的異食癖", "正常，因為兔子喜歡乾淨會把環境裡的便便全部吃掉"], answer: "B", explanation: "兔子會排放一種葡萄狀、表面有黏膜的「盲腸便（Cecotropes）」，裡面富含營養。兔子直接從肛門吃掉它是正常的生理需求，不需要阻止。" }, // 儲存第八題盲腸便與解析
  { section: "四、行為與習慣篇", question: "當兔子發出「大聲用後腳蹬地（跺腳）」的聲音時，通常代表什麼意思？", options: ["牠心情很好，在跟你玩耍", "牠覺得肚子餓了要吃東西", "牠感到害怕、受驚嚇、生氣或在發出危險警訊", "牠腳癢在運動"], answer: "C", explanation: "跺腳是兔子的警戒與不滿語言，通常發生在聽到陌生巨大聲響、看到威脅，或是對主人表達極度不滿時。" }, // 儲存第九題跺腳行為與解析
  { section: "四、行為與習慣篇", question: "兔子具有「不斷磨牙」的本能需求，如果沒有提供足夠磨牙物品，最可能發生什麼後果？", options: ["牙齒會自己停止生長，沒有影響", "牙齒過長穿透齒槽，導致過長咬合不正、膿包或無法進食", "兔子會自己用手把牙齒拔掉", "只會影響美觀，不影響健康"], answer: "B", explanation: "兔子的門牙與臼齒一輩子都在不斷生長。若粗纖維（乾草）攝取不足無法磨牙，牙根會過長刺穿齒骨，造成嚴重的牙膿包、眼球突出甚至無法進食而危及生命。" } // 儲存第十題磨牙需求與解析
]; // 結束十題兔子照護題庫
function setup() { // 執行 p5.js 初始化工作
  const canvas = createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的全螢幕畫布
  canvas.elt.style.touchAction = "none"; // 停止觸控裝置在畫布上的預設捲動行為
  textFont("sans-serif"); // 使用瀏覽器通用字型避免外部字型依賴
  textAlign(CENTER, CENTER); // 設定預設文字以中心點對齊
  rectMode(CORNER); // 設定矩形使用左上角作為座標基準
  selectedAnswers = Array(QUESTIONS.length).fill(null); // 初始化每一題為尚未作答
  initializeConfetti(); // 預先建立彩帶資料供通過時使用
} // 結束 p5.js 初始化工作
function draw() { // 執行每一幀的畫面繪製
  drawBaseBackground(); // 繪製所有頁面共用的柔和背景
  if (gameState === START_STATE) { // 判斷目前是否為開始畫面
    drawStartScreen(); // 繪製開始畫面內容
  } else if (gameState === QUIZ_STATE) { // 判斷目前是否為測驗畫面
    drawQuizScreen(); // 繪製題目、選項與操作按鈕
  } else if (gameState === RESULT_STATE) { // 判斷目前是否為結果畫面
    drawResultScreen(); // 繪製成績、解析與彩帶效果
  } // 結束三種畫面狀態判斷
} // 結束每一幀的畫面繪製
function drawBaseBackground() { // 繪製兔子主題的共用背景
  background(247, 242, 232); // 填滿溫暖的米白色背景
  noStroke(); // 關閉背景裝飾的外框線
  fill(226, 241, 226, 170); // 設定左上淡綠裝飾顏色
  ellipse(width * 0.08, height * 0.14, min(width, height) * 0.22); // 繪製左上淡綠裝飾圓
  fill(250, 224, 207, 150); // 設定右下淡橘裝飾顏色
  ellipse(width * 0.94, height * 0.84, min(width, height) * 0.30); // 繪製右下淡橘裝飾圓
  fill(224, 235, 247, 130); // 設定右上淡藍裝飾顏色
  ellipse(width * 0.90, height * 0.12, min(width, height) * 0.14); // 繪製右上淡藍裝飾圓
} // 結束共用背景繪製
function getStartLayout() { // 計算開局兔子選擇畫面的響應式版面
  const mobile = width < 700; // 依照畫布寬度判斷手機排版
  const margin = mobile ? 12 : 30; // 設定不同裝置的左右邊界
  const gap = mobile ? 7 : 16; // 設定三張兔子卡片之間的間距
  const cardY = mobile ? 138 : 178; // 設定兔子選擇卡片的垂直位置
  const cardH = mobile ? min(190, max(126, height - 292)) : min(250, max(170, height - 350)); // 依照視窗高度設定卡片高度
  const cardW = (width - margin * 2 - gap * 2) / 3; // 計算三張卡片的共同寬度
  const cards = []; // 建立三張兔子選擇卡片的位置陣列
  for (let i = 0; i < RABBIT_PROFILES.length; i += 1) { // 逐一計算三張兔子卡片的位置
    cards.push({ x: margin + i * (cardW + gap), y: cardY, w: cardW, h: cardH }); // 儲存目前兔子卡片的位置資料
  } // 結束三張卡片位置計算
  const button = { x: width / 2 - min(145, width * 0.38), y: height - (mobile ? 70 : 82), w: min(290, width * 0.76), h: mobile ? 50 : 58 }; // 計算開始照護測驗按鈕位置
  return { mobile: mobile, cards: cards, button: button }; // 回傳完整的開局版面資料
} // 結束開局版面計算
function drawStartScreen() { // 繪製三隻兔子選擇畫面
  const layout = getStartLayout(); // 取得目前裝置的開局響應式版面
  const titleY = layout.mobile ? 36 : 54; // 計算開局標題垂直位置
  fill(70, 79, 70); // 設定主標題顏色
  textStyle(BOLD); // 將主標題設定為粗體
  textSize(layout.mobile ? 25 : 43); // 依照螢幕大小設定主標題字級
  text("先選一隻兔兔來照護", width / 2, titleY); // 顯示兔子選擇主標題
  textStyle(NORMAL); // 恢復一般文字樣式
  fill(93, 110, 94); // 設定副標題顏色
  textSize(layout.mobile ? 13 : 18); // 依照螢幕大小設定副標題字級
  text("挑選你想養的兔子，牠會陪你完成十題照護測驗", width / 2, titleY + 34); // 顯示選擇兔子的操作說明
  fill(75, 94, 78); // 設定卡片上方提示文字顏色
  textSize(layout.mobile ? 13 : 16); // 設定卡片提示文字字級
  text(selectedRabbit === null ? "請點選一隻兔子" : `已選擇：${RABBIT_PROFILES[selectedRabbit].name}`, width / 2, layout.cards[0].y - 18); // 顯示尚未選擇或目前選擇提示
  for (let i = 0; i < layout.cards.length; i += 1) { // 逐一繪製三張兔子選擇卡片
    drawRabbitChoiceCard(layout.cards[i], i); // 繪製目前兔子的外觀、名稱與選取狀態
  } // 結束三張兔子卡片繪製
  drawButton(layout.button.x, layout.button.y, layout.button.w, layout.button.h, "開始照護測驗", selectedRabbit !== null); // 沒選兔子時停用開始按鈕
  fill(116, 135, 117); // 設定開始畫面補充提醒顏色
  textSize(layout.mobile ? 11 : 13); // 設定補充提醒字級
  text("選定後仍可在結果頁查看這隻兔子的照護狀態", width / 2, layout.button.y + layout.button.h + 19); // 提醒玩家選定兔子會貫穿遊戲
  drawNotice(); // 顯示沒有選擇兔子時的操作提示
} // 結束三隻兔子選擇畫面繪製
function drawRabbitChoiceCard(cardBox, profileIndex) { // 繪製單一兔子選擇卡片
  const chosen = selectedRabbit === profileIndex; // 判斷目前卡片是否為玩家選中的兔子
  const over = pointInRect(mouseX, mouseY, cardBox); // 判斷滑鼠是否停留在目前卡片上
  stroke(chosen ? 205 : over ? 221 : 232, chosen ? 132 : 194, chosen ? 86 : 192); // 依照選取與滑過狀態設定卡片外框顏色
  strokeWeight(chosen ? 4 : 1); // 讓選中的兔子卡片具有明顯框線
  fill(chosen ? 255 : 255, chosen ? 247 : 255, chosen ? 224 : 255, 242); // 依照選取狀態設定卡片底色
  rect(cardBox.x, cardBox.y, cardBox.w, cardBox.h, 18); // 繪製兔子選擇卡片
  noStroke(); // 關閉兔子圖形後續不需要的卡片外框
  const rabbitSize = min(cardBox.w * 0.72, cardBox.h * 0.52); // 計算兔子插圖大小
  drawRabbit(cardBox.x + cardBox.w / 2, cardBox.y + cardBox.h * 0.46, rabbitSize, profileIndex, profileIndex); // 繪製具有不同外觀的幾何兔子
  fill(70, 79, 70); // 設定兔子名稱顏色
  textStyle(BOLD); // 將兔子名稱設定為粗體
  textSize(width < 700 ? 13 : 17); // 設定兔子名稱字級
  text(RABBIT_PROFILES[profileIndex].name, cardBox.x + cardBox.w / 2, cardBox.y + cardBox.h * 0.78); // 顯示兔子名稱
  textStyle(NORMAL); // 恢復一般文字樣式
  fill(108, 125, 109); // 設定兔子描述顏色
  textSize(width < 700 ? 10 : 12); // 設定兔子描述字級
  text(RABBIT_PROFILES[profileIndex].description, cardBox.x + cardBox.w / 2, cardBox.y + cardBox.h * 0.88); // 顯示兔子外觀描述
  if (chosen) { // 判斷是否需要繪製已選標籤
    fill(205, 132, 86); // 設定已選標籤底色
    rect(cardBox.x + 7, cardBox.y + 7, cardBox.w - 14, 25, 12); // 繪製選中兔子的高亮標籤
    fill(255); // 設定已選標籤文字顏色
    textSize(width < 700 ? 11 : 13); // 設定已選標籤字級
    text("目前照護對象 ✓", cardBox.x + cardBox.w / 2, cardBox.y + 19); // 顯示目前選中的明確標籤
  } // 結束已選標籤繪製
} // 結束單一兔子選擇卡片繪製

function getQuizLayout() { // 計算測驗畫面的響應式版面
  const mobile = width < 900; // 以寬度判斷手機或桌面排版
  const margin = mobile ? 14 : 30; // 設定不同裝置的左右邊界
  if (mobile) { // 計算手機與窄螢幕的上下排列版面
    const compact = height < 620; // 判斷是否為高度較小的手機畫面
    const question = { x: margin, y: 80, w: width - margin * 2, h: compact ? 127 : 149 }; // 設定手機題目卡片位置與高度
    const rabbit = { x: margin, y: question.y + question.h + 9, w: width - margin * 2, h: compact ? 78 : 102 }; // 設定手機兔子卡片位置與高度
    const optionY = rabbit.y + rabbit.h + 11; // 計算手機選項區起始位置
    const controlY = height - 58; // 計算手機控制列位置
    const gap = compact ? 7 : 9; // 設定手機選項間距
    const optionW = (width - margin * 2 - gap) / 2; // 計算手機雙欄選項寬度
    const optionH = constrain((controlY - optionY - 13 - gap) / 2, 42, compact ? 54 : 68); // 依照高度計算手機選項高度
    const options = { x: margin, y: optionY, w: optionW, h: optionH, gap: gap, columns: 2 }; // 組合手機選項版面資料
    const controls = { x: margin, y: controlY, w: width - margin * 2, h: 45 }; // 組合手機控制列版面資料
    return { mobile: true, question: question, rabbit: rabbit, options: options, controls: controls }; // 回傳手機完整版面
  } // 結束手機版面計算
  const question = { x: margin, y: 84, w: width - margin * 2, h: 124 }; // 設定桌面題目卡片位置與高度
  const rabbit = { x: margin, y: 214, w: width * 0.35, h: height - 294 }; // 設定桌面兔子面板位置與高度
  const options = { x: width * 0.405, y: 228, w: width * 0.55, h: 70, gap: 14, columns: 1 }; // 設定桌面單欄選項版面
  const controls = { x: width * 0.405, y: height - 68, w: width * 0.55, h: 52 }; // 設定桌面控制列版面
  return { mobile: false, question: question, rabbit: rabbit, options: options, controls: controls }; // 回傳桌面完整版面
} // 結束響應式版面計算
function drawQuizScreen() { // 繪製測驗畫面
  const layout = getQuizLayout(); // 取得目前裝置的測驗版面
  const questionData = QUESTIONS[currentQuestion]; // 取得目前題目的資料
  drawQuizHeader(); // 繪製遊戲標題與進度
  drawQuestionCard(layout.question, questionData); // 繪製題目與篇章資訊
  drawRabbitPanel(layout.rabbit); // 繪製幾何兔子插圖面板
  drawOptions(layout.options, questionData); // 繪製四個單選選項
  drawQuizControls(layout.controls); // 繪製上一題、下一題或交卷按鈕
  drawNotice(); // 繪製短暫操作提示
} // 結束測驗畫面繪製
function drawQuizHeader() { // 繪製測驗畫面標頭
  fill(70, 79, 70); // 設定標頭文字顏色
  textStyle(BOLD); // 將標頭設定為粗體
  textSize(width < 700 ? 19 : 25); // 依照螢幕大小設定標頭字級
  text("兔子照護｜p5.js 互動小測驗", width / 2, 27); // 顯示測驗標題
  textStyle(NORMAL); // 恢復一般文字樣式
  fill(110, 126, 111); // 設定進度文字顏色
  textSize(width < 700 ? 12 : 15); // 依照螢幕大小設定進度字級
  text(`第 ${currentQuestion + 1} 題／共 ${QUESTIONS.length} 題`, width / 2, 48); // 顯示目前題目進度
  fill(120, 132, 116); // 設定目前照護兔子文字顏色
  textSize(width < 700 ? 11 : 13); // 設定目前照護兔子文字字級
  text(`目前照護：${RABBIT_PROFILES[selectedRabbit].name}`, width / 2, 66); // 在測驗標題附近持續顯示選中的兔子
} // 結束測驗標頭繪製
function drawQuestionCard(panelBox, questionData) { // 繪製題目資訊卡片
  drawPanel(panelBox.x, panelBox.y, panelBox.w, panelBox.h, 255, 255, 255, 232); // 繪製白色圓角題目面板
  fill(224, 151, 111); // 設定篇章標籤顏色
  textStyle(BOLD); // 將篇章標籤設定為粗體
  textSize(width < 700 ? 13 : 16); // 設定篇章標籤字級
  text(questionData.section, panelBox.x + panelBox.w / 2, panelBox.y + 22); // 顯示題目所屬篇章
  fill(64, 73, 66); // 設定題目文字顏色
  textStyle(NORMAL); // 恢復題目文字一般字型
  const questionSize = width < 700 ? 14 : 18; // 計算響應式題目字級
  const questionLines = wrapText(questionData.question, panelBox.w - 28, questionSize); // 依照卡片寬度切分題目文字
  drawLinesCentered(questionLines, panelBox.x + panelBox.w / 2, panelBox.y + panelBox.h * 0.56, questionSize, questionSize + 6); // 置中繪製多行題目
  fill(117, 137, 119); // 設定操作提醒顏色
  textSize(width < 700 ? 11 : 13); // 設定操作提醒字級
  text("請選擇一個答案，選中的選項會高亮顯示", panelBox.x + panelBox.w / 2, panelBox.y + panelBox.h - 14); // 顯示單選操作提醒
} // 結束題目卡片繪製
function drawRabbitPanel(panelBox) { // 繪製兔子幾何插圖面板
  drawPanel(panelBox.x, panelBox.y, panelBox.w, panelBox.h, 255, 255, 255, 220); // 繪製兔子白色面板
  fill(93, 110, 94); // 設定面板標題顏色
  textSize(width < 700 ? 12 : 15); // 設定面板標題字級
  text(`兔子的照護小教室｜${RABBIT_PROFILES[selectedRabbit].name}`, panelBox.x + panelBox.w / 2, panelBox.y + 19); // 顯示目前選定的兔子名稱
  const rabbitSize = min(panelBox.w * 0.34, panelBox.h * 0.68); // 計算能放入面板的兔子尺寸
  drawRabbit(panelBox.x + panelBox.w / 2, panelBox.y + panelBox.h * 0.58, rabbitSize, currentQuestion, selectedRabbit); // 持續繪製玩家選定的幾何兔子
} // 結束兔子面板繪製
function drawOptions(optionsLayout, questionData) { // 繪製四個單選選項卡片
  for (let i = 0; i < questionData.options.length; i += 1) { // 逐一處理四個選項
    const optionBox = getOptionBox(optionsLayout, i); // 計算目前選項的矩形位置
    const selected = selectedAnswers[currentQuestion] === i; // 判斷目前選項是否被選取
    drawOptionCard(optionBox, questionData.options[i], i, selected); // 繪製選項卡片與高亮狀態
  } // 結束四個選項的迴圈繪製
  fill(91, 112, 95); // 設定選項區提示文字顏色
  textSize(width < 700 ? 11 : 13); // 設定選項區提示字級
  text("單選題｜點擊或觸控選項即可更換答案", optionsLayout.x + optionsLayout.w / 2, optionsLayout.y - 15); // 顯示選項操作提示
} // 結束選項區繪製
function getOptionBox(optionsLayout, index) { // 計算指定選項的響應式矩形
  if (optionsLayout.columns === 2) { // 判斷是否採用手機雙欄版面
    const column = index % 2; // 計算目前選項所在欄位
    const row = floor(index / 2); // 計算目前選項所在列位
    return { x: optionsLayout.x + column * (optionsLayout.w + optionsLayout.gap), y: optionsLayout.y + row * (optionsLayout.h + optionsLayout.gap), w: optionsLayout.w, h: optionsLayout.h }; // 回傳手機雙欄選項矩形
  } // 結束手機雙欄判斷
  return { x: optionsLayout.x, y: optionsLayout.y + index * (optionsLayout.h + optionsLayout.gap), w: optionsLayout.w, h: optionsLayout.h }; // 回傳桌面單欄選項矩形
} // 結束選項矩形計算
function drawOptionCard(optionBox, optionText, index, selected) { // 繪製單一選項卡片
  const over = pointInRect(mouseX, mouseY, optionBox); // 判斷滑鼠是否停留在選項上
  const colors = [[241, 224, 214], [224, 237, 226], [224, 234, 246], [241, 232, 198]]; // 建立四種柔和選項底色
  const cardColor = colors[index % colors.length]; // 取得目前選項的底色
  stroke(selected ? 207 : over ? 224 : 235, selected ? 128 : 190, selected ? 91 : 190); // 依照選取狀態設定外框顏色
  strokeWeight(selected ? 3 : 1); // 讓已選答案擁有明顯外框
  fill(selected ? 255 : cardColor[0], selected ? 244 : cardColor[1], selected ? 218 : cardColor[2], over || selected ? 255 : 225); // 依照狀態設定選項底色
  rect(optionBox.x, optionBox.y, optionBox.w, optionBox.h, 13); // 繪製圓角選項卡片
  noStroke(); // 關閉後續文字外框
  fill(72, 79, 71); // 設定選項文字顏色
  textAlign(LEFT, CENTER); // 將選項文字設定為左側對齊
  textStyle(selected ? BOLD : NORMAL); // 將已選答案設定為粗體
  const label = `(${OPTION_LABELS[index]})`; // 建立 A 到 D 的選項標籤
  textSize(width < 700 ? 12 : 16); // 設定選項文字大小
  text(label, optionBox.x + 11, optionBox.y + optionBox.h / 2); // 繪製選項英文字母標籤
  const contentX = optionBox.x + (width < 700 ? 37 : 48); // 計算選項內容的起始位置
  const contentW = optionBox.w - (width < 700 ? 46 : 60); // 計算選項內容可用寬度
  const lines = wrapText(optionText, contentW, width < 700 ? 11 : 15); // 依照卡片寬度切分選項文字
  drawLinesLeft(lines, contentX, optionBox.y + optionBox.h / 2, width < 700 ? 11 : 15, width < 700 ? 15 : 19); // 繪製自動換行的選項內容
  textStyle(NORMAL); // 恢復一般文字樣式
  textAlign(CENTER, CENTER); // 恢復預設中心對齊
} // 結束單一選項卡片繪製
function drawQuizControls(controlLayout) { // 繪製測驗底部控制按鈕
  const previousBox = { x: controlLayout.x, y: controlLayout.y, w: min(128, controlLayout.w * 0.31), h: controlLayout.h }; // 計算上一題按鈕矩形
  const nextBox = { x: controlLayout.x + controlLayout.w - min(190, controlLayout.w * 0.47), y: controlLayout.y, w: min(190, controlLayout.w * 0.47), h: controlLayout.h }; // 計算下一題或交卷按鈕矩形
  const previousEnabled = currentQuestion > 0; // 判斷上一題按鈕是否可用
  drawButton(previousBox.x, previousBox.y, previousBox.w, previousBox.h, "上一題", previousEnabled); // 繪製上一題按鈕
  const nextLabel = currentQuestion === QUESTIONS.length - 1 ? "交卷看成績" : "下一題"; // 依照題目位置決定右側按鈕文字
  drawButton(nextBox.x, nextBox.y, nextBox.w, nextBox.h, nextLabel, true); // 繪製下一題或交卷按鈕
} // 結束測驗控制按鈕繪製
function drawResultScreen() { // 繪製交卷後的分級結果畫面
  const resultType = getResultType(); // 依照百分比取得健康、待加強或死亡結果
  healthyResult = resultType === "healthy"; // 記錄是否為九十分以上健康結果
  needsCareResult = resultType === "needsCare"; // 記錄是否為五十至八十九分待加強結果
  deceasedResult = resultType === "deceased"; // 記錄是否為低於五十分死亡結果
  if (passed && healthyResult) { // 保留 score > 60 的 passed 基礎條件並只讓健康頁顯示彩帶
    updateAndDrawConfetti(); // 健康結果頁更新並繪製彩帶動畫
  } // 結束健康彩帶顯示判斷
  fill(70, 79, 70); // 設定結果標題顏色
  textStyle(BOLD); // 將結果標題設定為粗體
  textSize(width < 700 ? 27 : 42); // 依照螢幕大小設定結果標題字級
  text("測驗結果揭曉！", width / 2, 30); // 顯示結果頁標題
  textStyle(NORMAL); // 恢復一般文字樣式
  const mobile = width < 700; // 判斷目前是否使用手機版結果排版
  const summary = { x: mobile ? 14 : 30, y: 54, w: width - (mobile ? 28 : 60), h: mobile ? 229 : 190 }; // 設定包含兔子狀態的結果摘要卡片
  drawPanel(summary.x, summary.y, summary.w, summary.h, 255, 255, 255, 238); // 繪製結果摘要面板
  if (mobile) { // 判斷是否使用手機垂直摘要排版
    drawResultRabbit(width / 2, summary.y + 66, 88, selectedRabbit, resultType); // 在手機摘要上方繪製玩家選定兔子的結果狀態
    fill(224, 151, 111); // 設定手機分數文字顏色
    textSize(20); // 設定手機分數文字字級
    text(`答對 ${correctCount}／${QUESTIONS.length} 題　${score}%`, width / 2, summary.y + 132); // 顯示手機答對題數與百分比
    drawResultMessage(width / 2, summary.y + 163, summary.w - 24, resultType, 16); // 顯示手機分級結果訊息
    fill(102, 119, 103); // 設定手機規則提醒顏色
    textSize(10); // 設定手機規則提醒字級
    text("低於 50%（含 41%～49%）皆歸入死亡級距", width / 2, summary.y + 204); // 明確說明未涵蓋區間的歸類規則
  } else { // 處理桌面橫向摘要排版
    drawResultRabbit(summary.x + 112, summary.y + 101, 125, selectedRabbit, resultType); // 在桌面摘要左側繪製玩家選定兔子的結果狀態
    fill(224, 151, 111); // 設定桌面分數文字顏色
    textSize(28); // 設定桌面分數文字字級
    text(`答對 ${correctCount}／${QUESTIONS.length} 題　${score}%`, summary.x + summary.w * 0.63, summary.y + 48); // 顯示桌面答對題數與百分比
    drawResultMessage(summary.x + summary.w * 0.63, summary.y + 88, summary.w * 0.62, resultType, 21); // 顯示桌面分級結果訊息
    fill(102, 119, 103); // 設定桌面規則提醒顏色
    textSize(13); // 設定桌面規則提醒字級
    text("低於 50%（含 41%～49%）皆歸入死亡級距", summary.x + summary.w * 0.63, summary.y + 132); // 明確說明未涵蓋區間的歸類規則
    text("下方可查看每題選擇、正解與解析", summary.x + summary.w * 0.63, summary.y + 158); // 顯示結果解析操作提醒
  } // 結束摘要版面判斷
  drawResultDetails(summary.y + summary.h + 12); // 繪製可捲動的每題結果與解析
  drawResultButtons(); // 繪製固定在結果頁底部的操作按鈕
} // 結束分級結果畫面繪製
function drawResultMessage(centerX, centerY, messageWidth, resultType, size) { // 繪製依照分數級距變化的結果訊息
  const message = resultType === "healthy" ? "健康、開心，照護成功！" : resultType === "needsCare" ? "待加強，兔兔快死了" : "你不適合養兔兔，多做點功課再來"; // 依照級距組合結果文字
  const messageColor = resultType === "healthy" ? [73, 137, 87] : resultType === "needsCare" ? [177, 111, 61] : [142, 78, 84]; // 依照級距設定結果文字顏色
  fill(messageColor[0], messageColor[1], messageColor[2]); // 套用結果訊息顏色
  textStyle(BOLD); // 將結果訊息設定為粗體
  textSize(size); // 套用指定結果訊息字級
  const lines = wrapText(message, messageWidth, size); // 依照可用寬度切分結果訊息
  drawLinesCentered(lines, centerX, centerY, size, size + 5); // 置中繪製一至多行結果訊息
  textStyle(NORMAL); // 恢復一般文字樣式
} // 結束結果訊息繪製

function drawResultDetails(topY) { // 繪製結果頁的每題詳細解析
  const areaTop = topY; // 設定解析區上緣位置
  const footerHeight = width < 700 ? 54 : 62; // 計算底部按鈕列高度
  const areaBottom = height - footerHeight; // 設定解析區下緣位置
  const areaHeight = max(40, areaBottom - areaTop); // 計算解析區可視高度
  const contentHeight = getResultContentHeight(); // 計算所有解析卡片的總高度
  const maxScroll = max(0, contentHeight - areaHeight); // 計算結果內容最大捲動距離
  resultScrollY = constrain(resultScrollY, 0, maxScroll); // 將捲動距離限制在合法範圍
  drawingContext.save(); // 保存目前畫布狀態以便設定裁切區
  drawingContext.beginPath(); // 開始建立解析區裁切路徑
  drawingContext.rect(0, areaTop, width, areaHeight); // 建立只顯示解析區的裁切矩形
  drawingContext.clip(); // 啟用解析區裁切
  let y = areaTop - resultScrollY; // 計算第一張解析卡片的實際繪製位置
  for (let i = 0; i < QUESTIONS.length; i += 1) { // 逐題繪製結果卡片
    const cardHeight = getResultCardHeight(i); // 計算目前結果卡片高度
    drawResultCard(i, y, cardHeight); // 繪製目前題目的選擇、正解與解析
    y += cardHeight + 10; // 移動到下一張結果卡片位置
  } // 結束結果卡片迴圈
  drawingContext.restore(); // 還原畫布裁切狀態
  fill(99, 119, 103, 210); // 設定捲動提示顏色
  textSize(width < 700 ? 10 : 12); // 設定捲動提示字級
  text(maxScroll > 0 ? "上下滑動或使用滑鼠滾輪查看全部解析" : "已顯示全部解析", width / 2, areaBottom - 8); // 顯示結果區操作提示
} // 結束結果解析繪製
function getResultContentHeight() { // 計算結果解析內容總高度
  let total = 0; // 建立結果內容高度累加值
  for (let i = 0; i < QUESTIONS.length; i += 1) { // 逐題累加卡片高度
    total += getResultCardHeight(i) + 10; // 加上卡片高度與卡片間距
  } // 結束卡片高度累加
  return total; // 回傳結果內容總高度
} // 結束結果內容高度計算
function getResultCardHeight(index) { // 計算指定結果卡片的高度
  const contentWidth = width - (width < 700 ? 54 : 84); // 計算結果卡片文字可用寬度
  const explanationLines = wrapText(QUESTIONS[index].explanation, contentWidth, width < 700 ? 12 : 14); // 計算解析文字行數
  const questionLines = wrapText(QUESTIONS[index].question, contentWidth, width < 700 ? 12 : 14); // 計算題目文字行數
  return 77 + questionLines.length * (width < 700 ? 16 : 19) + explanationLines.length * (width < 700 ? 16 : 19); // 回傳足以容納所有文字的卡片高度
} // 結束結果卡片高度計算
function drawResultCard(index, y, cardHeight) { // 繪製指定題目的結果卡片
  const x = width < 700 ? 14 : 30; // 設定結果卡片左側位置
  const w = width - (width < 700 ? 28 : 60); // 設定結果卡片寬度
  drawPanel(x, y, w, cardHeight, 255, 255, 255, 238); // 繪製結果卡片面板
  const questionData = QUESTIONS[index]; // 取得目前結果題目的資料
  const chosenIndex = selectedAnswers[index]; // 取得玩家在本題的選項索引
  const chosenLabel = chosenIndex === null ? "未作答" : `(${OPTION_LABELS[chosenIndex]}) ${questionData.options[chosenIndex]}`; // 組合玩家選擇文字
  const correctIndex = OPTION_LABELS.indexOf(questionData.answer); // 將正解字母轉換成選項索引
  const correctLabel = `(${questionData.answer}) ${questionData.options[correctIndex]}`; // 組合正確答案文字
  const isCorrect = chosenIndex === correctIndex; // 判斷本題是否答對
  const left = x + (width < 700 ? 12 : 18); // 設定結果卡片文字左側位置
  const contentWidth = w - (width < 700 ? 24 : 36); // 設定結果卡片文字可用寬度
  fill(224, 151, 111); // 設定題號與篇章顏色
  textStyle(BOLD); // 將題號設定為粗體
  textSize(width < 700 ? 12 : 15); // 設定題號字級
  text(`${index + 1}. ${questionData.section}`, left, y + 18, contentWidth); // 顯示題號與篇章
  textStyle(NORMAL); // 恢復一般文字樣式
  fill(62, 72, 64); // 設定結果題目顏色
  textSize(width < 700 ? 12 : 14); // 設定結果題目字級
  const questionLines = wrapText(questionData.question, contentWidth, width < 700 ? 12 : 14); // 切分結果題目文字
  drawLinesLeft(questionLines, left, y + 37, width < 700 ? 12 : 14, width < 700 ? 16 : 19); // 繪製結果題目
  const answerY = y + 43 + questionLines.length * (width < 700 ? 16 : 19); // 計算玩家選擇列位置
  fill(isCorrect ? 67 : 166, isCorrect ? 127 : 91, isCorrect ? 81 : 82); // 依照正誤設定玩家選擇顏色
  textSize(width < 700 ? 11 : 13); // 設定玩家選擇字級
  text(`你的選擇：${chosenLabel}　｜　${isCorrect ? "答對" : "未答對"}`, left, answerY, contentWidth); // 顯示玩家選擇與正誤
  fill(75, 103, 80); // 設定正解文字顏色
  text(`正確答案：${correctLabel}`, left, answerY + (width < 700 ? 17 : 20), contentWidth); // 顯示正確答案
  fill(137, 105, 82); // 設定解析標題顏色
  textStyle(BOLD); // 將解析標題設定為粗體
  text(`解析：${questionData.explanation}`, left, answerY + (width < 700 ? 37 : 43), contentWidth); // 顯示每題解析文字
  textStyle(NORMAL); // 恢復一般文字樣式
} // 結束指定結果卡片繪製
function drawResultButtons() { // 繪製結果頁固定底部按鈕
  const mobile = width < 700; // 判斷是否為手機版結果頁
  const margin = mobile ? 14 : 30; // 設定結果頁左右邊界
  const y = height - (mobile ? 48 : 56); // 計算結果按鈕列垂直位置
  const gap = 10; // 設定兩個按鈕之間的間距
  const w = (width - margin * 2 - gap) / 2; // 計算兩個按鈕各自寬度
  drawButton(margin, y, w, mobile ? 40 : 46, "重新挑戰", true); // 繪製重新挑戰按鈕
  drawButton(margin + w + gap, y, w, mobile ? 40 : 46, "回到開始畫面", false); // 繪製回到開始畫面按鈕
} // 結束結果按鈕繪製
function drawRabbit(centerX, centerY, size, stageIndex, profileIndex = 0) { // 使用 p5.js 基本幾何圖形繪製指定外觀的兔子
  const scaleFactor = size / 160; // 將基準兔子尺寸換算為目前尺寸
  const profile = RABBIT_PROFILES[profileIndex % RABBIT_PROFILES.length]; // 取得玩家選定或目前指定的兔子外觀
  const fur = stageIndex >= 8 ? color(220, 218, 207) : color(profile.fur[0], profile.fur[1], profile.fur[2]); // 依照題目階段與兔子外觀設定毛色
  push(); // 保存兔子繪圖狀態
  translate(centerX, centerY); // 將繪圖原點移動到兔子中心
  scale(scaleFactor); // 將兔子縮放到指定尺寸
  noStroke(); // 關閉兔子幾何圖形外框
  fill(profile.innerEar[0], profile.innerEar[1], profile.innerEar[2]); // 設定目前兔子的耳朵內側顏色
  ellipse(-30, -73, profileIndex === 1 ? 31 : 25, 82); // 繪製左耳內側並依外觀改變寬度
  ellipse(30, -73, profileIndex === 1 ? 31 : 25, 82); // 繪製右耳內側並依外觀改變寬度
  fill(fur); // 設定兔子外層毛色
  ellipse(-30, -78, profileIndex === 2 ? 45 : 38, 98); // 繪製左邊長耳朵並讓灰灰兔耳朵更寬
  ellipse(30, -78, profileIndex === 2 ? 45 : 38, 98); // 繪製右邊長耳朵並讓灰灰兔耳朵更寬
  ellipse(0, 34, profileIndex === 1 ? 112 : 105, 112); // 繪製兔子圓身體並依外觀調整寬度
  ellipse(0, -20, profileIndex === 2 ? 112 : 106, 93); // 繪製兔子圓頭並依外觀調整寬度
  fill(238, 211, 211); // 設定臉頰淡粉色
  ellipse(-40, 2, 22, 14); // 繪製左臉頰
  ellipse(40, 2, 22, 14); // 繪製右臉頰
  fill(61, 67, 66); // 設定眼睛與鼻子深色
  ellipse(-20, -28, 12, 16); // 繪製左眼
  ellipse(20, -28, 12, 16); // 繪製右眼
  fill(255); // 設定眼睛亮點白色
  ellipse(-17, -31, 4, 5); // 繪製左眼亮點
  ellipse(23, -31, 4, 5); // 繪製右眼亮點
  fill(profile.accent[0], profile.accent[1], profile.accent[2]); // 使用目前兔子外觀的重點色繪製鼻子
  ellipse(0, -8, 13, 10); // 繪製兔子鼻子
  stroke(100, 83, 80); // 設定嘴巴線條顏色
  strokeWeight(2); // 設定嘴巴線條粗細
  line(0, -3, 0, 7); // 繪製鼻子到嘴巴的中線
  noFill(); // 讓微笑弧線只顯示外框
  arc(-7, 5, 15, 12, 0, HALF_PI); // 繪製左側微笑弧線
  arc(7, 5, 15, 12, HALF_PI, PI); // 繪製右側微笑弧線
  noStroke(); // 關閉身體細節外框
  fill(fur); // 設定腳掌毛色
  ellipse(-37, 76, 45, 26); // 繪製左腳掌
  ellipse(37, 76, 45, 26); // 繪製右腳掌
  fill(profile.innerEar[0], profile.innerEar[1], profile.innerEar[2]); // 使用兔子外觀的粉色系繪製腳掌內側
  ellipse(-37, 78, 21, 11); // 繪製左腳掌肉墊
  ellipse(37, 78, 21, 11); // 繪製右腳掌肉墊
  if (profileIndex === 1) { // 判斷是否為焦糖兔並繪製蝴蝶結裝飾
    fill(190, 85, 92); // 設定焦糖兔蝴蝶結顏色
    ellipse(-52, 38, 23, 18); // 繪製蝴蝶結左半部
    ellipse(-34, 38, 23, 18); // 繪製蝴蝶結右半部
    ellipse(-43, 38, 10, 10); // 繪製蝴蝶結中心
  } else if (profileIndex === 2) { // 判斷是否為灰灰兔並繪製星星胸針
    fill(246, 201, 86); // 設定灰灰兔星星胸針顏色
    beginShape(); // 開始繪製胸針星形
    for (let i = 0; i < 10; i += 1) { // 逐點建立五角星外輪廓
      const angle = -HALF_PI + i * PI / 5; // 計算目前星形頂點角度
      const radius = i % 2 === 0 ? 13 : 6; // 交替設定星形外半徑與內半徑
      vertex(0 - 48 + cos(angle) * radius, 39 + sin(angle) * radius); // 繪製目前星形頂點
    } // 結束星形頂點迴圈
    endShape(CLOSE); // 完成星形胸針
  } else if (stageIndex % 3 === 0) { // 判斷是否繪製乾草小物件
    fill(180, 149, 91); // 設定乾草顏色
    rect(54, 37, 30, 8, 3); // 繪製乾草束
    rect(59, 27, 5, 23, 2); // 繪製第一根乾草
    rect(69, 25, 5, 25, 2); // 繪製第二根乾草
  } else if (stageIndex % 3 === 1) { // 判斷是否繪製胡蘿蔔小物件
    fill(238, 143, 89); // 設定胡蘿蔔顏色
    ellipse(67, 45, 21, 42); // 繪製小胡蘿蔔
    fill(99, 157, 102); // 設定胡蘿蔔葉子顏色
    ellipse(59, 22, 10, 25); // 繪製第一片胡蘿蔔葉
    ellipse(70, 22, 10, 25); // 繪製第二片胡蘿蔔葉
  } else { // 處理其他題目階段的小物件
    fill(167, 204, 229); // 設定水碗水色
    ellipse(68, 57, 34, 12); // 繪製小水碗
    fill(207, 181, 143); // 設定水碗外框顏色
    arc(68, 55, 38, 20, 0, PI); // 繪製小水碗邊緣
  } // 結束兔子題目小物件判斷
  pop(); // 還原兔子繪圖狀態
} // 結束兔子幾何圖形繪製
function getResultType() { // 依照百分比回傳明確的結果級距
  if (score >= 90) { // 判斷九十分至百分之百的健康級距
    return "healthy"; // 回傳健康結果類型
  } // 結束健康級距判斷
  if (score >= 50) { // 判斷五十分至低於九十分的待加強級距
    return "needsCare"; // 回傳待加強結果類型
  } // 結束待加強級距判斷
  return "deceased"; // 低於五十分包含四十一至四十九分，明確歸入死亡級距
} // 結束結果級距判斷
function drawResultRabbit(centerX, centerY, size, profileIndex, resultType) { // 依照成績級距繪製玩家選定兔子的結果狀態
  if (resultType === "healthy") { // 判斷是否為健康結果
    drawRabbit(centerX, centerY, size, 0, profileIndex); // 繪製健康、開心的玩家選定兔子
    fill(222, 166, 74); // 設定健康結果愛心顏色
    textSize(size * 0.22); // 設定健康結果愛心字級
    text("♥", centerX + size * 0.38, centerY - size * 0.28); // 顯示代表開心與照護成功的愛心
    return; // 完成健康兔子繪製
  } // 結束健康結果判斷
  if (resultType === "needsCare") { // 判斷是否為五十至八十九分的待加強結果
    drawRabbit(centerX, centerY, size, 1, profileIndex); // 繪製玩家選定的待加強兔子
    push(); // 保存頭暈裝飾繪圖狀態
    noFill(); // 讓螺旋線只顯示外框
    stroke(88, 105, 138); // 設定頭暈螺旋線顏色
    strokeWeight(max(2, size * 0.025)); // 依照兔子尺寸設定螺旋線粗細
    beginShape(); // 開始繪製頭暈螺旋線
    for (let i = 0; i < 28; i += 1) { // 逐點建立頭暈螺旋線
      const angle = i * 0.55; // 計算螺旋目前角度
      const radius = 3 + i * 1.05; // 計算螺旋目前半徑
      vertex(centerX + size * 0.38 + cos(angle) * radius, centerY - size * 0.42 + sin(angle) * radius); // 繪製螺旋線目前位置
    } // 結束頭暈螺旋線頂點迴圈
    endShape(); // 完成頭暈螺旋線
    fill(235, 187, 73); // 設定旋轉星星顏色
    noStroke(); // 關閉星星外框
    textSize(size * 0.22); // 設定旋轉星星字級
    text("★", centerX - size * 0.40, centerY - size * 0.39); // 顯示第一顆旋轉星星
    text("★", centerX + size * 0.22, centerY - size * 0.52); // 顯示第二顆旋轉星星
    pop(); // 還原頭暈裝飾繪圖狀態
    return; // 完成待加強兔子繪製
  } // 結束待加強結果判斷
  push(); // 保存死亡狀態兔子繪圖狀態
  translate(centerX, centerY + size * 0.12); // 將死亡兔子移到結果面板中央偏下
  rotate(-PI / 2); // 將兔子旋轉成側躺狀態
  drawRabbit(0, 0, size, 8, profileIndex); // 繪製玩家選定且灰暗化階段的兔子
  pop(); // 還原死亡狀態兔子繪圖狀態
  stroke(75, 75, 84); // 設定 X 眼睛外框顏色
  strokeWeight(max(2, size * 0.035)); // 依照兔子尺寸設定 X 眼睛粗細
  line(centerX - size * 0.14, centerY - size * 0.09, centerX - size * 0.04, centerY + size * 0.01); // 繪製左眼 X 的第一條線
  line(centerX - size * 0.04, centerY - size * 0.09, centerX - size * 0.14, centerY + size * 0.01); // 繪製左眼 X 的第二條線
  line(centerX + size * 0.04, centerY - size * 0.09, centerX + size * 0.14, centerY + size * 0.01); // 繪製右眼 X 的第一條線
  line(centerX + size * 0.14, centerY - size * 0.09, centerX + size * 0.04, centerY + size * 0.01); // 繪製右眼 X 的第二條線
  noStroke(); // 關閉死亡兔子後續文字外框
  fill(82, 82, 92); // 設定 RIP 標示顏色
  textStyle(BOLD); // 將 RIP 標示設定為粗體
  textSize(max(13, size * 0.14)); // 設定 RIP 標示字級
  text("RIP", centerX, centerY + size * 0.60); // 顯示死亡狀態 RIP 標示
  textStyle(NORMAL); // 恢復一般文字樣式
} // 結束結果兔子狀態繪製

function drawPanel(x, y, w, h, r, g, b, alphaValue) { // 繪製帶有柔和陰影的圓角面板
  noStroke(); // 關閉面板外框線
  fill(190, 173, 153, 45); // 設定面板陰影顏色
  rect(x + 4, y + 5, w, h, 16); // 繪製面板偏移陰影
  fill(r, g, b, alphaValue); // 設定面板主體顏色
  rect(x, y, w, h, 16); // 繪製圓角面板主體
} // 結束面板繪製
function drawButton(x, y, w, h, label, primary) { // 繪製可重複使用的按鈕
  const over = pointInRect(mouseX, mouseY, { x: x, y: y, w: w, h: h }); // 判斷滑鼠是否停留在按鈕上
  const enabled = primary || label === "重新挑戰" || label === "回到開始畫面"; // 判斷按鈕是否為可操作按鈕
  noStroke(); // 關閉按鈕外框線
  fill(!enabled ? 210 : primary ? 111 : 225, !enabled ? 210 : primary ? 151 : 222, !enabled ? 210 : primary ? 100 : 201, over && enabled ? 255 : 230); // 依照按鈕狀態設定底色
  rect(x, y, w, h, 14); // 繪製圓角按鈕
  fill(!enabled ? 145 : primary ? 255 : 88, !enabled ? 145 : primary ? 255 : 98, !enabled ? 145 : primary ? 255 : 88); // 依照按鈕狀態設定文字顏色
  textSize(width < 700 ? 13 : 17); // 依照螢幕大小設定按鈕字級
  textStyle(BOLD); // 將按鈕文字設定為粗體
  text(label, x + w / 2, y + h / 2); // 顯示按鈕文字
  textStyle(NORMAL); // 恢復一般文字樣式
} // 結束按鈕繪製
function wrapText(message, maxWidth, size) { // 將中文文字依照寬度切成多行
  textSize(size); // 設定換行計算使用的字級
  const characters = String(message).split(""); // 將文字拆成單一字元陣列
  const lines = []; // 建立最後要回傳的文字行陣列
  let line = ""; // 建立目前累積的文字行
  for (let i = 0; i < characters.length; i += 1) { // 逐字檢查文字寬度
    const testLine = line + characters[i]; // 暫時加入下一個字元
    if (textWidth(testLine) > maxWidth && line.length > 0) { // 判斷加入字元後是否超過可用寬度
      lines.push(line); // 儲存已完成的一行文字
      line = characters[i]; // 以目前字元開始新的一行
    } else { // 處理尚未超過可用寬度的狀態
      line = testLine; // 繼續累積目前文字行
    } // 結束文字寬度判斷
  } // 結束逐字切分迴圈
  if (line.length > 0) { // 判斷最後一行是否有內容
    lines.push(line); // 儲存最後一行文字
  } // 結束最後一行判斷
  return lines.length > 0 ? lines : [""]; // 回傳切分後的文字行
} // 結束中文自動換行函式
function drawLinesCentered(lines, centerX, centerY, size, lineHeight) { // 以中心對齊方式繪製多行文字
  textSize(size); // 設定繪製文字的字級
  textAlign(CENTER, CENTER); // 設定文字水平與垂直置中
  const startY = centerY - (lines.length - 1) * lineHeight / 2; // 計算多行文字的起始位置
  for (let i = 0; i < lines.length; i += 1) { // 逐行繪製文字
    text(lines[i], centerX, startY + i * lineHeight); // 繪製目前文字行
  } // 結束多行文字繪製
} // 結束置中多行文字繪製
function drawLinesLeft(lines, x, centerY, size, lineHeight) { // 以左側對齊方式繪製多行文字
  textSize(size); // 設定繪製文字的字級
  textAlign(LEFT, CENTER); // 設定文字左側與垂直置中
  const startY = centerY - (lines.length - 1) * lineHeight / 2; // 計算多行文字的起始位置
  for (let i = 0; i < lines.length; i += 1) { // 逐行繪製文字
    text(lines[i], x, startY + i * lineHeight); // 繪製目前文字行
  } // 結束多行文字繪製
  textAlign(CENTER, CENTER); // 恢復預設文字對齊方式
} // 結束左側多行文字繪製
function drawNotice() { // 繪製短暫的操作提示
  if (millis() < noticeUntil) { // 判斷提示是否仍在有效時間內
    fill(86, 105, 89, 235); // 設定提示膠囊底色
    rect(width / 2 - min(width * 0.44, 260), height - 29, min(width * 0.88, 520), 27, 13); // 繪製提示膠囊背景
    fill(255); // 設定提示文字顏色
    textSize(width < 700 ? 10 : 13); // 設定提示文字大小
    text(noticeText, width / 2, height - 29); // 顯示提示文字
  } // 結束提示顯示判斷
} // 結束操作提示繪製
function showNotice(message) { // 設定一段短暫操作提示
  noticeText = message; // 更新提示文字內容
  noticeUntil = millis() + 2500; // 設定提示約二點五秒後消失
} // 結束提示設定
function pointInRect(px, py, targetBox) { // 判斷一個點是否位於矩形內
  return px >= targetBox.x && px <= targetBox.x + targetBox.w && py >= targetBox.y && py <= targetBox.y + targetBox.h; // 回傳點是否在矩形範圍內
} // 結束點與矩形碰撞判斷
function startQuiz() { // 開始或重新開始一輪測驗
  gameState = QUIZ_STATE; // 切換到測驗畫面
  currentQuestion = 0; // 從第一題開始作答
  selectedAnswers = Array(QUESTIONS.length).fill(null); // 清空所有已選答案
  correctCount = 0; // 清除上一輪答對題數
  score = 0; // 清除上一輪百分比成績
  passed = false; // 清除上一輪通過狀態
  scoreSubmitted = false; // 記錄尚未交卷
  resultScrollY = 0; // 清除上一輪結果捲動位置
  showNotice(`請照護${RABBIT_PROFILES[selectedRabbit].name}，選擇答案後按下一題。`); // 顯示目前選定兔子的開始作答提示
} // 結束開始測驗
function submitQuiz() { // 在使用者按下交卷後計算成績
  correctCount = 0; // 將答對題數歸零
  for (let i = 0; i < QUESTIONS.length; i += 1) { // 逐題檢查玩家的選擇
    const correctIndex = OPTION_LABELS.indexOf(QUESTIONS[i].answer); // 將題庫正解字母轉換為索引
    if (selectedAnswers[i] === correctIndex) { // 判斷玩家答案是否等於正確答案
      correctCount += 1; // 答對時增加答對題數
    } // 結束單題正確判斷
  } // 結束逐題計分迴圈
  score = round(correctCount / QUESTIONS.length * 100); // 將答對比例換算為整數百分比
  passed = score > 60; // 保留成績嚴格高於百分之六十才算通過的基礎條件
  healthyResult = score >= 90; // 九十分至百分之百歸入健康級距
  needsCareResult = score >= 50 && score < 90; // 五十分至低於九十分歸入待加強級距
  deceasedResult = score < 50; // 零至四十九分包含四十一至四十九分，明確歸入死亡級距
  scoreSubmitted = true; // 記錄已經交卷允許顯示結果
  resultScrollY = 0; // 將結果解析捲動位置重設到頂端
  gameState = RESULT_STATE; // 切換到結果畫面
  if (passed && healthyResult) { // 仍以 passed 且健康結果雙重條件啟動彩帶動畫
    initializeConfetti(); // 通過時重新建立彩帶資料
  } // 結束彩帶啟動判斷
} // 結束交卷計分
function handleQuizPress() { // 處理測驗頁的滑鼠或觸控按下事件
  const layout = getQuizLayout(); // 取得目前測驗版面
  for (let i = 0; i < QUESTIONS[currentQuestion].options.length; i += 1) { // 逐一檢查四個選項
    const optionBox = getOptionBox(layout.options, i); // 取得目前選項矩形
    if (pointInRect(mouseX, mouseY, optionBox)) { // 判斷按下位置是否位於選項內
      selectedAnswers[currentQuestion] = i; // 將目前題目的答案設定為被點選的選項
      showNotice(`已選擇（${OPTION_LABELS[i]}），可再點擊其他選項更換。`); // 顯示選取提示
      return; // 選取完成後結束本次處理
    } // 結束目前選項碰撞判斷
  } // 結束選項檢查迴圈
  const previousBox = { x: layout.controls.x, y: layout.controls.y, w: min(128, layout.controls.w * 0.31), h: layout.controls.h }; // 建立上一題按鈕矩形
  const nextBox = { x: layout.controls.x + layout.controls.w - min(190, layout.controls.w * 0.47), y: layout.controls.y, w: min(190, layout.controls.w * 0.47), h: layout.controls.h }; // 建立右側控制按鈕矩形
  if (pointInRect(mouseX, mouseY, previousBox)) { // 判斷是否按下上一題按鈕
    if (currentQuestion > 0) { // 判斷目前是否不是第一題
      currentQuestion -= 1; // 回到上一題
      showNotice(`已回到第 ${currentQuestion + 1} 題，可檢查或更換答案。`); // 顯示返回提示
    } else { // 處理第一題按下上一題的狀況
      showNotice("這已經是第一題囉！"); // 顯示不可再往前提示
    } // 結束上一題功能判斷
    return; // 結束控制按鈕處理
  } // 結束上一題按鈕判斷
  if (pointInRect(mouseX, mouseY, nextBox)) { // 判斷是否按下下一題或交卷按鈕
    if (currentQuestion < QUESTIONS.length - 1) { // 判斷是否還有下一題
      currentQuestion += 1; // 前往下一題
      showNotice(`現在是第 ${currentQuestion + 1} 題，請選擇一個答案。`); // 顯示前往下一題提示
    } else { // 處理最後一題的交卷按鈕
      submitQuiz(); // 只有按下交卷後才計算並顯示成績
    } // 結束右側控制按鈕功能判斷
  } // 結束右側控制按鈕判斷
} // 結束測驗頁按下事件處理
function mousePressed() { // 處理 p5.js 滑鼠按下或觸控按下事件
  if (gameState === START_STATE) { // 判斷目前是否為開始畫面
    const layout = getStartLayout(); // 取得開局兔子選擇版面
    for (let i = 0; i < layout.cards.length; i += 1) { // 逐一檢查三張兔子選擇卡片
      if (pointInRect(mouseX, mouseY, layout.cards[i])) { // 判斷是否點擊目前兔子卡片
        selectedRabbit = i; // 儲存玩家選定的兔子索引
        noticeText = `已選擇${RABBIT_PROFILES[i].name}，按下開始照護測驗吧！`; // 設定選擇成功提示文字
        noticeUntil = millis() + 2500; // 設定選擇成功提示的顯示時間
        return false; // 完成兔子選擇後結束本次按下事件
      } // 結束目前兔子卡片碰撞判斷
    } // 結束三張兔子卡片檢查迴圈
    if (pointInRect(mouseX, mouseY, layout.button)) { // 判斷是否按下開始照護測驗按鈕
      if (selectedRabbit === null) { // 判斷玩家是否尚未選擇兔子
        showNotice("請先選擇一隻兔子，才能開始照護測驗！"); // 顯示未選擇兔子的提示
      } else { // 處理已經選擇兔子的狀況
        startQuiz(); // 開始一輪新的測驗
      } // 結束開始測驗條件判斷
    } // 結束開始測驗按鈕判斷
  } else if (gameState === QUIZ_STATE) { // 判斷目前是否為測驗畫面
    handleQuizPress(); // 交由測驗互動函式處理按下事件
  } else if (gameState === RESULT_STATE) { // 判斷目前是否為結果畫面
    const mobile = width < 700; // 判斷目前是否使用手機版結果排版
    const margin = mobile ? 14 : 30; // 計算結果按鈕左右邊界
    const buttonY = height - (mobile ? 48 : 56); // 計算結果按鈕垂直位置
    const gap = 10; // 設定兩個結果按鈕間距
    const buttonW = (width - margin * 2 - gap) / 2; // 計算結果按鈕寬度
    if (pointInRect(mouseX, mouseY, { x: margin, y: buttonY, w: buttonW, h: mobile ? 40 : 46 })) { // 判斷是否按下重新挑戰
      startQuiz(); // 重新開始測驗
    } else if (pointInRect(mouseX, mouseY, { x: margin + buttonW + gap, y: buttonY, w: buttonW, h: mobile ? 40 : 46 })) { // 判斷是否按下回到開始畫面
      gameState = START_STATE; // 回到開始畫面
      selectedRabbit = null; // 回到開局時清除選擇並要求重新挑選兔子
      scoreSubmitted = false; // 重設結果顯示控制
    } else { // 處理結果區其他位置的觸控捲動起點
      resultTouchY = mouseY; // 記錄結果頁觸控起始位置
      resultDragging = true; // 開始記錄結果頁拖曳捲動
    } // 結束結果頁按鈕與捲動判斷
  } // 結束目前狀態判斷
  return false; // 阻止瀏覽器處理畫布的預設觸控行為
} // 結束滑鼠按下事件
function mouseDragged() { // 處理滑鼠或觸控拖曳事件
  if (gameState === RESULT_STATE && resultDragging) { // 判斷是否正在結果頁捲動
    const delta = resultTouchY - mouseY; // 計算本次垂直拖曳距離
    resultScrollY += delta; // 將拖曳距離累加到結果捲動位置
    resultTouchY = mouseY; // 更新下一次拖曳的起始位置
  } // 結束結果頁捲動判斷
  return false; // 阻止瀏覽器因拖曳而捲動頁面
} // 結束滑鼠拖曳事件
function mouseReleased() { // 處理滑鼠或觸控放開事件
  resultDragging = false; // 結束結果頁拖曳狀態
  return false; // 阻止瀏覽器產生預設放開行為
} // 結束滑鼠放開事件
function touchStarted() { // 額外處理觸控裝置開始觸控事件
  return false; // 阻止瀏覽器對畫布執行預設觸控行為
} // 結束觸控開始事件
function touchMoved() { // 額外處理觸控裝置移動事件
  return false; // 阻止瀏覽器捲動畫面並保留遊戲觸控操作
} // 結束觸控移動事件
function mouseWheel(event) { // 處理結果頁的滑鼠滾輪事件
  if (gameState === RESULT_STATE) { // 判斷目前是否位於結果頁
    resultScrollY += event.delta; // 依照滾輪方向移動解析內容
    return false; // 阻止瀏覽器整頁捲動
  } // 結束結果頁滾輪判斷
} // 結束滑鼠滾輪事件
function windowResized() { // 處理瀏覽器視窗尺寸變更事件
  resizeCanvas(windowWidth, windowHeight); // 讓畫布重新符合瀏覽器視窗大小
  resultScrollY = 0; // 尺寸變更後將結果解析回到頂端
} // 結束視窗尺寸變更
function initializeConfetti() { // 建立彩帶動畫的初始資料
  confetti = []; // 清空既有彩帶陣列
  for (let i = 0; i < 90; i += 1) { // 建立九十個彩帶粒子
    confetti.push({ x: random(width), y: random(-height, 0), size: random(5, 12), speed: random(1.5, 4), drift: random(-1.2, 1.2), rotation: random(TWO_PI), spin: random(-0.08, 0.08), color: color(random(90, 255), random(90, 220), random(90, 210)) }); // 儲存每個彩帶的隨機資料
  } // 結束彩帶建立迴圈
} // 結束彩帶初始化
function updateAndDrawConfetti() { // 更新並繪製通過後的彩帶動畫
  for (let i = 0; i < confetti.length; i += 1) { // 逐一處理彩帶粒子
    const piece = confetti[i]; // 取得目前彩帶資料
    piece.y += piece.speed; // 更新彩帶垂直位置
    piece.x += piece.drift; // 更新彩帶水平飄移位置
    piece.rotation += piece.spin; // 更新彩帶旋轉角度
    if (piece.y > height + 20) { // 判斷彩帶是否已落出畫布
      piece.y = random(-80, -10); // 將彩帶重新放回畫布上方
      piece.x = random(width); // 重新隨機設定彩帶水平位置
    } // 結束彩帶重置判斷
    push(); // 保存目前彩帶繪圖狀態
    translate(piece.x, piece.y); // 將繪圖原點移動到彩帶位置
    rotate(piece.rotation); // 旋轉目前彩帶
    noStroke(); // 關閉彩帶外框
    fill(piece.color); // 使用彩帶自身顏色
    rect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55, 2); // 繪製小彩帶矩形
    pop(); // 還原彩帶繪圖狀態
  } // 結束彩帶繪製迴圈
} // 結束彩帶動畫更新