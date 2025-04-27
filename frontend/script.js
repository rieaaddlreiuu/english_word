document.addEventListener("DOMContentLoaded", async function () {
  // 辞書データを取得するためのバックエンド API を呼び出す
  const dictionary = await fetch('http://localhost:3000/api/dictionary');
  const dictionaryData = await dictionary.json();
  // 読み込む長文のidをurlから取得
  const urlParams = new URLSearchParams(window.location.search); const textId = urlParams.get('id');

  // バックエンド API から長文データを取得
  const textResponse = await fetch(`http://localhost:3000/api/text?id=${textId}`);
  const textData = await textResponse.json();
  const text = textData.text;
  const keywords = textData.keywords; // 重要単語のリスト

  const words = text.split(/(\s+|\b)/); // 単語ごとに分割

  // まとめて原形化を取得
  const lemmaResponse = await fetch('http://localhost:3000/api/lemma/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words: words.map(w => w.replace(/[.,]/g, "").toLowerCase()) })
  });
  const lemmaData = await lemmaResponse.json();
  const lemmaMap = lemmaData.lemmaMap;

  const textContainer = document.getElementById('text-container');
  textContainer.innerHTML = text;

  const sentences = textContainer.getElementsByClassName('sentence');

  Array.from(sentences).forEach((sentence) => {
    const wordsInSentence = sentence.textContent.split(/(\s+|\b)/);
    sentence.innerHTML = ''; // 既存の内容をクリア
    // 重要単語をハイライト
    wordsInSentence.forEach((w) => {
      const span = document.createElement('span');
      const plainWord = w.replace(/[.,]/g, "").toLowerCase();
      const lemma = lemmaMap[plainWord] || plainWord;

      // 辞書データに含まれている単語をハイライト
      if (dictionaryData[lemma]) {
        span.classList.add('highlight-important'); // 重要単語用のクラス
        span.textContent = w;

        // クリックイベントを追加して意味を表示
        span.addEventListener('click', () => {
          const existingDefinition = span.querySelector('.definition');
          if (existingDefinition) {
            // 既に意味が表示されている場合は削除
            existingDefinition.remove();
          } else {
            // 新しく意味を表示
            const definition = document.createElement('span');
            definition.classList.add('definition');
            definition.textContent = ` (${dictionaryData[lemma]})`;
            span.appendChild(definition);
            console.log(`意味: ${dictionaryData[lemma]}`);
          }
        });
      } else {
        span.textContent = w;
      }
      sentence.appendChild(span);
    });
  });

  // ② バックエンド API からクイズデータを取得し、クイズエリアに出題する
  const quizResponse = await fetch(`http://localhost:3000/api/quiz?id=${textId}`);
  const quizQuestions = await quizResponse.json();
  const quizContainer = document.getElementById('quiz-container');

  quizQuestions.forEach((q, i) => {
    if (q == null) return;


    const questionDiv = document.createElement('div');
    questionDiv.classList.add('quiz-question');
    // 問題文表示
    const questionText = document.createElement('p');
    questionText.textContent = `${i + 1}. ${q.question}`;
    questionDiv.appendChild(questionText);

    // 選択肢リストの生成
    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('quiz-options');
    Array.prototype.forEach.call(q.options, (option, idx) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `question-${i}`;
      radio.value = idx;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      optionsDiv.appendChild(label);
      optionsDiv.appendChild(document.createElement('br'));
    });
    questionDiv.appendChild(optionsDiv);

    // 各設問の結果表示用エリアだけを用意
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');
    questionDiv.appendChild(resultDiv);

    quizContainer.appendChild(questionDiv);
  });

  // まとめて採点するボタンを追加
  const gradeAllBtn = document.createElement('button');
  gradeAllBtn.textContent = "まとめて採点する";
  gradeAllBtn.classList.add('btn', 'btn-primary', 'mt-3');
  quizContainer.appendChild(gradeAllBtn);

  gradeAllBtn.addEventListener('click', () => {
    quizQuestions.forEach((q, i) => {
      if(q == null) return;

      
      const resultDiv = quizContainer.children[i].querySelector('.result');
      const radios = document.getElementsByName(`question-${i}`);
      let userAnswer = null;
      for (let r of radios) {
        if (r.checked) {
          userAnswer = parseInt(r.value, 10);
          break;
        }
      }
      if (userAnswer === null) {
        resultDiv.textContent = "回答を選択してください。";
        resultDiv.style.color = 'orange';
      } else if (userAnswer === q.correctIndex) {
        resultDiv.textContent = "正解！";
        resultDiv.style.color = 'green';
      } else {
        resultDiv.textContent = "不正解。";
        resultDiv.style.color = 'red';
      }
    });
  });

  //quizContainer.appendChild(gradeAllBtn);

  // ハイライトのオン/オフ切り替え
  const toggleHighlightButton = document.getElementById("toggle-highlight");
  let highlightEnabled = false; // デフォルトでオフ

  const highlightedWords = document.querySelectorAll(".highlight-important");
  highlightedWords.forEach((word) => {
    word.style.backgroundColor = "transparent"; // 初期状態でハイライトをオフ
  });

  toggleHighlightButton.addEventListener("click", () => {
    highlightEnabled = !highlightEnabled;
    highlightedWords.forEach((word) => {
      word.style.backgroundColor = highlightEnabled ? "yellow" : "transparent";
    });
    toggleHighlightButton.textContent = highlightEnabled
      ? "ハイライトをオフにする"
      : "ハイライトをオンにする";
  });
});
