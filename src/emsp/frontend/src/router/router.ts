import auth_controller from "@/controllers/authorization_controller";
import { createRouter, createWebHistory } from "vue-router";
import RoutingPath from "./routing_path";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: RoutingPath.BASE,
            name: "base",
            redirect: "/auth",
        },
        {
            path: RoutingPath.HOME,
            name: "home",
            component: () => import("../views/HomeView.vue"),
            meta: {
                requireAuth: true,
            },
        },
        {
            path: RoutingPath.AUTH,
            name: "auth",
            component: () => import("../views/AuthView.vue"),
        },
        {
            path: RoutingPath.BOOKINGLIST,
            name: "my-bookings",
            component: () => import("../views/BookingsView.vue"),
        },
        {
            path: RoutingPath.SEARCH,
            name: "search",
            component: () => import("../views/SearchView.vue"),
        },
        {
            path: RoutingPath.CSDETAILS,
            name: "cs-details",
            component: () => import("../views/CSDetailsView.vue"),
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            redirect: "/home",
        }
    ],
});

/// Router guard to check if user is authenticated
router.beforeEach((to, from, next) => {

    let isAutheticated = auth_controller.isAuthenticated.value;
    console.log("isAutheticatedGuard", isAutheticated);
    if (to.meta.requireAuth && !isAutheticated) return next("/auth");
    if (to.name === "auth" && isAutheticated) return next("/home");
    return next();
});

export default router;
