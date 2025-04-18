const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS 許可（必要に応じて設定を変更してください）
app.use(cors());
app.use(bodyParser.json());

// --- クイズデータ --- //
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
];

// --- エンドポイントの定義 --- //

app.get("/", (req, res) => {
  res.send("Welcome to the simple backend server!");
});

// 単語データを返すエンドポイント
app.get('/api/dictionary', (req, res) => {
  //外部から取得した辞書データを使用する
  const dictionary = require('./json_data/ejdict.json');
  res.json(dictionary);
});

// クイズデータを返すエンドポイント
app.get('/api/quiz', (req, res) => {
  res.json(quizQuestions);
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
