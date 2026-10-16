document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       NAVBAR ACTIVE LINK
    ========================== */

    const navLinks = document.querySelectorAll(".nav-link");
    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach((link) => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        }

        link.addEventListener("click", function () {

            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            this.classList.add("active");
        });
    });


    /* =========================
       COMPLAINT BUTTON
    ========================== */

    const complaintButton =
        document.querySelector(".complaint-btn");

    if (complaintButton) {

        complaintButton.addEventListener("click", function () {

            const complaintPage =
                this.getAttribute("href");

            if (complaintPage &&
                complaintPage !== "#") {

                window.location.href = complaintPage;

            } else {

                console.log(
                    "Complaint page is not connected yet."
                );

            }
        });
    }


    /* =========================
       STEP CARD SCROLL ANIMATION
    ========================== */

    const stepCards =
        document.querySelectorAll(".step-card");

    if ("IntersectionObserver" in window) {

        const cardObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {

                            entry.target.style.opacity = "1";

                            entry.target.style.transform =
                                "translateY(0)";

                            observer.unobserve(
                                entry.target
                            );
                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );


        stepCards.forEach((card, index) => {

            card.style.opacity = "0";

            card.style.transform =
                "translateY(35px)";

            card.style.transition =
                `opacity 0.6s ease ${index * 0.08}s,
                 transform 0.6s ease ${index * 0.08}s`;

            cardObserver.observe(card);

        });

    } else {

        stepCards.forEach((card) => {

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        });

    }


    /* =========================
       NAVBAR KEYBOARD SUPPORT
    ========================== */

    navLinks.forEach((link) => {

        link.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                link.click();
            }

        });

    });


    /* =========================
       SMOOTH PAGE LOAD
    ========================== */

    document.body.classList.add("page-loaded");


    /* =========================
       CIVIPROOF CONSOLE MESSAGE
    ========================== */

    console.log(
        "%c CiviProof ",
        "background:#0875ed;color:white;padding:8px 14px;border-radius:8px;font-size:16px;font-weight:bold;"
    );

    console.log(
        "%c Together for a Better Society 💙",
        "color:#0875ed;font-size:13px;font-weight:bold;"
    );

});