const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

const prompts = {
  nlToRFP: `You are an expert procurement assistant. Convert the user's natural language description into a structured RFP format.

Extract and organize the following information:
1. Project title (create a concise, professional title)
2. Project description (summarize the main objective)
3. Required items/services with detailed specifications
4. Budget constraints (total or per-unit)
5. Timeline and deadlines
6. Evaluation criteria (how proposals will be judged)
7. Special requirements or conditions

Return ONLY a valid JSON object with these exact fields:
{
  "title": "string",
  "description": "string",
  "requirements": [
    {
      "item": "string",
      "specification": "string",
      "quantity": number
    }
  ],
  "budget": "string",
  "deadline": "YYYY-MM-DD",
  "evaluationCriteria": ["string"],
  "specialRequirements": "string"
}

If any information is missing or unclear, use reasonable defaults or null values. Do not include any explanatory text, only the JSON object.`,

  parseEmail: `You are a document parser specialized in vendor proposals. Extract structured information from the following email/document.

Extract the following information:
1. Pricing breakdown (itemized with quantities and unit prices)
2. Total cost
3. Payment terms
4. Delivery timeline
5. Warranty/support terms
6. Special conditions or notes
7. Contact information

Return ONLY a valid JSON object with these exact fields:
{
  "pricing": [
    {
      "item": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ],
  "totalCost": number,
  "paymentTerms": "string",
  "deliveryTimeline": "string",
  "warranty": "string",
  "specialConditions": "string",
  "contactInfo": {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}

If information is missing, use null values. Do not include any explanatory text, only the JSON object.`,

  compareProposals: `You are a procurement analyst. Compare the following vendor proposals against the original RFP requirements.

For each proposal, analyze:
1. Compliance with requirements (calculate a score from 0-100)
2. Deviations from specifications
3. Price competitiveness
4. Delivery timeline feasibility
5. Overall value proposition

Provide a comprehensive comparison and recommendation.

Return ONLY a valid JSON object with this structure:
{
  "comparison": [
    {
      "vendorId": number,
      "vendorName": "string",
      "complianceScore": number,
      "priceScore": number,
      "deliveryScore": number,
      "overallScore": number,
      "pros": ["string"],
      "cons": ["string"],
      "deviations": ["string"]
    }
  ],
  "recommendation": {
    "recommendedVendorId": number,
    "reasoning": "string"
  },
  "summary": "string"
}

Do not include any explanatory text, only the JSON object.`
};

module.exports = { model, prompts };
