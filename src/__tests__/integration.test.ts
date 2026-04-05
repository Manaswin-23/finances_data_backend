import request from "supertest";
import bcrypt from "bcryptjs";
const app = require("../app");
import prisma from "../utils/prisma";

describe("Finance API Comprehensive Integration Tests", () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 12);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    adminToken = loginRes.body.token;

    const registerRes = await request(app).post("/api/auth/register").send({
      email: "viewer@example.com",
      password: "password123",
      name: "Viewer User",
    });

    viewerToken = registerRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Authentication API", () => {
    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@example.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
    });

    it("should reject registration with duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "admin@example.com",
        password: "newpassword123",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Transactions API full flow (CRUD, Search, Soft Delete)", () => {
    let transactionId1: string;
    let transactionId2: string;

    it("should allow ADMIN to create multiple transactions", async () => {
      const res1 = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          description: "Monthly salary",
        });
      expect(res1.status).toBe(201);
      transactionId1 = res1.body.data.transaction.id;

      const res2 = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 200,
          type: "EXPENSE",
          category: "Groceries",
          description: "Weekly supermarket run",
        });
      expect(res2.status).toBe(201);
      transactionId2 = res2.body.data.transaction.id;
    });

    it("should find transaction by search text", async () => {
      const res = await request(app)
        .get("/api/transactions?search=supermarket")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.transactions.length).toBe(1);
      expect(res.body.data.transactions[0].description).toBe("Weekly supermarket run");
    });

    it("should get transaction detail", async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId2}`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.transaction.id).toBe(transactionId2);
    });

    it("should allow ADMIN to update a transaction", async () => {
      const res = await request(app)
        .patch(`/api/transactions/${transactionId2}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ amount: 250 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.transaction.amount).toBe(250);
    });

    it("should soft delete a transaction", async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId2}`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(204);

      // Verify it's hidden from lists
      const listRes = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(listRes.body.data.transactions.length).toBe(1); // Only transactionId1 is left
      
      // Verify it still exists in the database
      const dbRecord = await prisma.transaction.findUnique({
        where: { id: transactionId2 }
      });
      expect((dbRecord as any)?.deletedAt).not.toBeNull();
    });
  });

  describe("Dashboard API aggregations check", () => {
    it("should accurately reflect only active transactions", async () => {
      const res = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", `Bearer ${adminToken}`); // ADMIN has global access to dashboard
      
      expect(res.status).toBe(200);
      // Soft-deleted expense of 200 shouldn't be counted
      expect(res.body.data.totalIncome).toBe(5000);
      expect(res.body.data.totalExpenses).toBe(0); 
    });
  });

  describe("Users API", () => {
    let viewerId: string;

    it("should allow ADMIN to list users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
      
      const viewerUser = res.body.data.users.find((u: any) => u.email === "viewer@example.com");
      expect(viewerUser).toBeDefined();
      viewerId = viewerUser.id;
    });

    it("should allow ADMIN to update user role", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "ANALYST" });
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe("ANALYST");
    });

    it("should allow ADMIN to update user status", async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INACTIVE" });
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.status).toBe("INACTIVE");
    });
  });
});
