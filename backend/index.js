const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nlp = require('compromise');

const app = express();
const port = process.env.PORT || 3000;

// CORS 許可
app.use(cors());
app.use(bodyParser.json());

const dictionary = require('./json_data/ejdict.json');

const generateQuizData = (keywords) => {
  return keywords.map((keyword) => {
    const lemma = nlp(keyword).normalize({nouns:true , verbs:true}).out('text');
    const correct = dictionary[lemma] || '意味不明';

    if(correct === '意味不明') return null; // 意味不明な単語はスキップ

    const dictKeys = Object.keys(dictionary).filter(key => key !== lemma);

    const alternatives = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * dictKeys.length);
      const altKey = dictKeys[randomIndex];
      alternatives.push(dictionary[altKey]);
      dictKeys.splice(randomIndex, 1);
    }

    let options = [correct, ...alternatives];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

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
  const textData = require('./json_data/text.json').data;
  const id = req.query.id;

  if (id) {
    const textItem = textData.find(item => item.id === parseInt(id));
    if (textItem) {
      const keywords = textItem.keywords;
      const quizData = generateQuizData(keywords);
      return res.json(quizData);
    } else {
      return res.status(404).json({ error: 'Text not found' });
    }
  }

  res.status(400).json({ error: 'Invalid request, id is required' });
});

// 長文データを返すエンドポイント
app.get('/api/text', (req, res) => {
  const textData = require('./json_data/text.json').data;
  const id = req.query.id;

  if (id) {
    const textItem = textData.find(item => item.id === parseInt(id));
    if (textItem) {
      try {
        const textPath = path.join(__dirname, 'text_data', `${id}.html`);
        const textContent = fs.readFileSync(textPath, 'utf8');
        return res.json({ ...textItem, text: textContent });
      } catch (err) {
        return res.status(404).json({ error: 'Text file not found' });
      }
    } else {
      return res.status(404).json({ error: 'Text metadata not found' });
    }
  }

  res.json(textData);
});

app.get('/api/lemma', (req, res) => {
  const word = req.query.word || '';
  const lemma = nlp(word).normalize({nouns:true , verbs:true}).out('text');
  res.json({ lemma });
});

app.post('/api/lemma/bulk', (req, res) => {
  const words = req.body.words || [];
  const lemmaMap = {};
  words.forEach((w) => {
    lemmaMap[w] = nlp(w).normalize({nouns:true , verbs:true}).out('text');
  });
  res.json({ lemmaMap });
});

// サーバー起動
app.listen(port, () => {
  console.log(`Simple backend server running at http://localhost:${port}`);
});
