class AppError extends Error {
	constructor(code, message, statusCode = 400) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.name = "AppError";
	}
}

module.exports = { AppError };
