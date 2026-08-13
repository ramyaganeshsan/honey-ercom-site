const { getCurrentTimestamp } = require("../utils");
const { create, findAll } = require("../mongo/repo");

exports.addReview = async (body, currentUser) => {
  let data = {
    type_id: Number(body["type_id"]),
    rating: Number(body["rating"]),
    review_title: body["review_title"]?.trim(),
    review_description: body["review_description"]?.trim(),
    created_date: getCurrentTimestamp(),
    approved_user_id: 0,
    approve_status: 0,
    module_id: 2,
    user_id: currentUser.user_id,
  };
  let response = await create("rate_review", data);
  return response;
};

exports.getReviews = async (dealId, userId) => {
  let userReviews = [];
  let otherReviews = [];
  let limit = 10;

  if (userId && !isNaN(userId)) {
    userReviews = await findAll(
      "rate_review",
      { user_id: Number(userId), type_id: Number(dealId) },
      {
        attributes: ["id", "rating", "review_description", "created_date"],
        order: [["created_date", "DESC"]],
        limit: 10,
      }
    );

    if (userReviews.length < 10) {
      limit = limit - userReviews.length;
    }
  }

  if (limit && limit > 0) {
    const otherFilter = {
      type_id: Number(dealId),
    };
    if (userId && !isNaN(userId)) {
      otherFilter.user_id = { $ne: Number(userId) };
    }

    const reviews = await findAll("rate_review", otherFilter, {
      attributes: [
        "id",
        "rating",
        "review_description",
        "created_date",
        "user_id",
      ],
      order: [["created_date", "DESC"]],
      limit,
    });

    const userIds = [...new Set(reviews.map((r) => r.user_id))];
    const users =
      userIds.length > 0
        ? await findAll(
            "users",
            { user_id: { $in: userIds } },
            { attributes: ["user_id", "firstname", "lastname"] }
          )
        : [];
    const userMap = Object.fromEntries(
      users.map((u) => [u.user_id, u])
    );

    // Original SQL used JOIN — only return reviews that have a matching user
    otherReviews = reviews
      .filter((review) => userMap[review.user_id])
      .map((review) => ({
        id: review.id,
        rating: review.rating,
        review_description: review.review_description,
        created_date: review.created_date,
        firstname: userMap[review.user_id].firstname,
        lastname: userMap[review.user_id].lastname,
      }));
  }

  return { myReviews: userReviews, othersReview: otherReviews };
};
