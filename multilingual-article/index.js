const express = require("express")

const app = express()
const bodyParser = require("body-parser")
const port = 3000
const pug = require("pug")


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const resultsTemplate = pug.compileFile("public/results.pug")



app.get("/", (req, res) => {
  res.sendFile("public/index.html", {
    root: __dirname
  })
})

app.post("/generate", (req, res) => {
  let unirest = require('unirest')
  //unirest.get("https://aylien-text.p.rapidapi.com/extract?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FBatman")
  unirest.get("https://aylien-text.p.rapidapi.com/extract?url=" + req.body.url1)
    .header("X-RapidAPI-Key", "ef85378c85mshba2274079546a84p17d664jsnd2bd575e1853")
    .end(function(result) {
      //console.log(result.status, result.headers, result.body);

      let title = result.body.title

      unirest.get("https://aylien-text.p.rapidapi.com/summarize?url=" + req.body.url1 + "&mode=short&sentences_number=1")
        .header("X-RapidAPI-Key", "ef85378c85mshba2274079546a84p17d664jsnd2bd575e1853")
        .end(function(result) {
          let sentences = Array(3)
          sentences[0] = result.body.sentences[0]

          unirest.post("https://translator.p.rapidapi.com/api/translate")
            .header("X-RapidAPI-Key", "ef85378c85mshba2274079546a84p17d664jsnd2bd575e1853")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .send("input=" + sentences[0])
            .send("target=ja")
            .end(function(result) {
              sentences[1] = result.body.ouput

              unirest.post("https://translator.p.rapidapi.com/api/translate")
                .header("X-RapidAPI-Key", "ef85378c85mshba2274079546a84p17d664jsnd2bd575e1853")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .send("input=" + sentences[0])
                .send("target=es")
                .end(function(result) {
                  sentences[2] = result.body.ouput

                  res.send(resultsTemplate({
                    title: title,
                    sentences: sentences
                  }))
                });

            });
        });
    });

})


app.use(express.static("public"))
app.listen(port, () => console.log(`Running on http://localhost:${port}/`))

//Used for cloud9
//app.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function() {});
