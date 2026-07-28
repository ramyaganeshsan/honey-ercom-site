const JOI = require("joi");

exports.getProductsSchema = {
  query: {
    name: JOI.string().allow(null, "").label("Product name"), // Product
    m_c: JOI.number().allow(null, "").label("Main category"), // Main category
    s_c: JOI.number().allow(null, "").label("Sub category"), // Sub category
    sl_c: JOI.number().allow(null, "").label("Second level category"), // Second level category.
    sort_by: JOI.string()
      .valid("mintomax", "maxtomin", "newest", "oldest")
      .allow(null, "")
      .label("Sort By"),
    min: JOI.number().allow(null, "").label("Minimum price"), // Price filter minimum price
    max: JOI.number().allow(null, "").label("Maximum price"), // Price filter maximum price
    pageNumber: JOI.number().allow(null, "").label("Page number"), // Pagination
    pageSize: JOI.number().allow(null, "").label("Page size"), // Page size
    rate_review: JOI.string().allow(null, "").label("Ratings"), // Ratings filter
    refetch_data: JOI.any(),
  },
};

exports.getProductDetailsSchema = {
  query: {
    deal_key: JOI.string().required().label("Product ID"),
  },
};
