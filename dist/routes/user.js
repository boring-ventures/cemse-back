"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
router.get("/", UserController_1.listUsers);
router.get("/:id", UserController_1.getUser);
router.post("/", UserController_1.createUser);
router.put("/:id", UserController_1.updateUser);
router.delete("/:id", UserController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.js.map