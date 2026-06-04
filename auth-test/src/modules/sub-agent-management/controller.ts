import { Response } from "express";
import { RequestWithUser } from "../../types";
import AuthService from "./service";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { subAgentSchema } from "./schema";
import { sendRegistrationEmail } from "../communication/mail/mailer";
import axios from "axios";

const register = async (req: RequestWithUser, res: Response) => {
  const validatedData = zodSafeParse(req.body, subAgentSchema);

  // Call the service to register the user
  const newUser = await AuthService.register(validatedData);
  setImmediate(() =>
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/registration`, {
      email: validatedData?.email || "",
      username: validatedData?.username || "",
      firstName: validatedData?.firstName || "",
      password: validatedData?.password || "",
      loginUrl:
        process.env.AGENT_LOGIN_URL || "http://localhost:3000/agent/login",
    }),
  );

  sendSuccessResponse(res, newUser, "User registered successfully", 201);
};

const getAllUsers = async (req: RequestWithUser, res: Response) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    status = "",
    agentType = "",
  } = req.query;
  const userId = req.user?.userId;

  const pageNumber = parseInt(page as string, 10);
  const pageLimit = parseInt(pageSize as string);
  const searchName = name as string;
  const searchStatus = status as string;
  const searchAgentType = agentType as string;

  const users = await AuthService.getAllUsers(
    pageNumber,
    pageLimit,
    searchName,
    searchStatus,
    searchAgentType,
    userId,
  );

  sendSuccessResponse(res, users, "Successfully fetched");
};

const getAgentWiseSubAgents = async (req: RequestWithUser, res: Response) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    status = "",
    agentType = "",
  } = req.query;
  const userId = req.params.id;

  const pageNumber = parseInt(page as string, 10);
  const pageLimit = parseInt(pageSize as string, 10);
  const searchName = name as string;
  const searchStatus = status as string;
  const searchAgentType = agentType as string;

  const users = await AuthService.getAgentWiseSubAgents(
    pageNumber,
    pageLimit,
    searchName,
    searchStatus,
    searchAgentType,
    userId,
  );

  sendSuccessResponse(res, users.formattedAgents, "Successfully fetched");
};

const getUserById = async (req: RequestWithUser, res: Response) => {
  const userId = req.params.id;
  const user = await AuthService.getUserById(userId);
  sendSuccessResponse(res, { user });
};

const updateUser = async (req: RequestWithUser, res: Response) => {
  const userId = req.params.userId;
  const validatedData = zodSafeParse(req.body, subAgentSchema);

  const updatedUser = await AuthService.updateUser(userId, validatedData);

  sendSuccessResponse(res, updatedUser, "User updated successfully");
};

export const AuthController = {
  register,
  getAllUsers,
  getUserById,
  updateUser,
  getAgentWiseSubAgents,
};
