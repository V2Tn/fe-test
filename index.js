const express = require("express");
const app = express();
const PORT = 3000;

const callModel = async (modelName, delay, successRate) => {
  await new Promise((r) => setTimeout(r, delay));
  if (Math.random() > successRate) throw new Error(`${modelName} failed`);
  return {
    model: modelName,
    confidence: 0.5 + Math.random() * 0.5,
    result: Math.random() > 0.5 ? "Human" : "AI",
  };
};

const modelA = () => callModel("ModelA", 1000, 0.9);
const modelB = () => callModel("ModelB", 2000, 0.7);
const modelC = () => callModel("ModelC", 3000, 0.95);

const questions = [
  "Tell me about yourself",
  "Why this company?",
  "Greatest weakness?",
  "Describe a challenge you solved",
  "Where do you see yourself in 5 years?",
];

async function detecAnswer(question) {
  const start = Date.now();
  let result;

  try {
    result = await modelA();
  } catch (errA) {
    console.log("Model A fail", errA.message);

    try {
      result = await modelB();
    } catch (errB) {
      console.log("Model B fail", errB.message);

      try {
        result = await modelC();
      } catch (errC) {
        console.log("Model C fail", errC.message);

        return {
          question: question,
          error: "All model failed",
          timeTaken: Date.now() - start,
        };
      }
    }
  }

  return {
    question: question,
    model: result.model,
    confidence: result.confidence,
    result: result.result,
    timeTaken: Date.now() - start,
  };
}

app.get("/results", async (req, res) => {
  const { question } = req.query;

  if (question) {
    const resResult = await detecAnswer(question);
    return res.json([resResult]);
  }

  let results = [];
  for (let q of questions) {
    const r = await detecAnswer(q);
    results.push(r);
  }
  res.json(results);
});

app.listen(PORT);

/*
Hướng dẫn chạy code: 
  + Cài đặt express 
  + Sau đấy chạy file: node index.js
  + URL : http://localhost:3000/results,
          http://localhost:3000/results?question=

Nếu có thêm 30 phút, tôi sẽ cải thiện:
  + Phần xử lí câu hỏi trả về cho tối ưu hơn
  + Biết thêm về viết unit test hơn để kiểm soát chất lượng
*/
