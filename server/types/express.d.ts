// Augment Express's Request so the auth middleware can attach the decoded user id.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};
