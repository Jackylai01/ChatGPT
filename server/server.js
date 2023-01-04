const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();

//跨域設定
app.use(cors());

//中間件
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    //使用者在對話框輸入的內容
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

const port = process.env.PORT || 8000;

app.listen(8000, () => {
  console.log(`Server is running on port ${port}`);
});
