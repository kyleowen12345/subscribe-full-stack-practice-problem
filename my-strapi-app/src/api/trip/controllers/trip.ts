/**
 * trip controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::trip.trip",
  ({ strapi }) => ({
    async findtrips(ctx) {
      try {
        const trips = await strapi.entityService.findMany("api::trip.trip", {
          populate: {
            cover: true,
            category: true,
          } as const,
        });
        ctx.body = trips;
      } catch (error) {
        console.error(error);
        ctx.throw(500, "An error occurred while fetching trips");
      }
    },

    async findtrip(ctx) {
      const { id } = ctx.params;

      try {
        const trip = await strapi.entityService.findOne("api::trip.trip", id, {
          populate: {
            cover: true,
            category: true,
          },
        });

        if (!trip) {
          return ctx.notFound("trip not found");
        }

        ctx.body = trip;
      } catch (error) {
        console.error(error); // Log the error for debugging
        ctx.throw(500, "An error occurred while fetching the populated trip");
      }
    },

    async createtrip(ctx) {
      try {
        // Access form data (text fields)
        const { title, location, description, categoryId } = ctx.request.body;

        // Ensure the required fields are present
        if (!title || !description || !location || !categoryId) {
          return ctx.badRequest(
            "Missing required fields: title, description, location, or categoryId"
          );
        }

        const categoryExists = await strapi.entityService.findOne(
          "api::category.category",
          categoryId
        );

        if (!categoryExists) {
          return ctx.badRequest("Category does not exist");
        }

        // Use the ID of the default cover image if no cover image is uploaded

        // Create the trip with the data and default cover image
        const newtrip = await strapi.entityService.create("api::trip.trip", {
          data: {
            title,
            location,
            description,
            category: categoryExists.id, // Category ID
            votes: 0,
          },
        });

        // Return the created trip
        ctx.body = newtrip;
      } catch (error) {
        console.error(error); // Log the error for debugging
        ctx.throw(500, "An error occurred while creating the trip");
      }
    },

    async updatetripvotes(ctx) {
      const { id } = ctx.params;

      // Fetch the trip to be updated
      const trip = await strapi.entityService.findOne("api::trip.trip", id, {
        populate: ["cover", "category"],
      });

      if (!trip) {
        return ctx.notFound("trip not found");
      }

      // Extract data from the request (from form data or JSON body)
      const { votes } = ctx.request.body;

      // Check if required fields are provided
      if (!votes) {
        return ctx.badRequest("Missing required fields");
      }

      // Update trip data
      const updatedtrip = await strapi.entityService.update(
        "api::trip.trip",
        id,
        {
          data: {
            votes: votes,
          },
        }
      );

      // Return the updated trip data
      ctx.body = updatedtrip;
    },

    async updatetripcover(ctx) {
      const { id } = ctx.params;

      // Fetch the trip to be updated
      const trip = await strapi.entityService.findOne("api::trip.trip", id, {
        populate: ["cover", "category"],
      });

      if (!trip) {
        return ctx.notFound("Trip not found");
      }

      // Extract files from the form-data payload
      const { files } = ctx.request;

      // Check if a cover image is provided
      if (!files?.cover) {
        return ctx.badRequest("Missing required cover image");
      }

      // Upload the new cover image
      const uploadedFile = await strapi.plugins[
        "upload"
      ].services.upload.upload({
        data: {}, // Metadata if needed
        files: files.cover, // The file from the form data
      });

      // Update the trip with the new cover image ID
      const updatedTrip = await strapi.entityService.update(
        "api::trip.trip",
        id,
        {
          data: {
            cover: uploadedFile[0].id, // Assign the uploaded file's ID to cover field
          },
        }
      );

      // Return the updated trip data
      ctx.body = updatedTrip;
    },
  })
);
