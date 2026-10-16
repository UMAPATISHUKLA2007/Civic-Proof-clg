/* =====================================================
   CIVIPROOF — MY REPORTS PAGE
   Dynamic Complaints + Filters + Status Counts
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("reportsHistoryContainer");
    const filterButtons = document.querySelectorAll(".filter-tab-btn");

    if (!container) {
        console.error("My Reports container not found!");
        return;
    }

    // 1. Current logged-in user identify karo
    function getCurrentUser() {
        const possibleKeys = [
            "loggedInUser",
            "currentUser",
            "user",
            "civiproofUser"
        ];

        for (const key of possibleKeys) {
            try {
                const value = localStorage.getItem(key);
                if (!value) continue;

                const parsed = JSON.parse(value);

                if (parsed && typeof parsed === "object") {
                    return {
                        id: parsed.id || parsed.userId || parsed.email || "",
                        name: parsed.name || parsed.fullName || "",
                        email: parsed.email || ""
                    };
                }
            } catch (error) {
                // Agar value plain text hai, toh safely ignore karo.
            }
        }

        return null;
    }

    // 2. Saved complaint data read karo
    function getSavedReports() {
        const possibleKeys = [
            "complaints",
            "reports",
            "civiproofComplaints",
            "myReports"
        ];

        for (const key of possibleKeys) {
            try {
                const saved = localStorage.getItem(key);

                if (saved === null) continue;

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }

                if (parsed && Array.isArray(parsed.complaints)) {
                    return parsed.complaints;
                }

                if (parsed && Array.isArray(parsed.reports)) {
                    return parsed.reports;
                }
            } catch (error) {
                console.error("Unable to read reports:", error);
            }
        }

        return [];
    }

    // 3. Status ko standard format mein convert karo
    function normalizeStatus(status) {
        const value = String(status || "Submitted")
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .trim();

        if (value === "resolved" || value === "completed") {
            return "Resolved";
        }

        if (
            value === "in progress" ||
            value === "processing" ||
            value === "under process"
        ) {
            return "In Progress";
        }

        if (value === "closed" || value === "rejected") {
            return "Closed";
        }

        return "Submitted";
    }

    // 4. HTML injection se bachne ke liye text safe rakho
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // 5. Report fields ko common format mein lao
    function normalizeReport(report, index) {
        const rawStatus =
            report.status ||
            report.complaintStatus ||
            report.currentStatus;

        return {
            id: String(
                report.id ||
                report.complaintId ||
                report.reportId ||
                `CP-${String(index + 1).padStart(4, "0")}`
            ),

            title:
                report.title ||
                report.complaintTitle ||
                report.category ||
                report.issueType ||
                "Civic Issue",

            description:
                report.description ||
                report.details ||
                report.complaintDescription ||
                "No description provided.",

            location:
                report.location ||
                report.address ||
                report.addressText ||
                "Location not provided",

            date:
                report.date ||
                report.createdAt ||
                report.timestamp ||
                "",

            status: normalizeStatus(rawStatus),

            userId: String(
                report.userId ||
                report.userID ||
                report.userEmail ||
                report.email ||
                ""
            ),

            userName: String(
                report.userName ||
                report.fullName ||
                report.name ||
                ""
            )
        };
    }

    // 6. Current user ke reports select karo
    function getMyReports() {
        const reports = getSavedReports().map(normalizeReport);
        const currentUser = getCurrentUser();

        // Agar login user identify nahi hua, toh
        // doosre users ka data galti se show nahi karna.
        if (!currentUser) {
            return [];
        }

        const userIdentifiers = [
            currentUser.id,
            currentUser.email
        ]
            .filter(Boolean)
            .map(value => value.toLowerCase());

        return reports.filter(report => {
            const reportIdentifiers = [
                report.userId
            ]
                .filter(Boolean)
                .map(value => value.toLowerCase());

            // Name ko akela identity proof nahi maante.
            return reportIdentifiers.some(id =>
                userIdentifiers.includes(id)
            );
        });
    }

    // 7. Date ko readable format mein show karo
    function formatDate(value) {
        if (!value) return "Date not available";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // 8. Status ke liye CSS class
    function statusClass(status) {
        return status.toLowerCase().replace(/\s+/g, "-");
    }

    let activeFilter = "All";

    // 9. Filter badges ke counts update karo
    function updateCounts(reports) {
        const counts = {
            "All": reports.length,
            "Submitted": 0,
            "In Progress": 0,
            "Resolved": 0,
            "Closed": 0
        };

        reports.forEach(report => {
            if (Object.hasOwn(counts, report.status)) {
                counts[report.status]++;
            }
        });

        filterButtons.forEach(button => {
            const label = button.childNodes[0]?.textContent?.trim();
            const badge = button.querySelector(".tab-badge");

            if (badge && Object.hasOwn(counts, label)) {
                badge.textContent = counts[label];
            }
        });
    }

    // 10. Empty state show karo
    function showEmptyState(message) {
        container.innerHTML = `
            <div class="empty-history-box">
                <div class="empty-icon">📂</div>
                <h3>No Reports Found</h3>
                <p>${escapeHTML(message)}</p>
            </div>
        `;
    }

    // 11. Report details dialog
    function showReportDetails(report) {
        let dialog = document.getElementById("reportDetailsDialog");

        if (!dialog) {
            dialog = document.createElement("dialog");
            dialog.id = "reportDetailsDialog";

            dialog.style.cssText = `
                width: min(92%, 520px);
                max-height: 85vh;
                overflow-y: auto;
                margin: auto;
                padding: 28px;
                border: 1px solid #dce8f8;
                border-radius: 22px;
                color: #10275a;
                box-shadow: 0 20px 70px rgba(0,0,0,.22);
            `;

            document.body.appendChild(dialog);
        }

        dialog.innerHTML = `
            <h2 style="margin-bottom:18px;">
                Complaint Details
            </h2>

            <p><strong>Complaint ID:</strong>
                ${escapeHTML(report.id)}</p>

            <p style="margin-top:12px;">
                <strong>Title:</strong>
                ${escapeHTML(report.title)}
            </p>

            <p style="margin-top:12px;">
                <strong>Description:</strong>
                ${escapeHTML(report.description)}
            </p>

            <p style="margin-top:12px;">
                <strong>Location:</strong>
                ${escapeHTML(report.location)}
            </p>

            <p style="margin-top:12px;">
                <strong>Date:</strong>
                ${escapeHTML(formatDate(report.date))}
            </p>

            <p style="margin-top:12px;">
                <strong>Status:</strong>
                ${escapeHTML(report.status)}
            </p>

            <button id="closeReportDialog"
                style="
                    margin-top:22px;
                    padding:12px 20px;
                    background:#0875ed;
                    color:white;
                    border:0;
                    border-radius:12px;
                    cursor:pointer;
                    font-weight:700;
                ">
                Close
            </button>
        `;

        if (!dialog.open) {
            dialog.showModal();
        }

        dialog.querySelector("#closeReportDialog")
            .addEventListener("click", () => dialog.close());
    }

    // 12. Report cards render karo
    function renderReports() {
        const reports = getMyReports();

        updateCounts(reports);

        const filteredReports = activeFilter === "All"
            ? reports
            : reports.filter(report =>
                report.status === activeFilter
            );

        if (filteredReports.length === 0) {
            showEmptyState(
                activeFilter === "All"
                    ? "Aapke account se koi complaint linked nahi hai. Complaint submit karne ke baad yahan dikhegi."
                    : `Abhi "${activeFilter}" status mein koi complaint nahi hai.`
            );
            return;
        }

        container.innerHTML = filteredReports.map(report => `
            <article class="report-history-card">
                <div class="report-info-col">
                    <h3>${escapeHTML(report.title)}</h3>

                    <p>
                        ${escapeHTML(report.description)}
                    </p>

                    <p>
                        📍 ${escapeHTML(report.location)}
                    </p>

                    <p>
                        📅 ${escapeHTML(formatDate(report.date))}
                    </p>
                </div>

                <div class="report-status-col">
                    <span class="status-pill ${statusClass(report.status)}">
                        ${escapeHTML(report.status)}
                    </span>

                    <span class="report-id-text">
                        ID: ${escapeHTML(report.id)}
                    </span>
                </div>

                <div class="report-action-col">
                    <button
                        type="button"
                        data-report-id="${escapeHTML(report.id)}"
                        class="view-report-btn">
                        View Details →
                    </button>
                </div>
            </article>
        `).join("");

        container.querySelectorAll(".view-report-btn")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const selectedReport = filteredReports.find(
                        report => report.id === button.dataset.reportId
                    );

                    if (selectedReport) {
                        showReportDetails(selectedReport);
                    }
                });
            });
    }

    // 13. Filter buttons activate karo
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const label = button.childNodes[0]?.textContent?.trim();

            const allowedFilters = [
                "All",
                "Submitted",
                "In Progress",
                "Resolved",
                "Closed"
            ];

            if (!allowedFilters.includes(label)) return;

            activeFilter = label;

            filterButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            renderReports();
        });
    });

    // 14. Page open hote hi reports load karo
    renderReports();

    // Optional: same browser ke doosre tab mein data change ho
    window.addEventListener("storage", event => {
        if (
            !event.key ||
            [
                "complaints",
                "reports",
                "civiproofComplaints",
                "myReports",
                "loggedInUser",
                "currentUser",
                "user",
                "civiproofUser"
            ].includes(event.key)
        ) {
            renderReports();
        }
    });

});