const BASE = "https://cs571api.cs.wisc.edu/rest/f25/bucket";

function getId() {
  return CS571.getBadgerId();
}

export async function bucketGet(collection, id = null) {
  const url = id
    ? `${BASE}/${collection}?id=${id}`
    : `${BASE}/${collection}`;

  const res = await fetch(url, {
    headers: { "X-CS571-ID": getId() }
  });

  return res.json();
}

export async function bucketPost(collection, data) {
  const res = await fetch(`${BASE}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CS571-ID": getId()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function bucketPut(collection, id, data) {
  const res = await fetch(`${BASE}/${collection}?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CS571-ID": getId()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function bucketDelete(collection, id) {
  const res = await fetch(`${BASE}/${collection}?id=${id}`, {
    method: "DELETE",
    headers: {
      "X-CS571-ID": getId()
    }
  });
  return res.json();
}