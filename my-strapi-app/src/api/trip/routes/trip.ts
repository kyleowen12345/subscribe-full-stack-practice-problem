export default {
  routes: [
    {
      method: "GET",
      path: "/findtrips", // Custom endpoint for all articles
      handler: "api::trip.trip.findtrips", // Points to the custom controller method
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/findtrip/:id", // Custom endpoint for a single article
      handler: "api::trip.trip.findtrip", // Points to the custom controller method
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "POST",
      path: "/createtrip",
      handler: "api::trip.trip.createtrip",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/updatetripvotes/:id",
      handler: "api::trip.trip.updatetripvotes",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/updatetripcover/:id",
      handler: "api::trip.trip.updatetripcover",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
