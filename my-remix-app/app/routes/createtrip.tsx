/* eslint-disable import/no-unresolved */
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import { globalHttpHeaders } from "~/constants/apiEndPointHeaders";
import { CreateTripSelectOptionsType } from "~/types/app";
import { Category } from "~/types/category";

export const meta: MetaFunction = () => {
  return [
    { title: "Create trip" },
    { name: "description", content: "Create your new trip" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const location = formData.get("location")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const coverImage = formData.get("coverImage") as File | null;

  // Check for required fields
  if (!title || !description || !location || !categoryId) {
    throw new Response("Missing required fields", { status: 400 });
  }

  const apiUrl = process.env.STRAPI_API_URL;
  if (!apiUrl) {
    throw new Response("STRAPI_API_URL is not defined", { status: 500 });
  }

  // Step 1: Create the trip
  const createTripResponse = await fetch(`${apiUrl}/createtrip`, {
    method: "POST",
    headers: {
      ...globalHttpHeaders,
    },
    body: JSON.stringify({
      title,
      description,
      location,
      categoryId,
    }),
  });

  if (!createTripResponse.ok) {
    const errorText = await createTripResponse.text();
    console.error("Failed to create trip:", errorText);
    throw new Response("Failed to create trip", {
      status: createTripResponse.status,
    });
  }

  const tripData = await createTripResponse.json();
  let tripId = tripData?.id;

  // Step 2: Upload the cover photo if provided
  if (coverImage) {
    const coverFormData = new FormData();
    coverFormData.append("cover", coverImage);

    // Debugging to see if the file is being appended correctly

    const uploadCoverResponse = await fetch(
      `${apiUrl}/updatetripcover/${tripId}`,
      {
        method: "POST",
        body: coverFormData,
      }
    );
    const newTripData = await uploadCoverResponse.json();
    tripId = newTripData?.id;
    if (!uploadCoverResponse.ok) {
      const errorText = await uploadCoverResponse.text();
      console.error("Failed to upload cover image:", errorText);
      throw new Response("Failed to upload cover image", {
        status: uploadCoverResponse.status,
      });
    }
  }

  return redirect(`/trip/${tripId}`);
};

export const loader = async () => {
  const [categoriesResponse] = await Promise.all([
    fetch(`${process.env.STRAPI_API_URL}/categories`),
  ]);

  if (!categoriesResponse.ok) {
    throw new Error("Failed to fetch data from Strapi");
  }

  const categoriesData = await categoriesResponse.json();

  return json({
    categories: categoriesData?.data,
  });
};

export default function Createtrip() {
  const data = useLoaderData<CreateTripSelectOptionsType>();
  return (
    <div className="container my-4 md:my-12 mx-auto px-4 md:px-12">
      <h1 className="text-2xl font-bold mb-4">Create a New trip</h1>

      <Form method="post" encType="multipart/form-data">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-semibold">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-semibold">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-semibold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-sm font-semibold">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="mt-1 p-2 w-full border rounded"
          >
            <option value="">Select a category</option>
            {data?.categories?.map((i: Category) => (
              <option key={i?.id} value={i?.id}>
                {i?.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="coverImage" className="block text-sm font-semibold">
            Cover Image
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create trip
        </button>
      </Form>
    </div>
  );
}
