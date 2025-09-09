import request from "supertest";
import app from "../app";

describe("API - end to end", () => {
  // test base routes

  test("GET / -> 200 and message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello from Node + Express + TypeScript!",
    });
  });

  test("GET /health -> 200 and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  // test crud routes

  let createdId: number;
  test("POST /assistants -> 201 and created assistant", async () => {
    const res = await request(app)
      .post("/assistants")
      .send({ name: "Gabriel" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Gabriel");

    createdId = res.body.id;
  });

  test("POST /assistants without name -> 400", async () => {
    const res = await request(app).post("/assistants").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Name is required" });
  });

  test("GET /assistants -> 200 and list", async () => {
    const res = await request(app).get("/assistants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /assistants/:id -> 200 and assistant", async () => {
    const res = await request(app).get(`/assistants/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: createdId, name: "Gabriel" });
  });

  test("GET /assistants/:id (not found) -> 404", async () => {
    const res = await request(app).get("/assistants/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Assistant not found" });
  });

  test("PUT /assistants/:id -> 200 and updated assistant", async () => {
    const res = await request(app)
      .put(`/assistants/${createdId}`)
      .send({ name: "Gabriel Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: createdId, name: "Gabriel Updated" });
  });

  test("PUT /assistants/:id without name -> 400", async () => {
    const res = await request(app).put(`/assistants/${createdId}`).send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Name is required" });
  });

  test("PUT /assistants/:id (not found) -> 404", async () => {
    const res = await request(app).put("/assistants/999").send({ name: "X" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Assistant not found" });
  });

  test("DELETE /assistants/:id -> 204", async () => {
    const res = await request(app).delete(`/assistants/${createdId}`);
    expect(res.status).toBe(204);
  });

  test("DELETE /assistants/:id (not found) -> 404", async () => {
    const res = await request(app).delete(`/assistants/${createdId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Assistant not found" });
  });
});
