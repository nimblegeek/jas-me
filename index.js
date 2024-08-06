const express = require("express");
const renderPage = require("./lib/renderPage");
const marked = require("marked");
const path = require("path");
const app = express();
const fs = require("fs");
const hljs = require("highlight.js");
const _ = require("lodash");
const { Feed } = require("feed");

const renderer = new marked.Renderer();

// Pass html unescaped
renderer.html = (str) => _.unescape(str);

marked.setOptions({
  renderer: renderer,
  highlight(code, lang) {
    try {
      return hljs.highlight(code, lang).value;
    } catch (e) {
      // Failed to highlight the language
      return hljs.highlightAuto(code).value;
    }
  },
});

const staticOpts = {
  maxAge: 365 * 24 * 60 * 60 * 1000,
};

app.use("/public", express.static(path.join(__dirname, "public"), staticOpts));

app.use(
  "/bitcoin",
  express.static(path.join(__dirname, "bitcoin.pdf"), staticOpts),
);

app.use(
  "/iamjas",
  express.static(
    path.join(__dirname, "public/images/frontview.jpg"),
    staticOpts,
  ),
);

app.use(
  "/natural",
  express.static(path.join(__dirname, "public/natural.pdf"), staticOpts),
);

app.use(
  "/red",
  express.static(path.join(__dirname, "public/fbred.pdf"), staticOpts),
);

const essaysDir = path.join(__dirname, "essays");

function parse(fpath) {
  const post = fs.readFileSync(path.join(essaysDir, fpath), "utf8");
  const parts = post.split("---\n");
  const json = parts.shift();
  const essay = (() => {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error("error parsing json for essay", fpath);
      throw e;
    }
  })();

  const date = Date.parse(essay.date);
  if (isNaN(date)) {
    throw new Error(`Invalid date: ${essay.date} - ${fpath}`);
  }
  essay.date = new Date(date);
  essay.raw = parts.join("---\n");
  essay.content = marked(essay.raw);
  essay.url = path.basename(fpath, ".md");
  essay.description = essay.raw.slice(0, 200).replace(/\n/g, " ") + "...";
  return essay;
}

const essays = fs
  .readdirSync(essaysDir)
  .filter((fpath) => fpath[0] !== ".")
  .map(parse)
  .sort((a, b) => b.date - a.date);

const feed = new Feed({
  title: "Jonas Achouri Sihlén",
  description: "Articles",
  id: "https://iamjas.se",
  link: "https://iamjas.se",
  image:
    "https://1.gravatar.com/userimage/176721085/98808ddecc017cf13867273e871125ae?size=256",
  favicon:
    "https://1.gravatar.com/userimage/176721085/98808ddecc017cf13867273e871125ae?size=256",
  copyright: "All rights reserved 2019, Amjad Masad",
  generator: "iamjas.se",
  feedLinks: {
    json: "https://iamjas.se/json",
  },
  author: {
    name: "Jonas Achouri Sihlén",
    email: "heyjas@hey.com",
    link: "https://iamjas.se",
  },
});

for (const essay of essays) {
  if (essay.hidden) continue;

  feed.addItem({
    title: essay.title,
    id: essay.id,
    url: `https://iamjas.se/${essay.url}`,
    description: essay.description,
    content: essay.content,
    date: essay.date,
    image: essay.image,
    author: [
      {
        name: "Jonas Achouri Sihlén",
        email: "heyjas@hey.com",
        link: "https://iamjas.se",
      },
    ],
  });
}

feed.addCategory("Tech");

app.use(function (req, res, next) {
  res.header("X-Rob-Is-Awesom", true);
  next();
});

app.get("/json", (req, res) => {
  res.end(feed.json1());
});

app.get("/rss", (req, res) => {
  res.end(feed.rss2());
});

app.get("/hello", (req, res) => res.end("hello world"));

app.get("/", (req, res) => {
  const essayList = essays
    .filter((es) => !es.hidden)
    .map(
      (es) =>
        `<li>
       <a href="${es.url}">${es.title}</a>
     </li>`,
    )
    .join("\n");

  const html = `
  <article class="index postContent">
    <nav>
      <a href="/about">Now</a>
      <a href="https://twitter.com/amasad">Twitter/X</a>
      <a href="mailto:heyjas@hey.com">Email</a>
      <a href="https://replit.com/@thenimblegeek">Replit</a>
      <a href="https://github.com/nimblegeek">Github</a>
      <a href="https://www.linkedin.com/in/jonasasihlen/">LinkedIn</a>
    </nav>
    <div class="essayList">
      Essays:
      <ul>
        ${essayList}
      </ul>
    </div>
  </article>
  `;
  const page = renderPage({}, html);
  res.send(page);
});

essays.forEach((es) => {
  app.get(`/${es.url}`, (req, res) => {
    const html = `
        <article class="postItem">
          <h1 class="postTitle">
            <a href="/${es.url}">${es.title}</a>
          </h1>
          <h3 class="postAuthor">
            ${es.date.toDateString()}
          </h3>
          <div class="postContent">
            ${es.content}
          </div>
        </article>
        `;

    const page = renderPage(
      {
        title: es.title,
        description: es.description,
        url: `/${es.url}`,
        image: es.image,
      },
      html,
    );
    res.send(page);
  });
});

app.get("/about", (req, res) => {
  fs.readFile(path.join(__dirname, "pages", "about.md"), (err, d) => {
    if (err) {
      res.status(500);
      res.text("something went wrong :(");
      return;
    }

    res.set("Content-Type", "text/html");
    const content = marked(d.toString("utf8"));
    const html = `<article class="postItem postContent">
      ${content}
      </article>`;

    const page = renderPage({}, html);
    res.send(page);
  });
});

app.get("/bio", (req, res) => {
  fs.readFile(path.join(__dirname, "pages", "bio.md"), (err, d) => {
    if (err) {
      res.status(500);
      res.text("something went wrong :(");
      return;
    }

    res.set("Content-Type", "text/html");
    const content = marked(d.toString("utf8"));
    const html = `<article class="postItem postContent">
      ${content}
      </article>`;

    const page = renderPage({}, html);
    res.send(page);
  });
});

// add redirections when needed
const redirections = {};

Object.keys(redirections).forEach((key) => {
  const route = redirections[key];
  app.get(key, (req, res) => {
    res.redirect(301, route);
  });
});

const port = 8000;
app.listen(port, () => {
  console.log("running on port", port);
});
