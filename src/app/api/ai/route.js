import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// POST handler
export async function POST(request) {
  try {
    const body = await request.json();
    const { age, weight, height, gender } = body;

    // Validate input
    if (!age || !weight || !height || !gender) {
      return NextResponse.json(
        { error: "Missing required fields: age, weight, height, gender" },
        { status: 400 }
      );
    }

    // Check for OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Call AI
    const aiResponse = await callAI({ age, weight, height, gender });

    return NextResponse.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Calls OpenAI and formats the result
async function callAI({ age, weight, height, gender }) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze the following health data: 
Age: ${age}, Weight: ${weight}kg, Height: ${height}cm, Gender: ${gender}. 

Return a JSON object with:
- message: brief analysis
- bmi: calculated BMI value
- bmiCategory: underweight/normal/overweight/obese
- recommendations: array of 3-4 health tips`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const rawMessage = completion.choices[0].message.content;

    // Try parsing AI response as JSON
    try {
      const parsed = JSON.parse(rawMessage);
      return {
        message: parsed.message ?? rawMessage,
        bmi: parsed.bmi,
        bmiCategory: parsed.bmiCategory,
        recommendations: parsed.recommendations,
      };
    } catch (parseError) {
      // Fallback if response isn't JSON
      return {
        message: "",
        bmi: "",
        bmiCategory: "",
        recommendations: "",
      };
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "",
      bmi: "",
      bmiCategory: "",
      recommendations: "",
    };
  }
}
