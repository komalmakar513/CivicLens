const clients = new Set();

const addClient = (res) => {
  clients.add(res);
};

const removeClient = (res) => {
  clients.delete(res);
};

const broadcastNewProblem = (problem) => {
  const payload = JSON.stringify(problem);

  for (const client of clients) {
    if (client.destroyed || client.writableEnded) {
      clients.delete(client);
      continue;
    }

    try {
      client.write(`event: new-problem\n`);
      client.write(`data: ${payload}\n\n`);
    } catch (error) {
      clients.delete(client);
    }
  }
};

module.exports = {
  addClient,
  removeClient,
  broadcastNewProblem,
};