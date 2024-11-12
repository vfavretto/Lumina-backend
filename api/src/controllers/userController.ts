import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface RegisterRequest extends Request {
  body: {
    fullName: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface AuthRequest extends Request {
  headers: {
    authorization?: string;
  };
}

interface UpdateRequest extends Request {
  params: {
    id: string;
  };
  body: Partial<IUser>;
}

interface UserParams extends Request {
  params: {
    id: string;
  };
}


export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ fullName, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  export const login = async(req: LoginRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid password" });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  export const checkAuth = async(req: AuthRequest, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }

  export const getUser = async (req: UserParams, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  export const updateUser = async (req: UpdateRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  export const deleteUser = async (req: UserParams, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.status(204).json();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
