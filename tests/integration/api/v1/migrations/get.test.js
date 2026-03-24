import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonumous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "read:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Deafult user", () => {
    test("Retrieving pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const activedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activedUser);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: 'Verifique se o usuário possui a feature "read:migration"',
        message: "Você não possui permissão para executar essa ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("With `read:migration`", async () => {
      const createdUser = await orchestrator.createUser();
      const activedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(activedUser);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
