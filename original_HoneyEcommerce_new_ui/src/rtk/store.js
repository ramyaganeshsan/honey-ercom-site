import { configureStore } from "@reduxjs/toolkit";

import { HomePageQuery } from "./networkcalls/homePage.query";
import { ProductsQuery } from "./networkcalls/product.query";
import { AuthQuery } from "./networkcalls/auth.query";
import { ReviewsQuery } from "./networkcalls/review.query";
import { ContactusQuery } from "./networkcalls/contactus.query";
import { WishlistQuery } from "./networkcalls/wishlist.query";
import { CartQuery } from "./networkcalls/cart.query";
import { CheckoutQuery } from "./networkcalls/checkout.query";
import { PromocodeQuery } from "./networkcalls/promocode.query";
import { CMSQuery } from "./networkcalls/cms.query";
import { CommonQuery } from "./networkcalls/common.query";
import { UsersQuery } from "./networkcalls/user.query";
import { OrdersQuery } from "./networkcalls/orders.query";
import { CheckoutTestQuery } from "./networkcalls/checkoutTest.query";

export default configureStore({
  reducer: {
    [HomePageQuery.reducerPath]: HomePageQuery.reducer,
    [ProductsQuery.reducerPath]: ProductsQuery.reducer,
    [AuthQuery.reducerPath]: AuthQuery.reducer,
    [ReviewsQuery.reducerPath]: ReviewsQuery.reducer,
    [ContactusQuery.reducerPath]: ContactusQuery.reducer,
    [WishlistQuery.reducerPath]: WishlistQuery.reducer,
    [CartQuery.reducerPath]: CartQuery.reducer,
    [CheckoutQuery.reducerPath]: CheckoutQuery.reducer,
    [CheckoutTestQuery.reducerPath]: CheckoutTestQuery.reducer,

    [PromocodeQuery.reducerPath]: PromocodeQuery.reducer,
    [CMSQuery.reducerPath]: CMSQuery.reducer,
    [CommonQuery.reducerPath]: CommonQuery.reducer,
    [UsersQuery.reducerPath]: UsersQuery.reducer,
    [OrdersQuery.reducerPath]: OrdersQuery.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(HomePageQuery.middleware)
      .concat(ProductsQuery.middleware)
      .concat(ReviewsQuery.middleware)
      .concat(ContactusQuery.middleware)
      .concat(WishlistQuery.middleware)
      .concat(CartQuery.middleware)
      .concat(CheckoutQuery.middleware)
      .concat(CheckoutTestQuery.middleware)

      .concat(PromocodeQuery.middleware)
      .concat(CMSQuery.middleware)
      .concat(CommonQuery.middleware)
      .concat(UsersQuery.middleware)
      .concat(OrdersQuery.middleware)
      .concat(AuthQuery.middleware),
});
