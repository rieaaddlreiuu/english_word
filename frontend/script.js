document.addEventListener("DOMContentLoaded", function() {
    // ① バックエンド API から単語（辞書）データを取得し、長文のハイライト部分を生成する
    fetch('http://localhost:3000/api/dictionary')
      .then(response => response.json())
      .then(dictionary => {
        // 長文サンプル（例：固定テキスト）
        const text = `Peter felt quite ecstatic as he strolled through the bustling city,
        noticing the myriad of cultural nuances.`;
  
        // テキストを単語境界で分割（簡易実装）
        const words = text.split(/(\s+|\b)/);
        const textContainer = document.getElementById('text-container');
  
        words.forEach((w) => {
          // 句読点除去・小文字化
          const plainWord = w.replace(/[.,]/g, "").toLowerCase();
          const span = document.createElement('span');
  
          // 辞書データに登録されていればハイライト＆クリックで定義表示
          if (dictionary[plainWord]) {
            span.classList.add('highlight');
            span.textContent = w;
  
            const definitionSpan = document.createElement('span');
            definitionSpan.classList.add('definition');
            definitionSpan.textContent = `(${dictionary[plainWord]})`;
  
            span.addEventListener('click', () => {
              definitionSpan.style.display =
                definitionSpan.style.display === 'inline' ? 'none' : 'inline';
            });
            span.appendChild(definitionSpan);
          } else {
            span.textContent = w;
          }
          textContainer.appendChild(span);
        });
      })
      .catch(error => {
        console.error("辞書データの取得に失敗:", error);
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
  });
  