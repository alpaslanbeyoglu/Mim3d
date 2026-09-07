var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.post("/api/scan-blueprint", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image payload found." });
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    };
    const textPart = {
      text: 'Analyze this architectural floor plan / blueprint sketch and detect its outermost walls. Extract the main room coordinates as a closed polygon on a 2D Cartesian plane. The center of the plane should be roughly the center of the building. Limit the polygon to the outermost walls, containing between 4 and 10 points. Scale the coordinates so the building is roughly 8 to 12 meters wide (meaning coordinates are between -6 and +6). Return your output strictly as a JSON object matching this schema:\n{\n  "name": "A descriptive name of the villa/building, e.g. Cozy L-Shape Bungalow",\n  "points": Array<{x: number, y: number}>\n}\nReturn only the raw JSON. Do not include markdown or other text besides the JSON.'
    };
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            name: {
              type: import_genai.Type.STRING,
              description: "A descriptive name of the villa/building."
            },
            points: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  x: { type: import_genai.Type.NUMBER },
                  y: { type: import_genai.Type.NUMBER }
                },
                required: ["x", "y"]
              },
              description: "The 2D coordinates forming the boundary."
            }
          },
          required: ["name", "points"]
        }
      }
    });
    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response text from Gemini API.");
    }
    const parsedData = JSON.parse(textResult.trim());
    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini scanning failed:", error);
    return res.status(500).json({ error: error.message || "Failed to process floor plan with Gemini API." });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
setupVite();
//# sourceMappingURL=server.cjs.map
