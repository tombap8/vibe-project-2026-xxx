import { initCartBadges, initCartPage, initProductDetail } from "./shop.js";

initCartBadges();

if (document.body.dataset.shopPage === "detail") initProductDetail();
if (document.body.dataset.shopPage === "cart") initCartPage();
