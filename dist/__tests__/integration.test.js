"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = require("../app");
const prisma_1 = __importDefault(require("../utils/prisma"));
describe("Finance API Comprehensive Integration Tests", () => {
    let adminToken;
    let viewerToken;
    beforeAll(async () => {
        await prisma_1.default.transaction.deleteMany();
        await prisma_1.default.user.deleteMany();
        const hashedPassword = await bcryptjs_1.default.hash("password123", 12);
        const adminUser = await prisma_1.default.user.create({
            data: {
                email: "admin@example.com",
                password: hashedPassword,
                name: "Admin User",
                role: "ADMIN",
            },
        });
        const loginRes = await (0, supertest_1.default)(app).post("/api/auth/login").send({
            email: "admin@example.com",
            password: "password123",
        });
        adminToken = loginRes.body.token;
        const registerRes = await (0, supertest_1.default)(app).post("/api/auth/register").send({
            email: "viewer@example.com",
            password: "password123",
            name: "Viewer User",
        });
        viewerToken = registerRes.body.token;
    });
    afterAll(async () => {
        await prisma_1.default.$disconnect();
    });
    describe("Authentication API", () => {
        it("should reject login with wrong password", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/auth/login").send({
                email: "admin@example.com",
                password: "wrongpassword",
            });
            expect(res.status).toBe(401);
        });
        it("should reject registration with duplicate email", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/auth/register").send({
                email: "admin@example.com",
                password: "newpassword123",
            });
            expect(res.status).toBe(400);
        });
    });
    describe("Transactions API full flow (CRUD, Search, Soft Delete)", () => {
        let transactionId1;
        let transactionId2;
        it("should allow ADMIN to create multiple transactions", async () => {
            const res1 = await (0, supertest_1.default)(app)
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
            const res2 = await (0, supertest_1.default)(app)
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
            const res = await (0, supertest_1.default)(app)
                .get("/api/transactions?search=supermarket")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.transactions.length).toBe(1);
            expect(res.body.data.transactions[0].description).toBe("Weekly supermarket run");
        });
        it("should get transaction detail", async () => {
            const res = await (0, supertest_1.default)(app)
                .get(`/api/transactions/${transactionId2}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.transaction.id).toBe(transactionId2);
        });
        it("should allow ADMIN to update a transaction", async () => {
            const res = await (0, supertest_1.default)(app)
                .patch(`/api/transactions/${transactionId2}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ amount: 250 });
            expect(res.status).toBe(200);
            expect(res.body.data.transaction.amount).toBe(250);
        });
        it("should soft delete a transaction", async () => {
            const res = await (0, supertest_1.default)(app)
                .delete(`/api/transactions/${transactionId2}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(204);
            // Verify it's hidden from lists
            const listRes = await (0, supertest_1.default)(app)
                .get("/api/transactions")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(listRes.body.data.transactions.length).toBe(1); // Only transactionId1 is left
            // Verify it still exists in the database
            const dbRecord = await prisma_1.default.transaction.findUnique({
                where: { id: transactionId2 }
            });
            expect(dbRecord?.deletedAt).not.toBeNull();
        });
    });
    describe("Dashboard API aggregations check", () => {
        it("should accurately reflect only active transactions", async () => {
            const res = await (0, supertest_1.default)(app)
                .get("/api/dashboard/summary")
                .set("Authorization", `Bearer ${viewerToken}`); // VIEWER has access to dashboard
            expect(res.status).toBe(200);
            // Soft-deleted expense of 200 shouldn't be counted
            expect(res.body.data.totalIncome).toBe(5000);
            expect(res.body.data.totalExpenses).toBe(0);
        });
    });
    describe("Users API", () => {
        let viewerId;
        it("should allow ADMIN to list users", async () => {
            const res = await (0, supertest_1.default)(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
            const viewerUser = res.body.data.users.find((u) => u.email === "viewer@example.com");
            expect(viewerUser).toBeDefined();
            viewerId = viewerUser.id;
        });
        it("should allow ADMIN to update user role", async () => {
            const res = await (0, supertest_1.default)(app)
                .patch(`/api/users/${viewerId}/role`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ role: "ANALYST" });
            expect(res.status).toBe(200);
            expect(res.body.data.user.role).toBe("ANALYST");
        });
        it("should allow ADMIN to update user status", async () => {
            const res = await (0, supertest_1.default)(app)
                .patch(`/api/users/${viewerId}/status`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "INACTIVE" });
            expect(res.status).toBe(200);
            expect(res.body.data.user.status).toBe("INACTIVE");
        });
    });
});
