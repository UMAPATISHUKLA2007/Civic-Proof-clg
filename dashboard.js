/* ==========================================
   CIVIPROOF — DYNAMIC CITIZEN DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const $ = (selector) => document.querySelector(selector);
    const byId = (id) => document.getElementById(id);

    // USER NAME
    const currentUser = (
        localStorage.getItem("userName") || ""
    ).trim();

    const welcomeName = byId("userName");

    if (welcomeName) {
        welcomeName.textContent = currentUser || "Guest";
    }

    // GET COMPLAINTS FROM STORAGE
    function getAllComplaints() {
        try {
            const data = JSON.parse(
                localStorage.getItem("civiproofComplaints") || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    // Only show complaints belonging to the current user.
    function getMyComplaints() {
        if (!currentUser) return [];

        const normalize = (name) =>
            String(name || "").trim().toLowerCase();

        return getAllComplaints().filter(complaint =>
            normalize(complaint.userName) === normalize(currentUser)
        );
    }

    function normalizeStatus(status) {
        const value = String(status || "")
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, " ");

        if (["resolved", "completed", "closed", "fixed"].includes(value)) {
            return "resolved";
        }

        if ([
            "in progress",
            "processing",
            "under review",
            "assigned"
        ].includes(value)) {
            return "in progress";
        }

        return "pending";
    }

    // UPDATE COUNTS AND DASHBOARD
    function updateDashboard() {
        const complaints = getMyComplaints();

        const total = complaints.length;

        const resolved = complaints.filter(
            c => normalizeStatus(c.status) === "resolved"
        ).length;

        const inProgress = complaints.filter(
            c => normalizeStatus(c.status) === "in progress"
        ).length;

        // Pending complaints are included in total reports.
        setText("totalReports", total);
        setText("inProgress", inProgress);
        setText("resolvedIssues", resolved);

        // Example impact rule: 20 points per resolved complaint.
        const impactScore = resolved * 20;

        const scoreElement = $(
            'main > section:nth-child(4) h3'
        );

        if (scoreElement) {
            scoreElement.textContent = `⭐ ${impactScore} Points`;
        }

        const badgeElement = $(
            'main > section:nth-child(4) p'
        );

        if (badgeElement) {
            let badge = "New Citizen";

            if (impactScore >= 500) {
                badge = "Civic Champion";
            } else if (impactScore >= 200) {
                badge = "Civic Hero";
            } else if (impactScore >= 100) {
                badge = "Active Citizen";
            }

            badgeElement.textContent = `Badge: ${badge}`;
        }

        updateComplaintTracker(complaints);
        updateRecentActivity(complaints);
    }

    function setText(id, value) {
        const element = byId(id);

        if (element) {
            element.textContent = value;
        }
    }

    // ACTIVE COMPLAINT TRACKER
    function updateComplaintTracker(complaints) {
        const section = $("main > section:nth-child(3)");

        if (!section) return;

        const activeComplaint = [...complaints]
            .reverse()
            .find(c => normalizeStatus(c.status) !== "resolved");

        const heading = section.querySelector("h3");
        const paragraphs = section.querySelectorAll("p");
        const progress = section.querySelector("progress");
        const buttons = section.querySelectorAll("button");

        if (!activeComplaint) {
            if (heading) heading.textContent = "No Active Complaints";

            if (progress) progress.value = 0;

            if (paragraphs[0]) {
                paragraphs[0].textContent = "Progress: 0%";
            }

            if (paragraphs[1]) {
                paragraphs[1].textContent =
                    "Status: No active complaint";
            }

            if (buttons[0]) buttons[0].disabled = true;
            if (buttons[1]) buttons[1].disabled = true;

            return;
        }

        if (buttons[0]) buttons[0].disabled = false;
        if (buttons[1]) buttons[1].disabled = false;

        const status = normalizeStatus(activeComplaint.status);

        const progressValue = status === "in progress"
            ? Math.max(1, Math.min(
                99,
                Number(activeComplaint.progress) || 50
            ))
            : 0;

        if (heading) {
            heading.textContent =
                activeComplaint.title || "Civic Complaint";
        }

        if (progress) {
            progress.value = progressValue;
            progress.max = 100;
        }

        if (paragraphs[0]) {
            paragraphs[0].textContent =
                `Progress: ${progressValue}%`;
        }

        if (paragraphs[1]) {
            paragraphs[1].textContent =
                `Status: ${status.replace(/\b\w/g, c => c.toUpperCase())}`;
        }

        if (buttons[0]) {
            buttons[0].onclick = () => {
                const id = activeComplaint.id;

                if (id) {
                    localStorage.setItem(
                        "selectedComplaintId",
                        String(id)
                    );
                }

                window.location.href = "my-reports.html";
            };
        }

        if (buttons[1]) {
            buttons[1].onclick = () => {
                alert(
                    "Reminder request is ready. Connect a backend API " +
                    "to send it to the concerned authority."
                );
            };
        }
    }

    // RECENT ACTIVITY
    function updateRecentActivity(complaints) {
        const list = byId("recentActivity");

        if (!list) return;

        list.replaceChildren();

        const activities = complaints
            .flatMap(complaint => {
                const entries = Array.isArray(complaint.activity)
                    ? complaint.activity
                    : [];

                if (entries.length) {
                    return entries.map(entry => ({
                        message: typeof entry === "string"
                            ? entry
                            : entry.message,
                        date: typeof entry === "object"
                            ? entry.date || ""
                            : ""
                    }));
                }

                return [{
                    message:
                        `${complaint.title || "Complaint"} — ` +
                        `${normalizeStatus(complaint.status)}`,
                    date: complaint.updatedAt ||
                          complaint.createdAt || ""
                }];
            })
            .sort((a, b) =>
                new Date(b.date || 0) - new Date(a.date || 0)
            )
            .slice(0, 5);

        if (!activities.length) {
            const item = document.createElement("li");
            item.textContent = "No complaint activity yet.";
            list.appendChild(item);
            return;
        }

        activities.forEach(activity => {
            const item = document.createElement("li");
            item.textContent = String(
                activity.message || "Complaint updated"
            );
            list.appendChild(item);
        });
    }

    // REWARDS BUTTON
    window.redeemRewards = function () {
        window.location.href = "rewards.html";
    };

    // INITIAL LOAD
    updateDashboard();

    // Refresh when another page updates localStorage.
    window.addEventListener("storage", event => {
        if (
            event.key === "civiproofComplaints" ||
            event.key === "userName"
        ) {
            location.reload();
        }
    });

    // Refresh if the same tab returns from another page.
    window.addEventListener("pageshow", updateDashboard);

});