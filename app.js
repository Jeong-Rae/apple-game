const express = require("express");
const path = require("path");

const app = express();
const port = 3333;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

let scoreBoard = [];

app.get("/api/scoreboard", (req, res) => {
    const topScores = scoreBoard.slice(0, 5);
    res.json(topScores);
});

app.post("/api/scoreboard", (req, res) => {
    const newScore = req.body;
    if (newScore && newScore.username && typeof newScore.score === "number") {
        scoreBoard.push(newScore);
        scoreBoard.sort((a, b) => b.score - a.score);

        res.status(200).json({ message: "성공적으로 스코어가 반영되었습니다" });
    } else {
        res.status(400).json({ message: "잘못된 스코어" });
    }
});

app.post("/api/rank", (req, res) => {
    const { username, score } = req.body;
    if (username && typeof score === "number") {
        scoreBoard.sort((a, b) => b.score - a.score);
        const rank =
            scoreBoard.findIndex(
                (userScore) =>
                    userScore.username === username && userScore.score === score
            ) + 1;
        res.json({ rank, username, score });
    } else {
        res.status(400).json({ message: "잘못된 데이터" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
