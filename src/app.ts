import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

const app = express();

app.use(express.json());

// Simple logger (dev)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Node + Express + TypeScript!" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ---------------------------
// CRUD: Assistants
// ---------------------------
interface Assistant {
  id: number;
  name: string;
}

const assistants: Assistant[] = [];
let nextId = 1;

// GET all
app.get("/assistants", (_req: Request, res: Response) => {
  res.json(assistants);
});

// GET by id
app.get("/assistants/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const assistant = assistants.find((a) => a.id === id);

  if (!assistant) {
    return res.status(404).json({ error: "Assistant not found" });
  }

  res.json(assistant);
});

// POST create
app.post("/assistants", (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const newAssistant: Assistant = { id: nextId++, name };
  assistants.push(newAssistant);

  res.status(201).json(newAssistant);
});

// PUT update
app.put("/assistants/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const assistant = assistants.find((a) => a.id === id);
  if (!assistant) {
    return res.status(404).json({ error: "Assistant not found" });
  }

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  assistant.name = name;
  res.json(assistant);
});

// DELETE remove
app.delete("/assistants/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = assistants.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Assistant not found" });
  }

  assistants.splice(index, 1);
  res.status(204).send();
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

export default app;
