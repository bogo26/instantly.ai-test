import { knex } from "../db/index.js";
import { OpenAI } from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: "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", // In production, use environment variables
});

export default async function routes(fastify, options) {
  // Enable CORS manually - more comprehensive implementation
  fastify.addHook("onRequest", (request, reply, done) => {
    // Set CORS headers
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      reply.code(204).send();
      return;
    }

    done();
  });

  // Handle OPTIONS requests explicitly for all routes
  fastify.options("*", async (request, reply) => {
    return reply.code(204).send();
  });

  // Basic health check route
  fastify.get("/ping", async (request, reply) => {
    return "pong\n";
  });

  // Get all emails
  fastify.get("/api/emails", async (request, reply) => {
    try {
      const emails = await knex("emails")
        .select("*")
        .orderBy("created_at", "desc");
      return emails;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch emails" });
    }
  });

  // Get a specific email by ID
  fastify.get("/api/emails/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const email = await knex("emails").select("*").where("id", id).first();
      if (!email) {
        reply.status(404).send({ error: "Email not found" });
        return;
      }
      return email;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch email" });
    }
  });

  // Create a new email
  fastify.post("/api/emails", async (request, reply) => {
    const { to, cc, bcc, subject, body } = request.body;

    try {
      const [id] = await knex("emails").insert({
        to,
        cc,
        bcc,
        subject,
        body,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const newEmail = await knex("emails").where("id", id).first();
      return newEmail;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to create email" });
    }
  });

  // AI router assistant endpoint
  fastify.post("/api/ai/route", async (request, reply) => {
    const { prompt } = request.body;

    try {
      // Use OpenAI to determine the assistant type based on the prompt
      const routerResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a router assistant. Your job is to determine which specialized assistant should handle an email request based on the description.
            
            There are two possible assistants:
            1. Sales Assistant - For generating sales emails, product offerings, proposals, etc.
            2. Follow-up Assistant - For generating polite follow-up emails, checking in, status updates, etc.
            
            You must reply ONLY with the assistant type as a JSON object with a single key "assistantType" and a value of either "sales" or "followup".`,
          },
          {
            role: "user",
            content: `Based on this email description, which assistant should handle it: "${prompt}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
        response_format: { type: "json_object" },
      });

      // Parse the response
      const responseContent = routerResponse.choices[0].message.content;
      const parsedResponse = JSON.parse(responseContent);

      return { assistantType: parsedResponse.assistantType };
    } catch (error) {
      // Fallback to the simple keyword-based logic if the API call fails
      console.error("OpenAI API error:", error);

      let assistantType = "sales";

      const followUpKeywords = [
        "follow",
        "checking",
        "update",
        "progress",
        "status",
      ];
      const salesKeywords = [
        "sales",
        "offer",
        "promotion",
        "proposal",
        "quote",
        "product",
        "service",
      ];

      const promptLower = prompt.toLowerCase();

      // Count matches for each type
      const followUpMatches = followUpKeywords.filter((keyword) =>
        promptLower.includes(keyword)
      ).length;
      const salesMatches = salesKeywords.filter((keyword) =>
        promptLower.includes(keyword)
      ).length;

      // Determine the assistant type
      if (followUpMatches > salesMatches) {
        assistantType = "followup";
      }

      return { assistantType };
    }
  });

  // AI email generation endpoint
  fastify.post("/api/ai/generate", async (request, reply) => {
    const { prompt, assistantType } = request.body;

    try {
      let systemPrompt = "";

      if (assistantType === "sales") {
        systemPrompt = `You are a Sales Assistant specializing in generating concise, effective sales emails.
        
        Guidelines:
        - Keep the email under 40 words total so it can be read in under 10 seconds
        - Use 7-10 words per sentence maximum
        - Be persuasive but not pushy
        - Focus on value proposition and clear call to action
        - Tailor the message to the recipient's likely needs based on the prompt
        - Generate both a subject line and email body
        - Subject line should be attention-grabbing but not clickbait
        
        Your output must be a JSON object with two fields:
        - "subject": A concise, compelling subject line
        - "body": The email body text`;
      } else {
        systemPrompt = `You are a Follow-up Assistant specializing in generating polite, effective follow-up emails.
        
        Guidelines:
        - Keep the email concise and to the point
        - Be polite and professional
        - Don't be pushy but do include a clear next step
        - Reference the previous interaction implied by the prompt
        - Generate both a subject line and email body
        - Subject line should reference the follow-up nature clearly
        
        Your output must be a JSON object with two fields:
        - "subject": A clear subject line referencing the follow-up
        - "body": The email body text`;
      }

      // Generate email content using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate an email about: ${prompt}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      // Parse the response
      const content = JSON.parse(response.choices[0].message.content);

      return { subject: content.subject, body: content.body };
    } catch (error) {
      console.error("OpenAI API error:", error);

      // Fallback to simple templates if the API call fails
      let subject = "";
      let body = "";

      if (assistantType === "sales") {
        subject = `${prompt} - Special Offer`;
        body = `Hi there,

We've got an exciting offer for you regarding ${prompt}. Our solution will save you time and boost productivity. It's easy to implement and very cost-effective.

Would you like to schedule a quick call to discuss how we can help?

Best regards,
Sales Team`;
      } else {
        subject = `Following up on ${prompt}`;
        body = `Hello,

I hope you're doing well. I'm just checking in regarding our conversation about ${prompt}. 

Have you had a chance to review the information I sent? I'm available if you have any questions.

Looking forward to your response.

Best regards,
Follow-up Team`;
      }

      return { subject, body };
    }
  });

  // Note: Streaming functionality can be implemented in a future version
}
