const BID = "bid_9a8650eecd374291bdc4e9b621ead20c08c66c244064e6f53c8bdb055572451c";
const API = "https://cs571api.cs.wisc.edu/rest/f25/bucket";

export async function getAll() {
  const res = await fetch(API, {
    headers: { "X-CS571-ID": BID }
  });
  return res.json();
}

export async function add(item) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CS571-ID": BID
    },
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function update(key, item) {
  const res = await fetch(`${API}/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CS571-ID": BID
    },
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function remove(key) {
  const res = await fetch(`${API}/${key}`, {
    method: "DELETE",
    headers: { "X-CS571-ID": BID }
  });
  return res.json();
}