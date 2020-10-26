"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (password, email) => {
    console.log(email);
    if (!email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    if (email.length <= 4) {
        return [
            {
                field: "email",
                message: "length must be greather than 3",
            },
        ];
    }
    if (password.length <= 5) {
        return [
            {
                field: "password",
                message: "length must be greather than 4",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map