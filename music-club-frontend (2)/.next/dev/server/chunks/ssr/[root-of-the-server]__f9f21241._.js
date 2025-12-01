module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/music-club-frontend (2)/lib/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "apiClient",
    ()=>apiClient,
    "default",
    ()=>__TURBOPACK__default__export__
]);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
class ApiClient {
    baseUrl;
    token = null;
    constructor(baseUrl){
        this.baseUrl = baseUrl;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    setToken(token) {
        this.token = token;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
}),
"[project]/music-club-frontend (2)/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/music-club-frontend (2)/lib/api-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check if user is already logged in
        const token = __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getToken();
        if (token) {
            // Fetch current user data to verify token
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }).then((res)=>res.json()).then((data)=>{
                if (data.success && data.data) {
                    setUser(data.data);
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                } else {
                    // Token invalid, clear it
                    __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].setToken(null);
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                }
            }).catch(()=>{
                // Token invalid, clear it
                __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].setToken(null);
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }).finally(()=>{
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].login(email, password);
            if (response.success && response.data) {
                setUser(response.data.user);
                // Persist user data to localStorage
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }
        } catch (error) {
            throw error;
        }
    };
    const logout = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].logout();
        setUser(null);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    const handleSetUser = (newUser)=>{
        setUser(newUser);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            setUser: handleSetUser,
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/music-club-frontend (2)/lib/auth-context.tsx",
        lineNumber: 116,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$music$2d$club$2d$frontend__$28$2$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f9f21241._.js.map