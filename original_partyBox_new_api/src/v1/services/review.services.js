const { rate_review } = require("../models");
const { getCurrentTimestamp } = require("../utils");
const tableConfig = require("../database/table.config.json");

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
  let response = await rate_review.create(data);
  return response;
};

exports.getReviews = async (dealId, userId) => {
  let userReviews = [];
  let otherReviews = [];
  let limit = 10;
  if (userId && !isNaN(userId)) {
    let userReviewsQuery = `SELECT id, rating, review_description, created_date FROM ${tableConfig.rate_review} WHERE user_id = ${userId} AND type_id = ${dealId} ORDER BY created_date DESC LIMIT 10;`;
    userReviews = await global?.SEQUELIZE?.query(userReviewsQuery, {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
    });

    if (userReviews.length < 10) {
      limit = limit - userReviews.length;
    }
  }
  if (limit && limit > 0) {
    let userReviewsQuery = `SELECT id, rating, review_description, created_date, ${tableConfig.users}.firstname, ${tableConfig.users}.lastname FROM ${tableConfig.rate_review} JOIN ${tableConfig.users} ON ${tableConfig.users}.user_id = ${tableConfig.rate_review}.user_id WHERE ${tableConfig.rate_review}.type_id = ${dealId} ORDER BY created_date DESC LIMIT ${limit};`;

    if (userId && !isNaN(userId)) {
      userReviewsQuery = `SELECT id, rating, review_description, created_date, ${tableConfig.users}.firstname, ${tableConfig.users}.lastname FROM ${tableConfig.rate_review} JOIN ${tableConfig.users} ON ${tableConfig.users}.user_id = ${tableConfig.rate_review}.user_id WHERE ${tableConfig.rate_review}.user_id != ${userId} AND ${tableConfig.rate_review}.type_id = ${dealId} ORDER BY created_date DESC LIMIT ${limit};`;
    }

    otherReviews = await global?.SEQUELIZE?.query(userReviewsQuery, {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
    });
  }
  return { myReviews: userReviews, othersReview: otherReviews };
};
