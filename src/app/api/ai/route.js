// import { NextResponse } from "next/server";
// import { OpenAI } from "openai";

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { age, weight, height, gender } = body;

//     // Validate input
//     if (!age || !weight || !height || !gender) {
//       return NextResponse.json(
//         { error: "Missing required fields: age, weight, height, gender" },
//         { status: 400 }
//       );
//     }

//     // Check if OpenAI API key is configured
//     if (!process.env.OPENAI_API_KEY) {
//       return NextResponse.json(
//         { error: "OpenAI API key not configured" },
//         { status: 500 }
//       );
//     }

//     // Here you would integrate with your AI service
//     // For example, OpenAI, Anthropic, or any other AI provider
//     const aiResponse = await callAI({
//       age,
//       weight,
//       height,
//       gender,
//     });

//     return NextResponse.json({
//       success: true,
//       data: aiResponse,
//     });
//   } catch (error) {
//     console.error("AI endpoint error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// async function callAI(userData) {
//   try {
//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "user",
//           content: `Analyze this health data and provide a structured response: Age: ${userData.age}, Weight: ${userData.weight}kg, Height: ${userData.height}cm, Gender: ${userData.gender}.

//           Please provide:
//           1. A brief health analysis
//           2. BMI calculation and interpretation
//           3. 3-4 specific health recommendations

//           Format your response as a JSON object with these fields:
//           - message: brief analysis
//           - bmi: calculated BMI value
//           - bmiCategory: underweight/normal/overweight/obese
//           - recommendations: array of 3-4 recommendations`,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 500,
//     });

//     const aiMessage = completion.choices[0].message.content;

//     // Try to parse JSON response, fallback to structured format if parsing fails
//     try {
//       const parsedResponse = JSON.parse(aiMessage);
//       return {
//         message: parsedResponse.message || aiMessage,
//         bmi:
//           parsedResponse.bmi || calculateBMI(userData.weight, userData.height),
//         bmiCategory:
//           parsedResponse.bmiCategory ||
//           getBMICategory(calculateBMI(userData.weight, userData.height)),
//         recommendations: parsedResponse.recommendations || [
//           "Maintain a balanced diet",
//           "Exercise regularly",
//           "Get adequate sleep",
//           "Stay hydrated",
//         ],
//       };
//     } catch (parseError) {
//       // If AI response isn't valid JSON, use the raw message with calculated BMI
//       return {
//         message: aiMessage,
//         bmi: calculateBMI(userData.weight, userData.height),
//         bmiCategory: getBMICategory(
//           calculateBMI(userData.weight, userData.height)
//         ),
//         recommendations: [
//           "Maintain a balanced diet",
//           "Exercise regularly",
//           "Get adequate sleep",
//           "Stay hydrated",
//         ],
//       };
//     }
//   } catch (error) {
//     console.error("OpenAI API error:", error);
//     // Fallback to mock response if OpenAI fails
//     // return {
//     //   message: `Health analysis for ${userData.gender}, age ${userData.age}: Based on your weight of ${userData.weight}kg and height of ${userData.height}cm, here are some recommendations...`,
//     //   bmi: calculateBMI(userData.weight, userData.height),
//     //   bmiCategory: getBMICategory(
//     //     calculateBMI(userData.weight, userData.height)
//     //   ),
//     //   recommendations: [
//     //     "Maintain a balanced diet",
//     //     "Exercise regularly",
//     //     "Get adequate sleep",
//     //     "Stay hydrated",
//     //   ],
//     // };
//   }
// }

// // function calculateBMI(weight, height) {
// //   const heightInMeters = height / 100;
// //   return (weight / (heightInMeters * heightInMeters)).toFixed(1);
// // }

// // function getBMICategory(bmi) {
// //   const bmiNum = parseFloat(bmi);
// //   if (bmiNum < 18.5) return "underweight";
// //   if (bmiNum < 25) return "normal";
// //   if (bmiNum < 30) return "overweight";
// //   return "obese";
// // }

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

// // Calculate BMI (Body Mass Index)
// function calculateBMI(weight, height) {
//   const heightInMeters = height / 100;
//   const bmi = weight / (heightInMeters * heightInMeters);
//   return bmi.toFixed(1);
// }

// // Determine BMI Category
// function getBMICategory(bmi) {
//   const value = parseFloat(bmi);
//   if (value < 18.5) return "underweight";
//   if (value < 25) return "normal";
//   if (value < 30) return "overweight";
//   return "obese";
// }

// // Default fallback recommendations
// // function getDefaultRecommendations() {
// //   return [
// //     "Maintain a balanced diet",
// //     "Exercise regularly",
// //     "Get adequate sleep",
// //     "Stay hydrated",
// //   ];
// // }
