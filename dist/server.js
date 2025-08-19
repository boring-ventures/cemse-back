"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routes = __importStar(require("./routes"));
const auth_1 = require("./middleware/auth");
const path_1 = __importDefault(require("path"));
const monitoring_1 = require("./middleware/monitoring");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: [" GET", "POST"]
    }
});
exports.io = io;
const PORT = process.env["PORT"] || 3001;
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Full Express API",
            version: "1.0.0",
            description: "A comprehensive Express API with Prisma",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Development server",
            },
            {
                url: `https://back-end-production-17b6.up.railway.app`,
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ["./controllers/*.ts", "./routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)({ limit: '10mb' }));
app.use(auth_1.requestLogger);
app.use(monitoring_1.performanceMonitor);
app.use(monitoring_1.requestTracker);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.io = io;
app.use("/api", routes.default);
app.get("/api/analytics/performance", monitoring_1.getPerformanceMetrics);
app.get("/api/analytics/errors", monitoring_1.getErrorLogs);
app.get("/api/analytics/requests", monitoring_1.getRequestLogs);
app.get("/api/analytics/memory", monitoring_1.getMemoryUsage);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("join-room", (role) => {
        socket.join(role);
        console.log(`User ${socket.id} joined room: ${role}`);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
app.use(monitoring_1.errorTracker);
app.use(auth_1.errorHandler);
app.get("/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.get("/health/metrics", monitoring_1.getHealthWithMetrics);
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
    console.log(`🔌 Socket.IO server running on port ${PORT}`);
    console.log(`📊 Analytics available at http://localhost:${PORT}/api/analytics`);
});
//# sourceMappingURL=server.js.map