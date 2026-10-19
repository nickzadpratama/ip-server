require("dotenv").config({ quiet: true });
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const request = require("supertest");
const app = require("../app");
const { User, FanClubMembership, sequelize } = require("../models");

async function main() {
  const ids = [];
  try {
    const password = crypto.randomBytes(18).toString("hex");
    const tokens = [];
    for (let i = 0; i < 2; i++) {
      const email = `membership-smoke-${crypto.randomUUID()}@example.test`;
      const registered = await request(app).post("/register").send({ username: "Membership smoke", email, password });
      assert.equal(registered.status, 200, JSON.stringify(registered.body));
      ids.push(registered.body.data.id);
      const login = await request(app).post("/login").send({ email, password });
      assert.equal(login.status, 200);
      tokens.push(login.body.access_token);
    }
    const teamId = process.env.SMOKE_TEAM_ID || "1571";
    const auth = (token) => ({ Authorization: `Bearer ${token}` });
    const joined = await request(app).put(`/me/fan-clubs/${teamId}`).set(auth(tokens[0]));
    assert.equal(joined.status, 201, JSON.stringify(joined.body));
    const duplicates = await Promise.all(Array.from({ length: 10 }, () =>
      request(app).put(`/me/fan-clubs/${teamId}`).set(auth(tokens[0]))));
    duplicates.forEach((response) => assert.equal(response.status, 200, JSON.stringify(response.body)));
    assert.equal(await FanClubMembership.count({ where: { UserId: ids[0] } }), 1);
    const list = await request(app).get("/me/fan-clubs").set(auth(tokens[0]));
    assert.equal(list.status, 200);
    assert.equal(list.body.data[0].FanClub.externalTeamId, Number(teamId));
    const other = await request(app).get("/me/fan-clubs").set(auth(tokens[1]));
    assert.deepEqual(other.body.data, []);
    assert.equal((await request(app).put(`/me/fan-clubs/${teamId}`).set(auth(tokens[1]))).status, 201);
    const edits = { name: "Personal Club Name", code: "mine", founded: "1990", city: "Personal City", stadium: "Personal Stadium", capacity: "12000" };
    const updated = await request(app).patch(`/me/fan-clubs/${teamId}`).set(auth(tokens[0])).send(edits);
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    const refreshed = await request(app).get(`/me/fan-clubs/${teamId}`).set(auth(tokens[0]));
    assert.equal(refreshed.body.data.details.name, edits.name);
    assert.equal(refreshed.body.data.details.capacity, 12000);
    const updatedList = await request(app).get("/me/fan-clubs").set(auth(tokens[0]));
    assert.equal(updatedList.body.data[0].details.city, edits.city);
    const otherDetail = await request(app).get(`/me/fan-clubs/${teamId}`).set(auth(tokens[1]));
    assert.deepEqual(otherDetail.body.data.details, {});
    assert.equal(updated.body.data.FanClub.name, otherDetail.body.data.FanClub.name);
    console.log("PASS: Update -> reload detail -> My Teams -> other member unchanged");
    assert.equal((await request(app).delete(`/me/fan-clubs/${teamId}`).set(auth(tokens[0]))).status, 204);
    assert.equal(await FanClubMembership.count({ where: { UserId: ids[0] } }), 0);
    assert.equal(await FanClubMembership.count({ where: { UserId: ids[1] } }), 1);
    console.log("PASS: register/login -> add/join -> My Teams -> 10 duplicate joins -> user isolation -> leave");
  } finally {
    for (const id of ids) {
      await FanClubMembership.destroy({ where: { UserId: id } });
      await User.destroy({ where: { id } });
    }
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
