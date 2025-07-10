import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
  credentials: process.env.FAL_API_CREDENTIALS!,
});

export async function GET() {
  console.log(
    "FAL_API_CREDENTIALS:",
    process.env.FAL_API_CREDENTIALS ? "Set" : "Not set"
  );

  try {
    // Use FLUX LoRA endpoint
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: "dog3 , doge world leader with suit on ",
        loras: [
          {
            path: "https://huggingface.co/ashabkhan123/doge/resolve/main/dog3.safetensors",
            scale: 0.7,
          },
        ],

        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true, // Enable logs for debugging
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
      },
    });

    console.log("FAL result:", result);

    // FLUX returns images in a different format
    const imageUrl = result.data?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image URL found in result:", result);
      return NextResponse.json(
        { success: false, error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: imageUrl,
    });
  } catch (error) {
    console.error("FAL API Error:", error);

    // More detailed error handling
    const errorMessage =
      error instanceof Error ? error.message : "Generation failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
