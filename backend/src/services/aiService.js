const { model, prompts } = require('../config/ai');


async function convertNLToRFP(userInput) {
  try {
    const prompt = `${prompts.nlToRFP}\n\nUser Input:\n${userInput}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const rfpData = JSON.parse(jsonText);
    
    return {
      success: true,
      data: rfpData
    };
  } catch (error) {
    console.error('Error converting NL to RFP:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        title: 'New RFP',
        description: userInput,
        requirements: [],
        budget: null,
        deadline: null,
        evaluationCriteria: [],
        specialRequirements: null
      }
    };
  }
}


async function parseVendorResponse(emailContent, attachments = []) {
  try {
    let fullContent = emailContent;


    
    const prompt = `${prompts.parseEmail}\n\nEmail Content:\n${fullContent}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const proposalData = JSON.parse(jsonText);
    
    return {
      success: true,
      data: proposalData
    };
  } catch (error) {
    console.error('Error parsing vendor response:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        pricing: [],
        totalCost: null,
        paymentTerms: null,
        deliveryTimeline: null,
        warranty: null,
        specialConditions: null,
        contactInfo: null
      }
    };
  }
}


async function compareProposals(rfp, proposals) {
  try {
    const rfpSummary = {
      title: rfp.title,
      description: rfp.description,
      requirements: rfp.requirements,
      budget: rfp.budget,
      deadline: rfp.deadline,
      evaluationCriteria: rfp.evaluationCriteria
    };
    
    const proposalsSummary = proposals.map(p => ({
      vendorId: p.vendor.id,
      vendorName: p.vendor.name,
      pricing: p.pricing,
      totalCost: p.totalCost,
      paymentTerms: p.paymentTerms,
      deliveryTimeline: p.deliveryTimeline,
      warranty: p.warranty,
      specialConditions: p.specialConditions
    }));
    
    const prompt = `${prompts.compareProposals}\n\nOriginal RFP:\n${JSON.stringify(rfpSummary, null, 2)}\n\nProposals:\n${JSON.stringify(proposalsSummary, null, 2)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    console.log('AI Response for proposal comparison:', jsonText.substring(0, 200));

    if (!jsonText || jsonText.trim() === '') {
      throw new Error('AI returned empty response');
    }
    
    const comparisonData = JSON.parse(jsonText);
    
    return {
      success: true,
      data: comparisonData
    };
  } catch (error) {
    console.error('Error comparing proposals:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        comparison: proposals.map(p => ({
          vendorId: p.vendor.id,
          vendorName: p.vendor.name,
          complianceScore: 0,
          priceScore: 0,
          deliveryScore: 0,
          overallScore: 0,
          pros: [],
          cons: [],
          deviations: []
        })),
        recommendation: {
          recommendedVendorId: null,
          reasoning: 'Unable to generate comparison due to an error.'
        },
        summary: 'Comparison failed.'
      }
    };
  }
}


async function generateStatusEmail(proposal, rfp, vendor, status) {
  try {
    const prompt = `Generate a professional email to notify a vendor about their proposal status.

RFP Details:
- Title: ${rfp.title}
- Description: ${rfp.description}

Vendor: ${vendor.name}
Contact Person: ${vendor.contactPerson || 'Sir/Madam'}

Proposal Details:
- Total Cost: $${proposal.totalCost}
- Delivery Timeline: ${proposal.deliveryTimeline}
- Payment Terms: ${proposal.paymentTerms}

Status: ${status.toUpperCase()}

Instructions:
- If ACCEPTED: Write a warm, professional congratulatory email. Mention next steps like contract signing.
- If REJECTED: Write a polite, respectful email thanking them for their time. Be diplomatic.
- Keep it concise (3-4 paragraphs)
- Professional but friendly tone
- Include specific details from their proposal
- Sign off as "Procurement Team"

Return ONLY the email body text, no subject line, no JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailBody = response.text().trim();

    return {
      success: true,
      emailBody: emailBody
    };
  } catch (error) {
    console.error('Error generating status email:', error);

    let errorMessage = error.message;
    if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
      errorMessage = 'AI quota exceeded. Daily limit reached (20 requests/day). Please try again tomorrow or compose email manually.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

module.exports = {
  convertNLToRFP,
  parseVendorResponse,
  compareProposals,
  generateStatusEmail
};
