/* eslint-disable import/no-unresolved */
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { globalHttpHeaders } from "~/constants/apiEndPointHeaders";
import { Trip } from "~/types/trip";
import { formatDateToMMDDYYYY } from "~/helpers/dateformat";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const response = await fetch(
    `${process.env.STRAPI_API_URL}/findtrip/${params.tripId}`,
    {
      headers: {
        ...globalHttpHeaders,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch data from Strapi");
  }
  const data = await response.json();
  return json(data);
};

export const meta: MetaFunction = ({ data }) => {
  const tripData = data as Trip; // Type assertion here

  const title = tripData?.title || "Default trip Title";
  const description = tripData?.description || "Default description";
  const image = tripData?.cover?.url || "https://example.com/default-cover.jpg";

  return [
    { title: title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
  ];
};

export default function Mytrip() {
  const trip = useLoaderData<Trip>();

  return (
    <div className="container my-4 md:my-12 mx-auto px-4 md:px-12 flex flex-col gap-[40px]">
      <img
        src={
          trip.cover?.url
            ? `http://localhost:1337${trip.cover?.url}`
            : "https://cdn.pixabay.com/photo/2016/03/08/20/03/flag-1244649_1280.jpg"
        }
        alt={trip?.title}
        className="block h-auto w-full max-h-[400px] object-cover rounded-3xl"
      />
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-col justify-between items-start gap-[10px] md:flex-row md:items-center">
          <h1 className="text-5xl font-bold">{trip?.title}</h1>
          <Form method="post" action={`/trip/${trip.id}/edit`}>
            <input type="hidden" name="votes" value={Number(trip.votes) + 1} />{" "}
            <button
              onSubmit={(event) => {
                if (!confirm("Please confirm you want to update the vote.")) {
                  event.preventDefault();
                }
              }}
              type="submit"
              className={`flex flex-row justify-between items-center gap-[10px]`}
            >
              <i
                className={`${
                  Number(trip.votes) > 0 ? "text-red-500" : "text-black-700"
                }  fa fa-heart text-lg  hover:text-red-700 `}
              ></i>
              <p className="text-md text-black-700 font-bold">
                {trip.votes ?? 0}
              </p>
            </button>
          </Form>
        </div>
        <div className="flex flex-row gap-[10px]  items-start">
          <p className="text-lg font-semibold"> {trip.category.title}</p>
          <p className="text-lg"> -</p>
          <p className="text-lg opacity-50 ">
            {" "}
            {formatDateToMMDDYYYY(trip.createdAt)}
          </p>
        </div>
        <div className="flex items-end no-underline hover:underline text-black"></div>
        <div className="flex flex-col gap-[10px] mt-[30px]">
          <p className="text-lg">{trip?.description}</p>
        </div>
      </div>
    </div>
  );
}
