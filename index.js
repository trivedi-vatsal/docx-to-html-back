const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const cors = require("cors");
const jsdom = require("jsdom");
const fs = require("fs");

const PORT = process.env.PORT || 3030;

const { JSDOM } = jsdom;

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3001" }));

// Multer setup for file uploads
const upload = multer({ dest: "/" });

app.post("/upload", upload.single("file"), (req, res) => {
  mammoth
    .convertToHtml({ path: req.file.path })
    .then((result) => {
      fs.unlinkSync(req.file.path); // delete the file after processing
      return result;
    })
    .then((result) => {
      const html = result.value;
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Select the <table> element(s)
      const tables = document.querySelectorAll("table");

      // Apply the inline style for border-collapse to each table
      tables.forEach((table) => {
        table.style.borderCollapse = "collapse";
      });

      const cells = document.querySelectorAll("table th, table td");

      // Apply an inline style for borders to each cell
      cells.forEach((cell) => {
        cell.style.border = "1px solid black";
      });

      // Output the modified HTML
      // console.log(document.body.innerHTML);

      return document.body.innerHTML;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
