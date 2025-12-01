(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/music-club-frontend (2)/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "apiClient",
    ()=>apiClient,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
class ApiClient {
    baseUrl;
    token = null;
    constructor(baseUrl){
        this.baseUrl = baseUrl;
        if ("TURBOPACK compile-time truthy", 1) {
            this.token = localStorage.getItem("auth_token");
        }
    }
    setToken(token) {
        this.token = token;
        if ("TURBOPACK compile-time truthy", 1) {
            if (token) {
                localStorage.setItem("auth_token", token);
                // Also set cookie for middleware
                document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
            } else {
                localStorage.removeItem("auth_token");
                // Remove cookie
                document.cookie = "auth_token=; path=/; max-age=0";
            }
        }
    }
    getToken() {
        return this.token;
    }
    async request(endpoint, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });
        if (options.headers && options.headers.responseType === "blob") {
            if (!response.ok) {
                throw new Error("Export failed");
            }
            return {
                success: true,
                data: await response.blob()
            };
        }
        // Try to parse JSON safely; if parsing fails, keep raw text
        let parsedBody = null;
        try {
            parsedBody = await response.json();
        } catch (e) {
            try {
                parsedBody = await response.text();
            } catch (e2) {
                parsedBody = null;
            }
        }
        if (!response.ok) {
            // Throw a structured error so callers can log status and body
            throw {
                status: response.status,
                statusText: response.statusText,
                body: parsedBody
            };
        }
        return parsedBody;
    }
    async get(endpoint, params) {
        const query = params ? `?${new URLSearchParams(params).toString()}` : "";
        return this.request(`${endpoint}${query}`, {
            method: "GET"
        });
    }
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(body)
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE"
        });
    }
    // Authentication
    async login(email, password) {
        const response = await this.post("/login", {
            email,
            password
        });
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    }
    async logout() {
        try {
            await this.post("/logout");
        } finally{
            this.setToken(null);
        }
    }
    // Users & Roles
    getUsers(params) {
        return this.get("/users", params);
    }
    getUser(id) {
        return this.get(`/users/${id}`);
    }
    createUser(data) {
        return this.post("/users", data);
    }
    updateUser(id, data) {
        return this.put(`/users/${id}`, data);
    }
    deleteUser(id) {
        return this.delete(`/users/${id}`);
    }
    getRoles() {
        return this.get("/roles");
    }
    createRole(data) {
        return this.post("/roles", data);
    }
    updateRole(id, data) {
        return this.put(`/roles/${id}`, data);
    }
    deleteRole(id) {
        return this.delete(`/roles/${id}`);
    }
    // Departments
    getDepartments() {
        return this.get("/departments");
    }
    getDepartment(id) {
        return this.get(`/departments/${id}`);
    }
    createDepartment(data) {
        return this.post("/departments", data);
    }
    updateDepartment(id, data) {
        return this.put(`/departments/${id}`, data);
    }
    deleteDepartment(id) {
        return this.delete(`/departments/${id}`);
    }
    // Classes
    getClasses() {
        return this.get("/myclasses");
    }
    getClass(id) {
        return this.get(`/myclasses/${id}`);
    }
    createClass(data) {
        return this.post("/myclasses", data);
    }
    updateClass(id, data) {
        return this.put(`/myclasses/${id}`, data);
    }
    deleteClass(id) {
        return this.delete(`/myclasses/${id}`);
    }
    // Class Members
    getClassMembers(params) {
        return this.get("/classmembers", params);
    }
    createClassMember(data) {
        return this.post("/classmembers", data);
    }
    updateClassMember(id, data) {
        return this.put(`/classmembers/${id}`, data);
    }
    deleteClassMember(id) {
        return this.delete(`/classmembers/${id}`);
    }
    // Instruments
    getInstrumentTypes() {
        return this.get("/instrument-types");
    }
    createInstrumentType(data) {
        return this.post("/instrument-types", data);
    }
    getInstruments(params) {
        return this.get("/instruments", params);
    }
    getInstrument(id) {
        return this.get(`/instruments/${id}`);
    }
    createInstrument(data) {
        return this.post("/instruments", data);
    }
    updateInstrument(id, data) {
        return this.put(`/instruments/${id}`, data);
    }
    deleteInstrument(id) {
        return this.delete(`/instruments/${id}`);
    }
    getInstrumentAssignments() {
        return this.get("/instrument-assignments");
    }
    createInstrumentAssignment(data) {
        return this.post("/instrument-assignments", data);
    }
    updateInstrumentAssignment(id, data) {
        return this.put(`/instrument-assignments/${id}`, data);
    }
    deleteInstrumentAssignment(id) {
        return this.delete(`/instrument-assignments/${id}`);
    }
    getInstrumentMaintenances() {
        return this.get("/instrument-maintenances");
    }
    createInstrumentMaintenance(data) {
        return this.post("/instrument-maintenances", data);
    }
    // Clothing
    getClothingItems() {
        return this.get("/clothing-items");
    }
    createClothingItem(data) {
        return this.post("/clothing-items", data);
    }
    updateClothingItem(id, data) {
        return this.put(`/clothing-items/${id}`, data);
    }
    deleteClothingItem(id) {
        return this.delete(`/clothing-items/${id}`);
    }
    getClothingAssignments() {
        return this.get("/clothing-assignments");
    }
    createClothingAssignment(data) {
        return this.post("/clothing-assignments", data);
    }
    updateClothingAssignment(id, data) {
        return this.put(`/clothing-assignments/${id}`, data);
    }
    // Training Sessions
    getTrainingSessions(params) {
        return this.get("/training-sessions", params);
    }
    getTrainingSession(id) {
        return this.get(`/training-sessions/${id}`);
    }
    createTrainingSession(data) {
        return this.post("/training-sessions", data);
    }
    updateTrainingSession(id, data) {
        return this.put(`/training-sessions/${id}`, data);
    }
    deleteTrainingSession(id) {
        return this.delete(`/training-sessions/${id}`);
    }
    // Session Attendance
    getSessionAttendances(params) {
        return this.get("/session-attendances", params);
    }
    createSessionAttendance(data) {
        return this.post("/session-attendances", data);
    }
    updateSessionAttendance(id, data) {
        return this.put(`/session-attendances/${id}`, data);
    }
    // Homework
    getHomeworks(params) {
        return this.get("/homeworks", params);
    }
    getHomework(id) {
        return this.get(`/homeworks/${id}`);
    }
    createHomework(data) {
        return this.post("/homeworks", data);
    }
    updateHomework(id, data) {
        return this.put(`/homeworks/${id}`, data);
    }
    deleteHomework(id) {
        return this.delete(`/homeworks/${id}`);
    }
    // Homework Submissions
    getHomeworkSubmissions(params) {
        return this.get("/homework-submissions", params);
    }
    createHomeworkSubmission(data) {
        return this.post("/homework-submissions", data);
    }
    updateHomeworkSubmission(id, data) {
        return this.put(`/homework-submissions/${id}`, data);
    }
    deleteHomeworkSubmission(id) {
        return this.delete(`/homework-submissions/${id}`);
    }
    // Performance Reviews
    getPerformanceReviews() {
        return this.get("/performance-reviews");
    }
    createPerformanceReview(data) {
        return this.post("/performance-reviews", data);
    }
    updatePerformanceReview(id, data) {
        return this.put(`/performance-reviews/${id}`, data);
    }
    // Events
    getEvents() {
        return this.get("/events");
    }
    getEvent(id) {
        return this.get(`/events/${id}`);
    }
    createEvent(data) {
        return this.post("/events", data);
    }
    updateEvent(id, data) {
        return this.put(`/events/${id}`, data);
    }
    deleteEvent(id) {
        return this.delete(`/events/${id}`);
    }
    getEventParticipants(params) {
        return this.get("/event-participants", params);
    }
    createEventParticipant(data) {
        return this.post("/event-participants", data);
    }
    // Library Materials
    getLibraryMaterials() {
        return this.get("/library-materials");
    }
    createLibraryMaterial(data) {
        return this.post("/library-materials", data);
    }
    updateLibraryMaterial(id, data) {
        return this.put(`/library-materials/${id}`, data);
    }
    deleteLibraryMaterial(id) {
        return this.delete(`/library-materials/${id}`);
    }
    // Memberships
    getMemberships() {
        return this.get("/memberships");
    }
    createMembership(data) {
        return this.post("/memberships", data);
    }
    updateMembership(id, data) {
        return this.put(`/memberships/${id}`, data);
    }
    // Reports
    getReportsLogs() {
        return this.get("/reports-logs");
    }
    createReportLog(data) {
        return this.post("/reports-logs", data);
    }
    updateReportLog(id, data) {
        return this.put(`/reports-logs/${id}`, data);
    }
    deleteReportLog(id) {
        return this.delete(`/reports-logs/${id}`);
    }
    // Export endpoints for instruments
    async exportInstrumentsExcel() {
        const response = await fetch(`${this.baseUrl}/instruments/export-excel`, {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error("Export failed");
        return await response.blob();
    }
    async exportInstrumentsCsv() {
        const response = await fetch(`${this.baseUrl}/instruments/export-csv`, {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error("Export failed");
        return await response.blob();
    }
}
const apiClient = new ApiClient(API_BASE_URL);
const api = apiClient;
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/music-club-frontend (2)/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Check if user is already logged in
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getToken();
            if (token) {
                // Fetch current user data to verify token
                fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }).then({
                    "AuthProvider.useEffect": (res)=>res.json()
                }["AuthProvider.useEffect"]).then({
                    "AuthProvider.useEffect": (data)=>{
                        if (data.success && data.data) {
                            setUser(data.data);
                            if ("TURBOPACK compile-time truthy", 1) {
                                localStorage.setItem("user", JSON.stringify(data.data));
                            }
                        } else {
                            // Token invalid, clear it
                            __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].setToken(null);
                            if ("TURBOPACK compile-time truthy", 1) {
                                localStorage.removeItem("user");
                            }
                        }
                    }
                }["AuthProvider.useEffect"]).catch({
                    "AuthProvider.useEffect": ()=>{
                        // Token invalid, clear it
                        __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].setToken(null);
                        if ("TURBOPACK compile-time truthy", 1) {
                            localStorage.removeItem("user");
                        }
                    }
                }["AuthProvider.useEffect"]).finally({
                    "AuthProvider.useEffect": ()=>{
                        setIsLoading(false);
                    }
                }["AuthProvider.useEffect"]);
            } else {
                setIsLoading(false);
            }
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].login(email, password);
            if (response.success && response.data) {
                setUser(response.data.user);
                // Persist user data to localStorage
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }
            }
        } catch (error) {
            throw error;
        }
    };
    const logout = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
        setUser(null);
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem("user");
        }
    };
    const handleSetUser = (newUser)=>{
        setUser(newUser);
        if ("TURBOPACK compile-time truthy", 1) {
            if (newUser) {
                localStorage.setItem("user", JSON.stringify(newUser));
            } else {
                localStorage.removeItem("user");
            }
        }
    };
    const isLeader = ()=>user?.role?.role_name?.toLowerCase() === "leader";
    const isDepartmentLeader = ()=>user?.role?.role_name?.toLowerCase() === "department leader";
    const isClassLeader = ()=>user?.role?.role_name?.toLowerCase() === "class leader";
    const isTrainer = ()=>user?.role?.role_name?.toLowerCase() === "trainer";
    const isTrainee = ()=>user?.role?.role_name?.toLowerCase() === "trainee";
    const hasRole = (roleName)=>user?.role?.role_name?.toLowerCase() === roleName.toLowerCase();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            setUser: handleSetUser,
            login,
            logout,
            isLeader,
            isDepartmentLeader,
            isClassLeader,
            isTrainer,
            isTrainee,
            hasRole
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/music-club-frontend (2)/lib/auth-context.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/music-club-frontend (2)/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/music-club-frontend (2)/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
"[project]/music-club-frontend (2)/node_modules/@vercel/analytics/dist/next/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Analytics",
    ()=>Analytics2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/nextjs/index.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
// src/nextjs/utils.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/navigation.js [app-client] (ecmascript)");
"use client";
;
;
// package.json
var name = "@vercel/analytics";
var version = "1.6.0";
// src/queue.ts
var initQueue = ()=>{
    if (window.va) return;
    window.va = function a(...params) {
        (window.vaq = window.vaq || []).push(params);
    };
};
// src/utils.ts
function isBrowser() {
    return typeof window !== "undefined";
}
function detectEnvironment() {
    try {
        const env = ("TURBOPACK compile-time value", "development");
        if ("TURBOPACK compile-time truthy", 1) {
            return "development";
        }
    } catch (e) {}
    return "production";
}
function setMode(mode = "auto") {
    if (mode === "auto") {
        window.vam = detectEnvironment();
        return;
    }
    window.vam = mode;
}
function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
}
function isDevelopment() {
    return getMode() === "development";
}
function computeRoute(pathname, pathParams) {
    if (!pathname || !pathParams) {
        return pathname;
    }
    let result = pathname;
    try {
        const entries = Object.entries(pathParams);
        for (const [key, value] of entries){
            if (!Array.isArray(value)) {
                const matcher = turnValueToRegExp(value);
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[${key}]`);
                }
            }
        }
        for (const [key, value] of entries){
            if (Array.isArray(value)) {
                const matcher = turnValueToRegExp(value.join("/"));
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[...${key}]`);
                }
            }
        }
        return result;
    } catch (e) {
        return pathname;
    }
}
function turnValueToRegExp(value) {
    return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getScriptSrc(props) {
    if (props.scriptSrc) {
        return props.scriptSrc;
    }
    if (isDevelopment()) {
        return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
        return `${props.basePath}/insights/script.js`;
    }
    return "/_vercel/insights/script.js";
}
// src/generic.ts
function inject(props = {
    debug: true
}) {
    var _a;
    if (!isBrowser()) return;
    setMode(props.mode);
    initQueue();
    if (props.beforeSend) {
        (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
    }
    const src = getScriptSrc(props);
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = name + (props.framework ? `/${props.framework}` : "");
    script.dataset.sdkv = version;
    if (props.disableAutoTrack) {
        script.dataset.disableAutoTrack = "1";
    }
    if (props.endpoint) {
        script.dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
        script.dataset.endpoint = `${props.basePath}/insights`;
    }
    if (props.dsn) {
        script.dataset.dsn = props.dsn;
    }
    script.onerror = ()=>{
        const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
        console.log(`[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`);
    };
    if (isDevelopment() && props.debug === false) {
        script.dataset.debug = "false";
    }
    document.head.appendChild(script);
}
function pageview({ route, path }) {
    var _a;
    (_a = window.va) == null ? void 0 : _a.call(window, "pageview", {
        route,
        path
    });
}
// src/react/utils.ts
function getBasePath() {
    if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] === "undefined" || typeof __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env === "undefined") {
        return void 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
}
// src/react/index.tsx
function Analytics(props) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            var _a;
            if (props.beforeSend) {
                (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
            }
        }
    }["Analytics.useEffect"], [
        props.beforeSend
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            inject({
                framework: props.framework || "react",
                basePath: props.basePath ?? getBasePath(),
                ...props.route !== void 0 && {
                    disableAutoTrack: true
                },
                ...props
            });
        }
    }["Analytics.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            if (props.route && props.path) {
                pageview({
                    route: props.route,
                    path: props.path
                });
            }
        }
    }["Analytics.useEffect"], [
        props.route,
        props.path
    ]);
    return null;
}
;
var useRoute = ()=>{
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    if (!params) {
        return {
            route: null,
            path
        };
    }
    const finalParams = Object.keys(params).length ? params : Object.fromEntries(searchParams.entries());
    return {
        route: computeRoute(path, finalParams),
        path
    };
};
function getBasePath2() {
    if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] === "undefined" || typeof __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env === "undefined") {
        return void 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
}
// src/nextjs/index.tsx
function AnalyticsComponent(props) {
    const { route, path } = useRoute();
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(Analytics, {
        path,
        route,
        ...props,
        basePath: getBasePath2(),
        framework: "next"
    });
}
function Analytics2(props) {
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: null
    }, /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(AnalyticsComponent, {
        ...props
    }));
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/music-club-frontend (2)/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=music-club-frontend%20%282%29_3d6c977d._.js.map