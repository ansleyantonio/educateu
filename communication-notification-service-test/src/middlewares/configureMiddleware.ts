import type { Application } from 'express';
import express from 'express';
import cors from 'cors';

export const configureMiddleware = (app: Application): void => {
  // Built-in middleware
  app.use(express.json());

  // CORS - Allow all origins
  app.use(cors());

  // Add other middleware configurations here as needed
  // Example:
  // app.use(express.urlencoded({ extended: true }));
  // app.use(cookieParser());
};
