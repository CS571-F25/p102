const BID = "bid_9a8650eecd374291bdc4e9b621ead20c08c66c244064e6f53c8bdb055572451c";
const BASE = "https://cs571api.cs.wisc.edu/rest/f25/bucket";

export async function bucketGet(collection) {
  const res = await fetch(`${BASE}/${collection}`, {
    headers: { "X-CS571-ID": BID }
  });
  return res.json();
}

export async function bucketDelete(collection, id) {
  const res = await fetch(`${BASE}/${collection}?id=${id}`, {
    method: "DELETE",
    headers: {
      "X-CS571-ID": BID
    }
  });
  return res.json();
}

export async function bucketPost(collection, data) {
  const res = await fetch(`${BASE}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CS571-ID": BID
    },
    body: JSON.stringify(data)
  });
  return res.json();
}