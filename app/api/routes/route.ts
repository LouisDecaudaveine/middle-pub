import { NextRequest, NextResponse } from "next/server";
import type {
  GoogleComputeRoutesRequest,
  GoogleComputeRoutesResponse,
  GoogleRouteRequestParams,
  GoogleRouteAPIResponse,
} from "@/types/routes";

const GOOGLE_ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

export async function POST(
  request: NextRequest
): Promise<NextResponse<GoogleRouteAPIResponse>> {
  try {
    const apiKey = process.env.NEXT_PRIVATE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Google Maps API key is not configured" },
        { status: 500 }
      );
    }

    const params: GoogleRouteRequestParams = await request.json();

    // Validate required parameters
    if (
      params.originLat === undefined ||
      params.originLng === undefined ||
      params.destinationLat === undefined ||
      params.destinationLng === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: originLat, originLng, destinationLat, destinationLng",
        },
        { status: 400 }
      );
    }

    // Build the request body for Google Routes API
    const travelMode = params.travelMode ?? "WALK";
    const requestBody: GoogleComputeRoutesRequest = {
      origin: {
        location: {
          latLng: {
            latitude: params.originLat,
            longitude: params.originLng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: params.destinationLat,
            longitude: params.destinationLng,
          },
        },
      },
      travelMode,
      computeAlternativeRoutes: params.computeAlternativeRoutes ?? false,
      units: params.units ?? "METRIC",
      languageCode: "en-GB",
    };

    // routingPreference is only valid for DRIVE and TWO_WHEELER modes
    // It must NOT be set for TRANSIT, WALK, or BICYCLE
    if (
      params.routingPreference &&
      (travelMode === "DRIVE" || travelMode === "TWO_WHEELER")
    ) {
      requestBody.routingPreference = params.routingPreference;
    }

    // Add route modifiers if specified
    if (params.avoidTolls || params.avoidHighways || params.avoidFerries) {
      requestBody.routeModifiers = {
        avoidTolls: params.avoidTolls ?? false,
        avoidHighways: params.avoidHighways ?? false,
        avoidFerries: params.avoidFerries ?? false,
      };
    }

    // Define field mask for the response
    // We request commonly needed fields - you can adjust based on your needs
    const fieldMask = [
      "routes.duration",
      "routes.distanceMeters",
      "routes.polyline.encodedPolyline",
      "routes.legs.duration",
      "routes.legs.distanceMeters",
      "routes.legs.startLocation",
      "routes.legs.endLocation",
      "routes.legs.steps.distanceMeters",
      "routes.legs.steps.staticDuration",
      "routes.legs.steps.polyline.encodedPolyline",
      "routes.legs.steps.navigationInstruction",
      "routes.legs.steps.travelMode",
      // Transit-specific fields (populated when travelMode is TRANSIT)
      "routes.legs.steps.transitDetails",
      "routes.legs.localizedValues",
      "routes.localizedValues",
      "routes.viewport",
    ].join(",");

    const response = await fetch(GOOGLE_ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Google Routes API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: `Google Routes API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data: GoogleComputeRoutesResponse = await response.json();
    console.log("response data", data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in routes API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
