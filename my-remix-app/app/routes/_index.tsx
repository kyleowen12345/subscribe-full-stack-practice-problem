/* eslint-disable import/no-unresolved */
import { json, LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { globalHttpHeaders } from "~/constants/apiEndPointHeaders";
import { formatDateToMMDDYYYY } from "~/helpers/dateformat";
import { Trip } from "~/types/trip";

export const meta: MetaFunction = () => {
  return [
    { title: "My Skill Assessment" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async () => {
  const apiUrl = process.env.STRAPI_API_URL;

  if (!apiUrl) {
    throw new Error("Environment variable STRAPI_API_URL is not set");
  }

  // Get the token from cookies

  try {
    const response = await fetch(`${apiUrl}/findtrips`, {
      method: "GET",
      headers: {
        ...globalHttpHeaders,
      },
    });

    if (!response.ok) {
      throw new Response("Failed to fetch data from Strapi", {
        status: response.status,
      });
    }

    const data = await response.json();

    // Ensure data is serializable to JSON to prevent hydration issues
    return json(data);
  } catch (error) {
    console.error("Error fetching data from Strapi:", error);
    throw new Response("An error occurred while fetching trips", {
      status: 500,
    });
  }
};

export default function Index() {
  const data = useLoaderData<Trip[]>();

  return (
    <div className="container my-4 md:my-12 mx-auto px-4 md:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((trip: Trip) => (
          <a href={`/trip/${trip.id}`} key={trip.id} className="w-full">
            <article className="overflow-hidden rounded-lg shadow-lg">
              {/* <a href="/"> */}
              <img
                alt={trip.title}
                className="block h-auto w-full min-h-[300px] max-h-[300px] object-cover"
                src={
                  trip.cover?.url
                    ? `http://localhost:1337${trip.cover?.url}`
                    : "https://cdn.pixabay.com/photo/2016/03/08/20/03/flag-1244649_1280.jpg"
                }
              />
              {/* </a> */}

              <header className="flex items-start justify-between leading-tight p-4 min-h-[40px] gap-10">
                <h1 className="text-lg">
                  <p
                    className="no-underline hover:underline text-black line-clamp-1 font-bold"
                    // href="/"
                  >
                    {trip.title}
                  </p>
                </h1>
                <p className="text-grey-darker text-xs pt-2 opacity-50">
                  {formatDateToMMDDYYYY(trip.createdAt)}
                </p>
              </header>

              <footer className="flex items-center justify-between leading-none p-4">
                <div
                  className="flex items-center no-underline hover:underline text-black"
                  // href="/"
                >
                  <p className=" text-sm font-semibold opacity-50">
                    {trip.category.title}
                  </p>
                </div>
                <div
                  className=" flex items-center gap-[5px] no-underline text-grey-darker hover:text-red-dark"
                  // href="/"
                >
                  <span className="hidden">Like</span>
                  <div
                    className={`${
                      Number(trip.votes) > 0 ? "text-red-500" : "text-black-700"
                    } hover:text-red-700`}
                  >
                    <i className="fa fa-heart"></i>
                  </div>

                  <p className="text-xs">{trip.votes ?? 0}</p>
                </div>
              </footer>
            </article>
          </a>
        ))}
      </div>
    </div>
  );
}
