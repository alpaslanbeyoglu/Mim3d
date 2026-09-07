import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini Client Utility with custom User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    }
  }
});

// AI Endpoint: Analyze floorplan/blueprint image
app.post("/api/scan-blueprint", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image payload found." });
    }

    // Clean base64 prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data,
      },
    };

    const textPart = {
      text: "Analyze this architectural floor plan / blueprint sketch and detect its outermost walls. " +
            "Extract the main room coordinates as a closed polygon on a 2D Cartesian plane. " +
            "The center of the plane should be roughly the center of the building. " +
            "Limit the polygon to the outermost walls, containing between 4 and 10 points. " +
            "Scale the coordinates so the building is roughly 8 to 12 meters wide (meaning coordinates are between -6 and +6). " +
            "Return your output strictly as a JSON object matching this schema:\n" +
            "{\n" +
            "  \"name\": \"A descriptive name of the villa/building, e.g. Cozy L-Shape Bungalow\",\n" +
            "  \"points\": Array<{x: number, y: number}>\n" +
            "}\n" +
            "Return only the raw JSON. Do not include markdown or other text besides the JSON."
    };

    // Ask gemini-3.8-flash for structured JSON response
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "A descriptive name of the villa/building."
            },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
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
  } catch (error: any) {
    console.error("Gemini scanning failed:", error);
    return res.status(500).json({ error: error.message || "Failed to process floor plan with Gemini API." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite();
