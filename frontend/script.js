document.addEventListener("DOMContentLoaded", async function () {
  // 辞書データを取得するためのバックエンド API を呼び出す
  const dictionary = await fetch('http://localhost:3000/api/dictionary');
  const dictionaryData = await dictionary.json();

  // バックエンド API から長文データを取得
  const textResponse = await fetch('http://localhost:3000/api/text?id=15');
  const textData = await textResponse.json();
  const text = textData.text;
  const keywords = textData.keywords; // 重要単語のリスト

  const words = text.split(/(\s+|\b)/); // 単語ごとに分割
  const textContainer = document.getElementById('text-container');

  words.forEach((w) => {
    const plainWord = w.replace(/[.,]/g, "").toLowerCase(); // 記号を除去して小文字化
    const span = document.createElement('span');

    // 辞書データに単語が含まれている重要単語をハイライト
    if (dictionaryData[plainWord] && keywords.includes(plainWord)) {
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
          definition.textContent = ` (${dictionaryData[plainWord]})`;
          span.appendChild(definition);
          console.log(`意味: ${dictionaryData[plainWord]}`);
        }
      });
    } else {
      span.textContent = w;
    }
    textContainer.appendChild(span);
  });

  // ② バックエンド API からクイズデータを取得し、クイズエリアに出題する
  fetch('http://localhost:3000/api/quiz')
    .then(response => response.json())
    .then(quizQuestions => {
      const quizContainer = document.getElementById('quiz-container');

      quizQuestions.forEach((q, i) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('quiz-question');

        // 問題文表示
        const questionText = document.createElement('p');
        questionText.textContent = `${i + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        // 選択肢リストの生成
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('quiz-options');
        q.options.forEach((option, idx) => {
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

        // 各項目ごとの採点ボタンと結果表示エリア
        const gradeBtn = document.createElement('button');
        gradeBtn.textContent = "採点する";
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        gradeBtn.addEventListener('click', () => {
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
          } else if (userAnswer === q.correctIndex) {
            resultDiv.textContent = "正解！";
          } else {
            resultDiv.textContent = "不正解。";
          }
        });

        questionDiv.appendChild(gradeBtn);
        questionDiv.appendChild(resultDiv);
        quizContainer.appendChild(questionDiv);
      });
    })
    .catch(error => {
      console.error("クイズデータの取得に失敗:", error);
    });

  // ハイライトのオン/オフ切り替え
  const toggleHighlightButton = document.getElementById("toggle-highlight");
  let highlightEnabled = true;

  toggleHighlightButton.addEventListener("click", () => {
    highlightEnabled = !highlightEnabled;
    const highlightedWords = document.querySelectorAll(".highlight-important");
    highlightedWords.forEach((word) => {
      word.style.backgroundColor = highlightEnabled ? "yellow" : "transparent";
    });
    toggleHighlightButton.textContent = highlightEnabled
      ? "ハイライトをオフにする"
      : "ハイライトをオンにする";
  });
});
