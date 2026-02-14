
import { GoogleGenAI, Type } from "@google/genai";
import { CareerAnalysis, Skill, SkillGap, RoadmapItem } from "./types";

export async function analyzeCareerPath(
  profileText: string,
  targetRole: string,
  timeCommitment: string,
  profileUrl?: string
): Promise<CareerAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Act as a World-Class Career Strategy Agent.
    
    1. USER DATA:
    ${profileText ? `Pasted Profile/Resume: ${profileText}` : ''}
    ${profileUrl ? `Profile URL (LinkedIn/GitHub/Portfolio): ${profileUrl}` : ''}
    
    2. TARGET DREAM ROLE:
    ${targetRole}
    
    3. CONSTRAINTS:
    - User has "${timeCommitment}" availability per day.
    
    INSTRUCTIONS:
    - If a URL is provided, use Google Search to find relevant public information about this person's professional background to supplement the analysis.
    - Extract structured skills (Technical/Soft) from all available data.
    - Analyze the market requirements for the target role "${targetRole}" using your knowledge of current job trends.
    - Identify specific skill gaps.
    - Generate a HIGHLY ADAPTIVE 30-day learning roadmap (Day 1 to Day 30).
    - Ensure the roadmap reflects the user's specific background and the market demand for the role.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: profileUrl ? [{ googleSearch: {} }] : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                level: { type: Type.NUMBER },
                category: { type: Type.STRING, enum: ['technical', 'soft', 'domain'] }
              },
              required: ["name", "level", "category"]
            }
          },
          marketDemand: { type: Type.STRING },
          gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                currentLevel: { type: Type.NUMBER },
                targetLevel: { type: Type.NUMBER },
                importance: { type: Type.STRING, enum: ['critical', 'high', 'medium'] },
                description: { type: Type.STRING }
              },
              required: ["skill", "currentLevel", "targetLevel", "importance"]
            }
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    }
                  }
                },
                project: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                },
                checkpoint: { type: Type.STRING }
              },
              required: ["day", "title", "description", "checkpoint"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["extractedSkills", "marketDemand", "gaps", "roadmap", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Agent failed to process the request. Please try again.");
  }
}
