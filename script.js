// ========================================
// PERIODICX - INTERACTIVE PERIODIC TABLE
// HTML + CSS + JavaScript + Bootstrap
// ========================================

// DOM Elements
const periodicTable = document.getElementById("periodicTable");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const searchMessage = document.getElementById("searchMessage");
const loadingMessage = document.getElementById("loadingMessage");
const filterButtons = document.getElementById("filterButtons");

const elementModalElement = document.getElementById("elementModal");
const compoundModalElement = document.getElementById("compoundModal");

const elementModal = new bootstrap.Modal(elementModalElement);
const compoundModal = new bootstrap.Modal(compoundModalElement);

// Store all elements
let elements = [];
let activeCategory = "all";

// Category colors
const categoryColors = {
    "alkali metal": "alkali-metal",
    "alkaline earth metal": "alkaline-earth-metal",
    "transition metal": "transition-metal",
    "post-transition metal": "post-transition-metal",
    "metalloid": "metalloid",
    "diatomic nonmetal": "nonmetal",
    "polyatomic nonmetal": "nonmetal",
    "nonmetal": "nonmetal",
    "halogen": "halogen",
    "noble gas": "noble-gas",
    "lanthanide": "lanthanide",
    "actinide": "actinide",
    "unknown": "unknown"
};


// ========================================
// 1. LOAD ALL 118 ELEMENTS
// ========================================

async function loadElements() {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json"
        );

        if (!response.ok) {
            throw new Error("Unable to load element data.");
        }

        const data = await response.json();

        elements = data.elements;

        renderPeriodicTable(elements);

        document.getElementById("elementCount").textContent =
            elements.length;

        loadingMessage.style.display = "none";

    } catch (error) {
        loadingMessage.innerHTML = `
            <div class="alert alert-danger">
                <h5>Unable to load the periodic table!</h5>
                <p>
                    Please check your internet connection and reload
                    the page.
                </p>
                <button class="btn btn-light" onclick="loadElements()">
                    Try Again
                </button>
            </div>
        `;

        console.error("Error loading elements:", error);
    }
}


// ========================================
// 2. GET CATEGORY CSS CLASS
// ========================================

function getCategoryClass(category) {
    const normalizedCategory = (category || "unknown")
        .toLowerCase()
        .trim();

    return categoryColors[normalizedCategory] || "unknown";
}


// ========================================
// 3. RENDER PERIODIC TABLE
// ========================================

function renderPeriodicTable(data) {
    periodicTable.innerHTML = "";

    data.forEach((element, index) => {

        const category = element.category || "unknown";
        const categoryClass = getCategoryClass(category);

        // Use the actual periodic table coordinates.
        // xpos = column, ypos = row.
        const column = Number(element.xpos);
        const row = Number(element.ypos);

        if (
            !Number.isInteger(column) ||
            !Number.isInteger(row) ||
            column < 1 ||
            column > 18 ||
            row < 1 ||
            row > 9
        ) {
            console.warn(
                "Skipping element with invalid coordinates:",
                element.name
            );
            return;
        }

        const card = document.createElement("button");

        card.type = "button";
        card.className = `element-card ${categoryClass}`;

        card.style.gridColumn = column;
        card.style.gridRow = row;
        card.style.animationDelay = `${Math.min(index * 4, 400)}ms`;

        card.dataset.number = element.number;
        card.dataset.symbol = element.symbol;
        card.dataset.name = element.name.toLowerCase();
        card.dataset.category = category.toLowerCase();

        card.setAttribute(
            "aria-label",
            `${element.name}, atomic number ${element.number}`
        );

        card.title = `${element.name} (${element.symbol})`;

        card.innerHTML = `
            <span class="atomic-number">
                ${element.number}
            </span>

            <span class="symbol">
                ${element.symbol}
            </span>

            <span class="element-name">
                ${element.name}
            </span>

            <span class="atomic-mass">
                ${formatValue(element.atomic_mass)}
            </span>
        `;

        // Open modal when element is clicked
        card.addEventListener("click", () => {
            showElementDetails(element);
        });

        periodicTable.appendChild(card);
    });

    applyCategoryFilter();
}


// ========================================
// 4. FORMAT DATA VALUES
// ========================================

function formatValue(value, unit = "") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not available";
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "Not available";
        }

        return value.join(", ") + unit;
    }

    return String(value) + unit;
}


// Convert Kelvin to Celsius
function kelvinToCelsius(value) {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return "Not available";
    }

    const celsius = Number(value) - 273.15;

    return `${celsius.toFixed(2)} °C`;
}


// ========================================
// 5. OPEN ELEMENT DETAILS MODAL
// ========================================

function showElementDetails(element) {

    const category = element.category || "Unknown";
    const categoryClass = getCategoryClass(category);

    document.getElementById("modalElementName").textContent =
        element.name;

    document.getElementById("modalElementTitle").textContent =
        element.name;

    document.getElementById("modalAtomicNumber").textContent =
        element.number;

    document.getElementById("modalSymbol").textContent =
        element.symbol;

    document.getElementById("modalAtomicMass").textContent =
        formatValue(element.atomic_mass);

    document.getElementById("modalCategory").textContent =
        category;

    document.getElementById("modalSummary").textContent =
        element.summary ||
        `Explore the atomic and physical properties of ${element.name}.`;

    document.getElementById("modalAbout").textContent =
        `The chemical symbol for ${element.name} is ${element.symbol}. ` +
        `Its atomic number is ${element.number}. ` +
        `Its category is ${category}. ` +
        `The electron configuration is ${formatValue(
            element.electron_configuration
        )}.`;

    // Change element card color
    const modalCard = document.getElementById("modalElementCard");

    modalCard.className = `big-element ${categoryClass}`;

    // Properties for the modal
    const properties = [
        {
            label: "Atomic Number",
            value: element.number
        },
        {
            label: "Atomic Mass",
            value: formatValue(element.atomic_mass, " u")
        },
        {
            label: "Chemical Symbol",
            value: element.symbol
        },
        {
            label: "Element Name",
            value: element.name
        },
        {
            label: "Category",
            value: category
        },
        {
            label: "Group",
            value: formatValue(element.group)
        },
        {
            label: "Period",
            value: formatValue(element.period)
        },
        {
            label: "Block",
            value: formatValue(element.block)
        },
        {
            label: "Physical State",
            value: formatValue(element.phase)
        },
        {
            label: "Electron Configuration",
            value: formatValue(element.electron_configuration)
        },
        {
            label: "Electron Configuration (Short)",
            value: formatValue(element.electron_configuration_semantic)
        },
        {
            label: "Electronegativity",
            value: formatValue(element.electronegativity_pauling)
        },
        {
            label: "Density",
            value: formatValue(element.density)
        },
        {
            label: "Melting Point",
            value: kelvinToCelsius(element.melt)
        },
        {
            label: "Boiling Point",
            value: kelvinToCelsius(element.boil)
        },
        {
            label: "Discovered By",
            value: formatValue(element.discovered_by)
        },
        {
            label: "Named By",
            value: formatValue(element.named_by)
        },
        {
            label: "Appearance",
            value: formatValue(element.appearance)
        },
        {
            label: "Electron Shells",
            value: formatValue(element.shells)
        },
        {
            label: "Molar Heat Capacity",
            value: formatValue(element.molar_heat, " J/(mol·K)")
        },
        {
            label: "Electron Affinity",
            value: formatValue(element.electron_affinity, " kJ/mol")
        }
    ];

    const propertiesContainer =
        document.getElementById("modalProperties");

    propertiesContainer.innerHTML = "";

    properties.forEach(property => {

        const box = document.createElement("div");

        box.className = "property-box";

        const label = document.createElement("span");
        label.textContent = property.label;

        const value = document.createElement("strong");
        value.textContent = property.value;

        box.appendChild(label);
        box.appendChild(value);

        propertiesContainer.appendChild(box);
    });

    // Show Bootstrap modal
    elementModal.show();
}


// ========================================
// 6. SEARCH ELEMENTS AND COMPOUNDS
// ========================================

function searchElements() {

    const query = searchInput.value.trim().toLowerCase();

    searchMessage.textContent = "";

    if (!query) {
        searchMessage.textContent =
            "Please enter an element name, symbol, atomic number or formula.";

        searchInput.focus();
        return;
    }

    // Special search for water
    const normalizedFormula = query.replace(/\s+/g, "");

    if (
        normalizedFormula === "h2o" ||
        normalizedFormula === "h₂o" ||
        normalizedFormula === "water"
    ) {
        elementModal.hide();
        compoundModal.show();
        return;
    }

    // Search by name, symbol or atomic number
    const matches = elements.filter(element => {

        const name = element.name.toLowerCase();
        const symbol = element.symbol.toLowerCase();
        const number = String(element.number);

        return (
            name === query ||
            symbol === query ||
            number === query
        );
    });

    if (matches.length === 1) {

        const element = matches[0];

        // Remove previous category filtering
        activeCategory = "all";

        updateActiveFilterButton();
        applyCategoryFilter();

        // Highlight the selected card
        highlightElement(element);

        // Open its details modal
        showElementDetails(element);

        searchMessage.textContent =
            `Showing ${element.name} (${element.symbol}).`;

    } else if (matches.length > 1) {

        searchMessage.textContent =
            "Multiple results found. Please enter a more specific search.";

    } else {

        searchMessage.textContent =
            "No matching element found. Try a name, symbol or atomic number.";
    }
}


// ========================================
// 7. HIGHLIGHT SEARCHED ELEMENT
// ========================================

function highlightElement(element) {

    document.querySelectorAll(".element-card").forEach(card => {

        card.classList.remove("search-match");

        if (
            Number(card.dataset.number) === Number(element.number)
        ) {
            card.classList.add("search-match");

            card.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        }
    });
}


// ========================================
// 8. CATEGORY FILTER BUTTONS
// ========================================

filterButtons.addEventListener("click", event => {

    const button = event.target.closest(".filter-btn");

    if (!button) {
        return;
    }

    activeCategory = button.dataset.category;

    updateActiveFilterButton();
    applyCategoryFilter();

    searchMessage.textContent = "";
});


function updateActiveFilterButton() {

    document.querySelectorAll(".filter-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category === activeCategory
        );
    });
}


function applyCategoryFilter() {

    document.querySelectorAll(".element-card").forEach(card => {

        const category = card.dataset.category;

        const matches =
            activeCategory === "all" ||
            category === activeCategory;

        card.classList.toggle("filtered-out", !matches);

        card.disabled = !matches;
    });
}


// ========================================
// 9. RESET EVERYTHING
// ========================================

function resetTable() {

    searchInput.value = "";
    searchMessage.textContent = "";

    activeCategory = "all";

    updateActiveFilterButton();
    applyCategoryFilter();

    document.querySelectorAll(".element-card").forEach(card => {

        card.classList.remove("search-match");
        card.disabled = false;
    });

    elementModal.hide();
    compoundModal.hide();
}


// ========================================
// 10. EVENT LISTENERS
// ========================================

searchBtn.addEventListener("click", searchElements);

resetBtn.addEventListener("click", resetTable);

document.getElementById("waterBtn").addEventListener("click", () => {

    elementModal.hide();
    compoundModal.show();
});

searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        searchElements();
    }

    if (event.key === "Escape") {
        resetTable();
    }
});


// ========================================
// 11. START APPLICATION
// ========================================

loadElements();