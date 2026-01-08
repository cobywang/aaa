import { GoogleGenAI } from "@google/genai";

// Safe access to API Key in browser environment
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const sendMessageToGemini = async (
  history,
  newMessage,
  systemInstruction,
  files = [], // New parameter: Array of uploaded files
  modelName = 'gemini-3-flash-preview'
) => {
  
  if (!apiKey) {
    console.warn("No API Key found. Returning mock response.");
    return mockResponse(newMessage);
  }

  try {
    // 1. Construct File Context
    let fileContext = "";
    if (files && files.length > 0) {
      fileContext += "\n\n=== UPLOADED KNOWLEDGE BASE ===\n";
      files.forEach(file => {
        if (file.content) {
          // Truncate very large files to avoid basic token limits if necessary, 
          // though Flash models handle large context well.
          const contentPreview = file.content.substring(0, 50000); 
          fileContext += `\n--- File: ${file.name} ---\n${contentPreview}\n`;
        } else {
          fileContext += `\n--- File: ${file.name} (Binary Content - Metadata Only) ---\nSize: ${file.size} bytes\n`;
        }
      });
      fileContext += "\n=== END KNOWLEDGE BASE ===\n";
      fileContext += "Instructions: You are to use the data provided in the 'UPLOADED KNOWLEDGE BASE' above to answer the user's questions. Analyze the data row by row if necessary.";
    }

    // 2. Prepare Contents
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    // 3. Call API
    // We append the file context to the systemInstruction to ensure it persists as 'background knowledge'
    const fullSystemInstruction = systemInstruction + fileContext;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.4, // Lower temperature for more accurate data analysis
      }
    });

    const fullText = response.text || "";
    
    const { text, chartData } = parseResponseForChart(fullText);

    return { text, chartData };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I apologize, but I encountered an error connecting to the AI service. Please check your API key or try again later.",
    };
  }
};

function parseResponseForChart(fullText) {
  const jsonBlockRegex = /```json\s*(\{[\s\S]*?"chart":[\s\S]*?\})\s*```/;
  const match = fullText.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.chart) {
        const cleanText = fullText.replace(match[0], '').trim();
        return { text: cleanText, chartData: parsed.chart };
      }
    } catch (e) {
      console.warn("Failed to parse chart JSON", e);
    }
  }

  return { text: fullText };
}

async function mockResponse(msg) {
  await new Promise(r => setTimeout(r, 1500)); 
  
  if (msg.includes("最好") || msg.includes("sku") || msg.includes("sales")) {
    return {
      text: "根據您上傳的訂單文件分析，過去一週的銷售數據顯示 **SKU-A01 (極致工學椅)** 是銷售冠軍，總營業額為 **NT$ 1,250,000**。\n\n緊隨其後的是 SKU-B05 和 SKU-C02。我已經為您整理了前三名的銷售佔比圖表如下。",
      chartData: {
        type: "pie",
        title: "Top 3 Best Selling SKUs",
        data: [
          { name: "SKU-A01 工學椅", value: 1250000, fill: "#3B82F6" },
          { name: "SKU-B05 升降桌", value: 850000, fill: "#10B981" },
          { name: "SKU-C02 螢幕架", value: 450000, fill: "#F59E0B" }
        ]
      }
    };
  }

  return {
    text: "收到您的訊息。作為訂單 Agent，我可以協助處理訂單匯總、庫存查詢以及生成銷售報表。請問還有什麼具體需求嗎？"
  };
}