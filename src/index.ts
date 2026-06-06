import http from "http";

const PORT = 3000;

type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

type PostInput = {
	userId: number;
	title: string;
	body: string;
	id?: number;
};

let posts: Post[] = [];

async function loadInitialData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  posts = await res.json();
  console.log("Data loaded:", posts.length);
}

function parseJsonBody(body: string): PostInput | null {
  if (!body.trim()) {
    return null;
  }

  return JSON.parse(body) as PostInput;
}

function getPostId(url: string): number | null {
  const idPart = url.split("/")[2];
  const id = Number(idPart);

  return Number.isInteger(id) ? id : null;
}

const server = http.createServer((req, res) => {
  const url = req.url || "";
  const method = req.method || "";

  res.setHeader("Content-Type", "application/json");

  // GET all posts
  if (url === "/posts" && method === "GET") {
    res.end(JSON.stringify(posts));
  }

  // CREATE post
  else if (url === "/posts" && method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = parseJsonBody(body);

	  if (!data) {
		res.statusCode = 400;
		res.end(JSON.stringify({ message: "Request body is required" }));
		return;
	  }

      const newPost: Post = {
        id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        userId: data.userId,
        title: data.title,
        body: data.body
      };

      posts.push(newPost);

      res.end(JSON.stringify(newPost));
    });
  }

  // UPDATE post
  else if (url.startsWith("/posts/") && method === "PUT") {
    const id = getPostId(url);

	if (id === null) {
	  res.statusCode = 400;
	  res.end(JSON.stringify({ message: "Invalid post id" }));
	  return;
	}

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = parseJsonBody(body);

      if (!data) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Request body is required" }));
        return;
      }

      const index = posts.findIndex(p => p.id === id);

      if (index === -1) {
		const createdPost: Post = {
		  id,
		  userId: data.userId,
		  title: data.title,
		  body: data.body
		};

		posts.push(createdPost);
		res.statusCode = 201;
		res.end(JSON.stringify(createdPost));
		return;
	  }

      posts[index] = {
        ...posts[index],
        ...data,
        id
      };

      res.end(JSON.stringify(posts[index]));
    });
  }

  //



  // DELETE post
  else if (url.startsWith("/posts/") && method === "DELETE") {
    const id = getPostId(url);

	if (id === null) {
	  res.statusCode = 400;
	  res.end(JSON.stringify({ message: "Invalid post id" }));
	  return;
	}

    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: `Post id ${id} not found` }));
      return;
    }

    posts.splice(index, 1);

    res.end(JSON.stringify({ message: `Post id ${id} deleted` }));
  }

  // NOT FOUND
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

loadInitialData().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});