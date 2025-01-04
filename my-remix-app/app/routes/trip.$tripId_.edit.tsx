/* eslint-disable import/no-unresolved */

import { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { globalHttpHeaders } from "~/constants/apiEndPointHeaders";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const tripId = params.tripId;
  const formData = await request.formData();
  const votes = formData.get("votes")?.toString();

  // Check for required fields
  if (!votes) {
    throw new Response("Missing required fields", { status: 400 });
  }

  const apiUrl = process.env.STRAPI_API_URL;
  if (!apiUrl) {
    throw new Response("STRAPI_API_URL is not defined", { status: 500 });
  }

  const response = await fetch(`${apiUrl}/updatetripvotes/${tripId}`, {
    method: "POST",
    headers: {
      ...globalHttpHeaders,
    },
    body: JSON.stringify({
      votes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to create trip:", errorText);
    throw new Response("Failed to create trip", { status: response.status });
  }

  const tripData = await response.json();
  return redirect(`/trip/${tripData.id}`);
};
