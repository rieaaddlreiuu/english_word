const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS 許可（必要に応じて設定を変更してください）
app.use(cors());
app.use(bodyParser.json());

/*
const quizQuestions = [
  {
    question: 'What does "ecstatic" mean?',
    options: [
      '非常に興奮している、熱狂的な', // 正解
      '疲れ切った',
      '控えめな',
      '機嫌が悪い'
    ],
    correctIndex: 0
  },
  {
    question: 'What does "strolled" mean?',
    options: [
      '急いで歩く',
      '散策する、ぶらぶら歩く', // 正解
      '迷子になる',
      '大声で叫ぶ'
    ],
    correctIndex: 1
  },
  {
    question: 'What does "myriad" mean?',
    options: [
      'おそらく、たぶん',
      '控えめな',
      '無数の、多数の', // 正解
      '不思議な'
    ],
    correctIndex: 2
  }
];*/

const dictionary = require('./json_data/ejdict.json');

const generateQuizData = (keywords) => {
  return keywords.map((keyword) => {
    // 正解の意味を取得
    const correct = dictionary[keyword] || '意味不明';

    // 辞書データのうち、対象以外のキー一覧を作成
    const dictKeys = Object.keys(dictionary).filter(key => key !== keyword);

    // 3つの誤答候補をランダムに選択
    const alternatives = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * dictKeys.length);
      const altKey = dictKeys[randomIndex];
      alternatives.push(dictionary[altKey]);
      // 同じ選択肢が重複しないように選んだキーを削除
      dictKeys.splice(randomIndex, 1);
    }

    // 正解と誤答候補を合わせて選択肢の配列を作成
    let options = [correct, ...alternatives];

    // Fisher-Yatesアルゴリズムで選択肢をシャッフル
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // シャッフル後、正解がどのインデックスにあるかを判定
    const correctIndex = options.indexOf(correct);

    return { question: `What does "${keyword}" mean?`, options, correctIndex };
  });
}

// --- エンドポイントの定義 --- //

app.get("/", (req, res) => {
  res.send("Welcome to the simple backend server!");
});

// 単語データを返すエンドポイント
app.get('/api/dictionary', (req, res) => {
  res.json(dictionary);
});

// 長文データのidを受け取り、その重要単語に関するクイズデータを生成して返すエンドポイント
app.get('/api/quiz', (req, res) => {
  // 外部から取得した長文データを使用する
  const textData = require('./json_data/text.json').data;
  const id = req.query.id;

  if (id) {
    const textItem = textData.find(item => item.id === parseInt(id));
    if (textItem) {
      const keywords = textItem.keywords; // 重要単語のリスト
      const quizData = generateQuizData(keywords);
      return res.json(quizData);
    } else {
      return res.status(404).json({ error: 'Text not found' });
    }
  }

  res.status(400).json({ error: 'Invalid request, id is required' });
});

// 長文データを返すエンドポイント
// reqでは長文のidを受け取ることができるようにする
// 例: /api/text?id=1 のようにリクエストを送信することで、特定の長文を取得できるようにする
app.get('/api/text', (req, res) => {
  // 外部から取得した長文データを使用する
  const textData = require('./json_data/text.json').data;
  const id = req.query.id;

  if (id) {
    const textItem = textData.find(item => item.id === parseInt(id));
    if (textItem) {
      return res.json(textItem);
    } else {
      return res.status(404).json({ error: 'Text not found' });
    }
  }
  
  res.json(textData);
});

// ユーザーのクイズ結果を受け取って一時保存（メモリ上に保存）
let quizResults = [];
app.post('/api/submit-quiz', (req, res) => {
  const result = req.body;
  // 簡易的なバリデーション
  if (!result || !result.answers) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  quizResults.push(result);
  res.status(200).json({ message: 'Result saved', id: quizResults.length });
});

// クイズ結果の取得（デバッグ用）
app.get('/api/quiz-results', (req, res) => {
  res.json(quizResults);
});

// サーバー起動
app.listen(port, () => {
  console.log(`Simple backend server running at http://localhost:${port}`);
});
